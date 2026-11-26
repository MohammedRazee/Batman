export default [
  {
    id: 'garden_01',
    area: 'Botanical Gardens',
    title: 'Overgrowth',
    text: `The lift doors open on a wall of green.

Vines as thick as your wrist have swallowed the benches and the glass walls. The air is wet and warm and tastes like pennies. Pale spores drift through the light from a cracked skylight like snow in the wrong season.

Something is alive in here. Not the vines. Something that is watching the vines move.`,
    detectiveText: `One path through the growth has no spores. The air above it is clean and moving. Someone keeps it open on purpose.`,
    onEnter: [{ type: 'fear', delta: 20 }],
    choices: [
      { label: 'Push through the vines.', goto: 'garden_02', effects: [{ type: 'health', delta: -10 }, { type: 'alert', delta: 5 }, { type: 'fear', delta: 15 }] },
      {
        label: 'Burn a path with explosive gel.',
        goto: 'garden_02',
        requires: { item: 'gel' },
        effects: [{ type: 'removeItem', item: 'gel' }, { type: 'alert', delta: 15 }, { type: 'fear', delta: 5 }],
      },
      { label: 'Follow the one clear path.', goto: 'garden_02', detective: true, effects: [{ type: 'fear', delta: -10 }] },
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
    // TODO(author): tier text is placeholder prose, rewrite.
    fearText: {
      uneasy: `You breathe in. Then again, because the first one did not count.

The glass walls are breathing with you. A light is ahead, warm and golden, and it is the window of a house you know. You can almost see who is standing behind the curtain.

"Come on, you're nearly home," someone says. It is a voice you trust. You cannot remember why that should frighten you.

Behind the light, something hums. You decide not to hear it.`,
      terrified: `You are breathing too fast and the air is thick as syrup.

There are no walls. There was never a lift. There is a window, golden and close, and everyone you ever lost is behind it, waving. They look so pleased to see you.

"You're home," they say together, in one voice. "Shut the door."

There is a door. There was always a door. It is right there.`,
    },
    detectiveText: `The golden light does not move when you do. It is not a window. It is a projector bulb cased in amber glass, and it is turning.`,
    clue: {
      id: 'projector_light',
      title: 'The Light Is a Projector',
      text: 'The warm glow in the spores is a lamp behind amber glass. The hallucination is staged.',
    },
    onEnter: [{ type: 'fear', delta: 20 }],
    choices: [
      { label: 'Run toward the light.', goto: 'garden_03', effects: [{ type: 'health', delta: -15 }, { type: 'fear', delta: 25 }] },
      { label: 'Stand still. Count your breaths.', goto: 'garden_03', effects: [{ type: 'alert', delta: 5 }, { type: 'fear', delta: -20 }] },
      // A lie: once uneasy, the "door" is the hallucination and leads into the alley.
      { label: 'Take the door marked GREENHOUSE.', goto: 'garden_04', lies: { actualGoto: 'garden_03', minTier: 'uneasy' } },
      { label: 'The light is not real. Walk toward the hum behind it.', goto: 'garden_04', detective: true, effects: [{ type: 'flag', key: 'lucid' }, { type: 'fear', delta: -15 }] },
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
    // TODO(author): tier text is placeholder prose, rewrite.
    fearText: {
      uneasy: `The light spills out into a long wet alley you have walked a thousand times in your sleep. A streetlamp stutters in time with your pulse. Pearls fall on the pavement, one at a time, and every one of them is louder than the last.

A figure stands at the mouth of the alley, tall and ragged, a sack over its head. It has not turned around. You are sure it is about to.

"You did so well," it says, in a voice you know. "Stop now. Stay."

You realise you are holding your breath, and that you have been for a very long time.`,
      terrified: `The alley has no end in either direction. The streetlamp is out. The pearls are still falling, but upward now, and you are falling with them.

The figure is not at the mouth of the alley. It is beside you. It has always been beside you. The sack is stitched shut, and something underneath it is smiling.

"Stay," it says, with your own voice. "You know there is nowhere else."

You cannot tell which way is forward. Every way is the figure.`,
    },
    detectiveText: `Your own heartbeat is the footsteps. Your own shadow is the figure. Stop looking at it.`,
    onEnter: [{ type: 'fear', delta: 15 }],
    choices: [
      { label: 'Fight the figure.', goto: 'garden_04', effects: [{ type: 'health', delta: -10 }, { type: 'fear', delta: 20 }] },
      // A lie: when terrified, "through it" turns you back into the spores.
      { label: 'Walk straight through it.', goto: 'garden_04', effects: [{ type: 'alert', delta: 10 }, { type: 'fear', delta: -10 }], lies: { actualGoto: 'garden_02', minTier: 'terrified' } },
    ],
  },
  {
    id: 'garden_04',
    trophy: { riddleId: 'tr_garden_vine', x: 80, y: 35 },
    area: 'Botanical Gardens',
    title: 'The Greenhouse',
    text: `The alley folds away like a bad photograph. You are on your knees on a mosaic floor, in a greenhouse full of heavy white blooms.

Speakers crackle in the vines. A woman's voice, warm and amused, drifts down from nowhere.

"Poor thing. You came a long way to be this late. The island is coughing up its secrets tonight, and my friends are very hungry."

On a stone pedestal in the middle of the room, a vial of cloudy green liquid glows faintly. Under the pedestal, an iron hatch is set into the floor.`,
    detectiveText: `The vial is a cure, or a copy of one. The label has been scratched off, but the cap is still warm from a hand.`,
    onEnter: [{ type: 'fear', delta: -15 }],
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
  {
    // Engine-routed when fear reaches 100 (like 'ambush'); rejoins the scene the player was heading to.
    id: 'garden_nightmare',
    area: 'Botanical Gardens',
    title: 'The Long Dark',
    repeat: true,
    // TODO(author): placeholder prose, rewrite. Always shown at the uneasy tier (fear is reset to 60), so no fearText.
    text: `The floor lets go of you, and you fall for a long time.

You are small again, and the street is wet, and the pearls are falling. The sack-faced figure kneels beside you and holds your hand, very gently, and tells you that this is where you live now. You believe it. It is so much easier to believe it.

Then a pulse of pain in your ribs, real and stupid and yours. You hold on to it.

When the green comes back, it is thinner. You are on the mosaic floor with blood in your mouth. You are still here. Something was taken to pay for it.`,
    detectiveText: `Nothing you saw was in the room. Your pulse is the only thing that moved.`,
    onEnter: [{ type: 'health', delta: -15 }, { type: 'setFear', value: 60 }],
    choices: [{ label: 'Get up.', goto: '__return' }],
  },
];
