module.exports = function (self) {
  self.setPresetDefinitions(presets)
}
const presets = {}
presets[`my_first_preset`] = {
  type: 'button', // This must be 'button' for now
  category: 'Board Start/Stop', // This groups presets into categories in the ui. Try to create logical groups to help users find presets
  name: `My button`, // A name for the preset. Shown to the user when they hover over it
  style: {
    // This is the minimal set of style properties you must define
    text: `Board On/Off`, // You can use variables from your module here
    size: 'auto',
    color: '#FFFFFF',
    //bgcolor: combineRgb(0, 0, 0),
  },
  steps: [{
    down: [{
      actionId: 'my-action',
      options: {
        brightness: 100,
      },
    }],
    up: [],
  }],
  feedbacks: [], // You can add some presets from your module here
}