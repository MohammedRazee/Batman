export default [
  {
    id: 'ending_justice',
    area: 'The Tower',
    title: 'CASE CLOSED',
    text: `You cut the third conduit. The chain goes cold.

The trigger in his hand is a toy. He looks at it, and for the first time all night his smile has nothing behind it.

By dawn the island is quiet. The patients are on boats to a real hospital. The committee are in handcuffs, the doctor is in a room with lawyers, and the tape and the ledger and the photographs are on three different desks in three different cities.

The sun comes up over the water. It is grey, and thin, and it is not nothing.

Case file: {{name}}. Closed.`,
    ending: { id: 'justice', title: 'CASE CLOSED' },
    choices: [],
  },
  {
    id: 'ending_pyrrhic',
    area: 'The Tower',
    title: 'THE LONG NIGHT',
    text: `It is over quickly. It is not clean.

The trigger is crushed under your boot. The prisoner laughs all the way down the stairs, in cuffs again, and does not stop even when the doors close on him.

The doctor and the committee are alive. By morning there will be lawyers and a statement and a tidy story about a patient who got out. The ledger will find its way into a drawer. Nobody will ask why the names on it were never discharged.

The island is still standing. So is everything it was built to hide.

Case file: {{name}}. Closed, but not finished.`,
    ending: { id: 'pyrrhic', title: 'THE LONG NIGHT' },
    choices: [],
  },
  {
    id: 'ending_dark',
    area: 'The Tower',
    title: 'ASHES',
    text: `You turn your back. Behind you, the applause stops.

The first charge goes before you reach the stairs. The second shakes the dome loose. By the time you reach the water, the whole island is a lantern, orange and roaring, with a sound like a crowd that has finally found what it was waiting for.

The harbour patrol finds you on the rocks at dawn, soaked, unhurt, and not talking.

Nobody finds the ledger. Nobody finds the tape. Nobody finds the names.

Case file: {{name}}. Nothing left to open.`,
    ending: { id: 'dark', title: 'ASHES' },
    choices: [],
  },
  {
    id: 'game_over',
    area: 'Arkham Island',
    title: 'SIGNAL LOST',
    text: `The floor comes up to meet you. It is cold, and wet, and very quiet.

Somewhere above, a radio is still crackling. A laugh. A distant, cheerful voice saying something about the party and the guest of honour.

The edges of the world go soft and grey. The last thing you feel is the island settling around you, indifferent, like it has done this before.

Case file: {{name}}. Lost on Arkham Island.`,
    ending: { id: 'died', title: 'SIGNAL LOST', died: true },
    choices: [],
  },
  {
    id: 'ambush',
    area: 'Arkham Island',
    title: 'Ambush',
    repeat: true,
    text: `Too loud. Too slow. Too many steps in the wrong places.

They come out of the dark all at once. A pipe takes you across the shoulder. A boot takes you in the ribs. A voice, thin and delighted, says, "There he is!"

You fight your way clear, and you are very lucky, and it costs you.

When your head stops ringing, the shadows have gone quiet again. They are only waiting. The island has learned your name.`,
    onEnter: [
      { type: 'health', delta: -15 },
      { type: 'setAlert', value: 40 },
    ],
    choices: [{ label: 'Get up.', goto: '__return' }],
  },
];
