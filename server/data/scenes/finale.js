export default [
  {
    id: 'finale_01',
    trophy: { riddleId: 'tr_finale_shadow', x: 22, y: 28 },
    area: 'The Tower',
    title: "The Tower: Joker's Stage",
    text: `A vast room under a dome of iron and broken glass. The rain comes in through the roof and runs down the walls in sheets. Under it, someone has set a stage.

Spotlights. A velvet curtain. A row of folding chairs, and in the chairs, bound and gagged, a doctor in a torn white coat and three men in suits who look like they have been caught.

On a swing from the rafters, grinning, sits the prisoner from the van.

"You made it!" he cries. "Oh, I'd hoped you would. I've been saving you the best seat in the house."

Wires run down the wall behind the stage. Wires lead to small black boxes. The boxes blink.`,
    detectiveText: `Fourteen charges, wired in series, all running to one trigger in his left hand. Cut the third conduit and the whole chain goes dead.`,
    choices: [
      { label: 'Walk in. Let him see you.', goto: 'finale_02', effects: [{ type: 'alert', delta: 20 }] },
      { label: 'Swing up to the rafters and come at him from above.', goto: 'finale_02', requires: { item: 'grapnel' } },
      {
        label: 'Trace the wires to the charges.',
        goto: 'finale_01',
        detective: true,
        hideIf: { flag: 'charges_spotted' },
        effects: [
          { type: 'flag', key: 'charges_spotted' },
          { type: 'journal', id: 'charges', title: 'The Charges', text: 'Fourteen charges wired in series. Cut the third conduit and the chain dies.' },
        ],
      },
    ],
  },
  {
    id: 'finale_02',
    area: 'The Tower',
    title: 'The Gas',
    text: `"I thought we'd do a little audience participation," the prisoner says, and pulls a lever.

Pipes along the dome hiss. A pale green vapour pours down the walls and pools across the stage, rising, a slow tide with a smell you know too well.

"Please, enjoy the fear," he sings. "It's been specially prepared."

Your eyes sting. The room tilts. The doctor, bound in his chair, begins to scream at something you cannot see.`,
    detectiveText: `Same compound as the greenhouse spores. Concentrated. Whoever engineered the gas is working with him, and is not in this room.`,
    choices: [
      { label: 'Drink the antidote.', goto: 'finale_03', requires: { item: 'antidote', reason: 'You have nothing to counter the gas.' }, effects: [{ type: 'removeItem', item: 'antidote' }] },
      { label: 'Hold your breath and push through.', goto: 'finale_03', effects: [{ type: 'health', delta: -30 }, { type: 'flag', key: 'hallucinated' }] },
    ],
  },
  {
    id: 'finale_03',
    area: 'The Tower',
    title: 'Last Move',
    text: `The gas thins. The stage is a ring of light and you stand in the middle of it.

"Well, now," the prisoner says, hanging from the swing by one hand. "This is the part where you decide who you are."

In his other hand, the trigger. Behind him, the charges. In front of you, the bound doctor, the men in suits, every secret in the building tied to a chair.

There is no clean way out of this room. There is only the version of the night you will have to carry.`,
    detectiveText: `If the third conduit is cut, the trigger is a toy. If it is not, the first charge is under the doctor's chair.`,
    choices: [
      {
        label: 'Cut the wires. Hand the evidence to the world.',
        goto: 'ending_justice',
        requires: { flag: 'charges_spotted', minFlag: { key: 'evidence', value: 3 }, reason: 'You need to have found the charges, and enough evidence to put them away.' },
      },
      { label: 'Take the shot. End it here.', goto: 'ending_pyrrhic' },
      { label: 'Walk away. Let the island burn.', goto: 'ending_dark' },
    ],
  },
];
