const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const UpdatePresets = require('./presets.js')
const path = require('path')
const axios = require('axios');
const fs = require('fs');
const eventNames = [];
const eventIds = [];
let varValues = {};
let boardInfo;
const boardNames = [];
let boardValues = {};

class ModuleInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
  }

  async init(config) {
    this.config = config
    this.updateStatus(InstanceStatus.Ok)
    this.updatePresets()
    this.updateActions() // export actions
    this.updateFeedbacks() // export feedbacks
    this.updateVariableDefinitions() // export variable definitions
    this.assignBoardNamesToVars()
  }
  // When module gets deleted
  async destroy() {
    this.log('debug', 'destroy')
  }

  async configUpdated(config) {
    this.config = config
  }

  // Return config fields for web config
  getConfigFields() {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'ASB IP Address',
        tooltip: 'The IP of the ASB Computer',
        width: 6,
        regex: Regex.IP,
      },
      {
        type: 'textinput',
        id: 'port',
        label: 'ASB Port Number (default 5833)',
        tooltip: 'The Port Number that ASB is listening on.',
        width: 6,
        default: '5833',
        regex: Regex.PORT,
      },
    ]
  }

  updateActions() {
    UpdateActions(this)
  }

  updateFeedbacks() {
    UpdateFeedbacks(this)
  }

  updateVariableDefinitions() {
    UpdateVariableDefinitions(this)
  }

  updatePresets() {
    UpdatePresets(this)
  }

  async assignBoardNamesToVars() {

    const url = 'http://' + this.config.host + ':' + this.config.port;
    const boardInfoRequest = {
      method: 'get',
      url: `${url}/boards/`,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const response = await axios(boardInfoRequest);
    boardInfo = response.data;
    for (let i = 0; i < boardInfo.length; i++) {
      boardNames[i] = { variableId: `board${i}Name`, name: `board${i}Name` };
    }
    this.setVariableDefinitions(boardNames);
    for (let i = 0; i < boardInfo.length; i++) {
      boardValues[`board${i}Name`] = boardInfo[i].name
    }
    this.setVariableValues(boardValues);
  }

  executeAction = async (action) => {
    const self = this;
    const url = 'http://' + self.config.host + ':' + self.config.port;

    let reqMethod, boardAction, boardName;

    switch (action.actionId) {
      case 'start_board':
        const boardPosition = action.options.board_position;
        if (boardPosition) {

          const boardPositionArray = boardPosition.split(",");
          const boardPosX = boardPositionArray[0];
          const boardPosY = boardPositionArray[1];
          boardAction = `start?x=${boardPosX}&y=${boardPosY}`;
        } else {
          boardAction = 'start';
        }
        reqMethod = 'POST';
        boardName = action.options.board_name;
        break;

      case 'stop_board':
        reqMethod = 'POST';
        boardAction = 'stop';
        boardName = action.options.board_name;
        break;

      case 'set_data':
        reqMethod = 'POST';
        let event_id = await this.parseVariablesInString(action.options.event_id);
        boardAction = `set-data?id=${encodeURIComponent(event_id)}`;
        boardName = action.options.board_name;
        break;

      case 'get_data':
        reqMethod = 'GET';
        boardAction = 'get-options';
        boardName = action.options.board_name;
        break;
    }

    // Compile the Axios request to be made
    const requestData = {
      method: reqMethod,
      url: `${url}/boards/${encodeURIComponent(boardName)}/${boardAction}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    axios(requestData)
      .then((response) => {

        //this.log('info', response.status);
        //console.log(boardAction)
        const boardData = response.data;
        //console.log(boardData);

        if (boardAction === 'get-options') {
          if (varValues) { /* clear the variables before redefining, otherwise variable values for definitions persist even though the variables were removed from the list of defined variables */
            let keys = Object.keys(varValues);
            console.log(keys);
            for (let i = 0; i < keys.length; i++) {
              varValues[keys[i]] = undefined;
            }
            this.setVariableValues(varValues);
          }
          const eventNames = [];
          const eventIds = [];
          varValues = {};

          for (let i = 0; i < boardData.length; i++) { //create the arrays for variable definitions
            eventNames[i] = { variableId: `event${i}Name`, name: `${boardData[i].name}--Label` };
            eventIds[i] = { variableId: `event${i}ID`, name: `${boardData[i].name}--ID` }
          }
          let eventNamesandIds = eventNames.concat(eventIds)
          this.setVariableDefinitions(eventNamesandIds);

          for (let i = 0; i < boardData.length; i++) { //create the arrays for variable values
            varValues[`event${i}Name`] = boardData[i].name
            varValues[`event${i}ID`] = boardData[i].id
          }
          this.setVariableValues(varValues);
        } //end if board-action equals get-options

      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };
}

runEntrypoint(ModuleInstance, UpgradeScripts)


