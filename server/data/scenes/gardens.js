module.exports = [
  {
    id: 'garden_01',
    area: 'Botanical Gardens',
    title: 'Overgrowth',
    text: `The lift doors open on a wall of green.

Vines as thick as your wrist have swallowed the benches and the glass walls. The air is wet and warm and tastes like pennies. Pale spores drift through the light from a cracked skylight like snow in the wrong season.

Something is alive in here. Not the vines. Something that is watching the vines move.`,
    detectiveText: `One path through the growth has no spores. The air above it is clean and moving. Someone keeps it open on purpose.`,
    choices: [
      { label: 'Push through the vines.', goto: 'garden_02', effects: [{ type: 'health', delta: -10 }, { type: 'alert', delta: 5 }] },
      {
        label: 'Burn a path with explosive gel.',
        goto: 'garden_02',
        requires: { item: 'gel' },
        effects: [{ type: 'removeItem', item: 'gel' }, { type: 'alert', delta: 15 }],
      },
      { label: 'Follow the one clear path.', goto: 'garden_02', detective: true },
    ],
  },
  {
    id: 'garden_02',
    area: 'Botanical Gardens',
    title: 'The Spores',
    text: `You breathe in. Just once.

The glass turns to water. The ceiling is very far away and then very near. A light is ahead of you, warm and golden, the colour of a window on a cold street.

"Come on, you're nearly home," someone says. The voice is gentle. The voice is wrong.

Behind the light, something hums.`,
    detectiveText: `The golden light does not move when you do. It is not a window. It is a projector bulb cased in amber glass, and it is turning.`,
    clue: {
      id: 'projector_light',
      title: 'The Light Is a Projector',
      text: 'The warm glow in the spores is a lamp behind amber glass. The hallucination is staged.',
    },
    choices: [
      { label: 'Run toward the light.', goto: 'garden_03', effects: [{ type: 'health', delta: -15 }] },
      { label: 'Stand still. Count your breaths.', goto: 'garden_03', effects: [{ type: 'alert', delta: 5 }] },
      { label: 'The light is not real. Walk toward the hum behind it.', goto: 'garden_04', detective: true, effects: [{ type: 'flag', key: 'lucid' }] },
    ],
  },
  {
    id: 'garden_03',
    area: 'Botanical Gardens',
    title: 'The Nightmare Hall',
    text: `The light spills out into a long wet alley. A streetlamp stutters. Somewhere a sound like pearls falling on pavement, one at a time, slowly.

A figure stands at the mouth of the alley with its back to you, tall and ragged, a sack over its head.

"You did so well," the figure says, in a voice you know. "Stop now. Stay. It's nice here."

The pearls stop falling. You realise you are holding your breath, and that the air you are holding is poison.`,
    detectiveText: `Your own heartbeat is the footsteps. Your own shadow is the figure. Stop looking at it.`,
    choices: [
      { label: 'Fight the figure.', goto: 'garden_04', effects: [{ type: 'health', delta: -10 }] },
      { label: 'Walk straight through it.', goto: 'garden_04', effects: [{ type: 'alert', delta: 10 }] },
    ],
  },
  {
    id: 'garden_04',
    area: 'Botanical Gardens',
    title: 'The Greenhouse',
    text: `The alley folds away like a bad photograph. You are on your knees on a mosaic floor, in a greenhouse full of heavy white blooms.

Speakers crackle in the vines. A woman's voice, warm and amused, drifts down from nowhere.

"Poor thing. You came a long way to be this late. The island is coughing up its secrets tonight, and my friends are very hungry."

On a stone pedestal in the middle of the room, a vial of cloudy green liquid glows faintly. Under the pedestal, an iron hatch is set into the floor.`,
    detectiveText: `The vial is a cure, or a copy of one. The label has been scratched off, but the cap is still warm from a hand.`,
    choices: [
      {
        label: 'Take the antidote vial from the pedestal.',
        goto: 'garden_04',
        hideIf: { item: 'antidote' },
        effects: [
          { type: 'addItem', item: 'antidote' },
          { type: 'health', delta: 10 },
          { type: 'journal', id: 'antidote', title: 'Antidote', text: 'Taken from the greenhouse pedestal. Whoever left it knew you would need it later.' },
        ],
      },
      { label: 'Drop through the iron hatch.', goto: 'sewers_01' },
    ],
  },
];
