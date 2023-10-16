const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const http = require('http')
const path = require('path')


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
		var self = this
		var url = 'http://' + self.config.host + ':' + self.config.port

		switch (action.actionId) {
			case 'start_board':
				var boardPosition = ''
				var reqMethod = 'POST';
				var boardName = action.options.board_name;
				var boardPosition = action.options.board_position
				var boardPositionArray = boardPosition.split(",");
				var boardPosX = boardPositionArray[0];
				var boardPosY = boardPositionArray[1];
				var boardAction = ''
				if (boardPosition !== ''){
					boardAction = 'start?x=' + boardPosX + '&y=' + boardPosY;
					
				} else {
					boardAction = 'start';
					this.log('info','empty string')
				}
				break;
				
				case 'stop_board':
				var reqMethod = 'POST';	
				var boardAction = 'stop';
				var boardName = action.options.board_name;
				break;

				case 'set_data':
				var reqMethod = 'POST';	
				var boardAction = 'set-data?id=' + encodeURIComponent(action.options.event_id);
				var boardName = action.options.board_name;
				break;
				

		}

		
		// Compile the http request to be made
		var requestData = {
			host: self.config.host,
			path: '/boards/' + encodeURIComponent(boardName) + '/' + boardAction,
			port: self.config.port,
			method: reqMethod,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': 0,
			},
		}
		

		var buffer = '';
		// Make the HTTP request
		var req = http.request(requestData, function (res) {
			this.log('info',res.statusCode)
			var buffer = ''
			res.on('data', function (data) {
				buffer += data
			});
			res.on('end', function (data) {
			});
		})

		req.on('error', function (e) {
			this.log('debug','Problem with request: ' + e.message)
		})

		
		req.end()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
