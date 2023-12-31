const { combineRgb } = require('@companion-module/base')

const generatePresets = async (self) => {
  const presets = {}

  for (let i = 0; i < self.boardNames.length; i++) {
    presets[i] = {
      type: 'button', // This must be 'button' for now
      category: 'Board Start/Stop', // This groups presets into categories in the ui. Try to create logical groups to help users find presets
      name: `My button`, // A name for the preset. Shown to the user when they hover over it
      style: {
        // This is the minimal set of style properties you must define
        text: `$(athleticsb:board${i}Name)`, // You can use variables from your module here
        size: 'auto',
        color: combineRgb(255, 255, 255),
        bgcolor: combineRgb(0, 0, 0),
      },
      steps: [{
        down: [{
          actionId: 'start_board',
          options: {
            board_name: `$(athleticsb:board${i}Name)`
          },
        }],
        up: [],
      },
      {
        down: [{
          actionId: 'stop_board',
          options: {
            board_name: `$(athleticsb:board${i}Name)`
          },
        }],
        up: [],
      }
    ],
      
      feedbacks: [], // You can add some presets from your module here
    }
  }

  return presets;
}







module.exports = async function (self) {
  //console.log(presets)
  const presets = await generatePresets(self);
  self.setPresetDefinitions(presets)
}
