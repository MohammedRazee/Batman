module.exports = [
  {
    id: 'sewers_01',
    area: 'Sewers',
    title: 'The Drowned Level',
    text: `You land in black water up to your shins.

The tunnel is round, brick, ancient, and dripping, with pipes running overhead like ribs. A single working lamp at the far end makes the water look like oil.

A smell that is not just sewage. Wet fur. Rotten meat. Something that has been here a very long time and has not been lonely.`,
    detectiveText: `A dry ledge runs along the right wall, just above the waterline. Scratch marks every few feet. Something heavy walks here, and walks wet.`,
    choices: [
      { label: 'Wade through the water.', goto: 'sewers_02', effects: [{ type: 'health', delta: -10 }, { type: 'alert', delta: 20 }] },
      { label: 'Swing across the overhead pipes with the grapnel.', goto: 'sewers_02', requires: { item: 'grapnel' } },
      { label: 'Find the dry maintenance ledge.', goto: 'sewers_02', detective: true },
    ],
  },
  {
    id: 'sewers_02',
    area: 'Sewers',
    title: 'Something in the Water',
    text: `The lamp flickers. The water in front of you rises, very slightly, in a slow wave.

Something is under the surface. Something broad. A ridge of scales breaks the water, the length of a car, and slides back down without a sound.

It knows you are here. It is deciding how much you are worth.

The tunnel splits ahead into a wide pool and a rusted iron catwalk.`,
    detectiveText: `A flood valve juts from the wall, the wheel red with rust. If the lower channel flooded, the pool would drain down and trap whatever lives in it.`,
    choices: [
      {
        label: 'Ring a batarang off the far pipes. Make it chase the noise.',
        goto: 'sewers_03',
        requires: { item: 'batarang' },
        effects: [{ type: 'flag', key: 'croc_lured' }],
      },
      { label: 'Creep along the wall.', goto: 'sewers_03', effects: [{ type: 'alert', delta: 25 }] },
      { label: 'Stand your ground and fight it.', goto: 'sewers_03', effects: [{ type: 'health', delta: -30 }, { type: 'alert', delta: 10 }] },
      { label: 'Spin the flood valve.', goto: 'sewers_03', detective: true, effects: [{ type: 'flag', key: 'croc_trapped' }] },
    ],
  },
  {
    id: 'sewers_03',
    area: 'Sewers',
    title: 'The Ladder',
    text: `A rusted ladder climbs into the dark. Behind you the water churns, then stills, and a long way off something huffs a breath that you feel in your teeth.

You do not look back.

The rungs are slick. At the top, a manhole cover has been shoved aside, and cold dry air spills down. It smells like paper and dust and old money.`,
    detectiveText: `Wet prints on the lower rungs. Small, bare, human. Someone went up before you. Someone who was not being chased.`,
    choices: [{ label: 'Climb.', goto: 'cell_01' }],
  },
];
