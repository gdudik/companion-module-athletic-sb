module.exports = function (self) {
	self.setActionDefinitions({
		start_board: {
			name: 'Start Board',
			options: [
				{
					type: 'textinput',
					label: 'Board Name',
					id: 'board_name',
				},
				{
					type: 'textinput',
					label: 'Board position (x,y), optional',
					id: 'board_position',
					regex: '^\d{1,5},\d{1,5}$',
				},
				
			],
			callback: async (event) => {
				self.executeAction(event)
			},
		},
		stop_board: {
			name: 'Stop Board',
			options: [
				{
					type: 'textinput',
					label: 'Board Name',
					id: 'board_name',
				},
				
			],
			callback: async (event) => {
				self.executeAction(event)
			},
		},
		get_data: {
			name: 'Stop Board',
			options: [
				{
					type: 'textinput',
					label: 'Board Name',
					id: 'board_name',
				},
				
			],
			callback: async (event) => {
				self.executeAction(event)
			},
		},
	})
} 
