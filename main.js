const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const http = require('http')
const path = require('path')
const axios = require('axios');


class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
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

	executeAction = (action) => {
		const self = this;
		const url = 'http://' + self.config.host + ':' + self.config.port;
	
		let reqMethod, boardAction, boardName;
	
		switch (action.actionId) {
			case 'start_board':
				const boardPosition = action.options.board_position;
				const boardPositionArray = boardPosition.split(",");
				const boardPosX = boardPositionArray[0];
				const boardPosY = boardPositionArray[1];
	
				boardAction = boardPosition !== '' ? `start?x=${boardPosX}&y=${boardPosY}` : 'start';
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
				boardAction = `set-data?id=${encodeURIComponent(action.options.event_id)}`;
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
		};
	
		axios(requestData)
			.then((response) => {
				console.log('Status Code:', response.status);
				// You can handle the response data here if needed
			})
			.catch((error) => {
				console.error('Error:', error.message);
			});
	};
}

runEntrypoint(ModuleInstance, UpgradeScripts)
