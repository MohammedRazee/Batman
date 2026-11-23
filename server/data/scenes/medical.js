export default [
  {
    id: 'medical_01',
    area: 'Medical Wing',
    title: 'The Atrium',
    text: `The Medical Wing smells of bleach and something sweeter underneath it, the way a fridge smells when the power has been off a week.

A reception desk. A gurney rolled on its side. Two guards in bad tactical vests, both with their backs half to you, both jumping at the sound of their own boots.

They are not Arkham guards. Arkham guards wore blue. Someone has been recruiting.

The ward doors are across the atrium. To your left, a vent grille hangs a little crooked.`,
    detectiveText: `Boot prints behind the reception desk. Three sets, all heading to a service door the guards are careful not to look at.`,
    choices: [
      { label: 'Fire the grapnel into the vent and haul yourself up.', goto: 'medical_02', requires: { item: 'grapnel' } },
      {
        label: 'Throw a batarang to pull the guards away from the ward doors.',
        goto: 'medical_03',
        requires: { item: 'batarang' },
        effects: [{ type: 'alert', delta: 5 }, { type: 'flag', key: 'distracted' }],
      },
      { label: 'Walk through the atrium and take the ward doors.', goto: 'medical_03', effects: [{ type: 'alert', delta: 15 }] },
      { label: 'Follow the boot prints to the service door.', goto: 'medical_04', detective: true },
    ],
  },
  {
    id: 'medical_02',
    area: 'Medical Wing',
    title: 'Ceiling Vent',
    text: `The vent smells of dust and old breath. Through the grille the guards are two pale discs of scalp, and their conversation drifts up to you.

"...says it's not a fight, it's a transfer. Wing B by midnight."

"They're not walking out of there."

"They're not supposed to."

A pause. Then a laugh with no humour in it. "The Doctor's special treatment."`,
    detectiveText: `Dried fluid on the duct floor. Not water. Someone has been dragged through here, and not recently.`,
    choices: [
      { label: 'Drop on the nearest guard.', goto: 'medical_05', effects: [{ type: 'alert', delta: 10 }, { type: 'health', delta: -5 }] },
      {
        label: 'Keep crawling. Let them keep talking.',
        goto: 'medical_05',
        effects: [{ type: 'journal', id: 'doc_special', title: "The Doctor's Special Treatment", text: 'Overheard in the vent: the long-term patients are being moved to Wing B by midnight. "They are not supposed to walk out."' }],
      },
    ],
  },
  {
    id: 'medical_03',
    area: 'Medical Wing',
    title: 'The Ward',
    text: `A long ward of iron beds bolted to the floor. Straps hang from the rails. Every bed is empty and every bed has been used.

At the far end a lamp swings from a broken chain, sweeping light across the room like a lighthouse for the lost.

Two men hold the door at the end, rifles low, nerves high. One of them keeps muttering the same prayer, and keeps forgetting the last line.`,
    detectiveText: `The beds are warm. Whoever was here left in a hurry, and not on their own feet.`,
    choices: [
      { label: 'Slip past while they are looking the other way.', goto: 'medical_05', requires: { flag: 'distracted', reason: 'They are watching the door. There is no way past unseen.' } },
      { label: 'Take them head on.', goto: 'medical_05', effects: [{ type: 'health', delta: -15 }, { type: 'alert', delta: 10 }] },
      {
        label: 'Seal the partition wall with explosive gel. Blow it.',
        goto: 'medical_05',
        requires: { item: 'gel' },
        effects: [{ type: 'removeItem', item: 'gel' }, { type: 'alert', delta: 20 }],
      },
    ],
  },
  {
    id: 'medical_04',
    area: 'Medical Wing',
    title: 'Maintenance Crawlway',
    text: `A low corridor behind the walls. Pipes sweat. Wires hang like old veins.

Someone has been living in here. A mat of foam, a rusted tin of beans, tally marks scratched into the concrete in groups of five. Hundreds of them.

In a gap behind a pipe, someone left a first-aid kit. Dusty, but sealed.`,
    detectiveText: `The tally marks stop on the day the Wing was closed. Underneath them, in a cramped hand: THEY ARE NOT SICK.`,
    clue: {
      id: 'not_sick',
      title: 'THEY ARE NOT SICK',
      text: 'Scratched into a maintenance wall by someone who lived here after the Wing closed.',
    },
    onEnter: [{ type: 'addItem', item: 'medkit' }],
    choices: [{ label: "Climb out beside the doctor's office.", goto: 'medical_05' }],
  },
  {
    id: 'medical_05',
    area: 'Medical Wing',
    title: "The Doctor's Office",
    text: `A good desk in a bad building. Lamp, blotter, a framed certificate with the name scraped off. The window looks out at the black water and the lights of the city, very far away.

A terminal blinks behind the desk, locked. A steel cabinet with a card reader stands against the wall. In the top drawer of the desk, something small and expensive is sitting on a stack of patient forms.

The service lift is at the end of the hall. It goes down to the Botanical Gardens.`,
    detectiveText: `Everything on this desk is precisely aligned. Whoever works here likes control and does not like witnesses.`,
    choices: [
      { label: 'Pocket the cryptographic sequencer from the desk.', goto: 'medical_05', hideIf: { item: 'sequencer' }, effects: [{ type: 'addItem', item: 'sequencer' }] },
      {
        label: 'Run the sequencer against the terminal.',
        goto: 'medical_05',
        requires: { item: 'sequencer' },
        hideIf: { flag: 'read_terminal' },
        effects: [
          { type: 'flag', key: 'read_terminal' },
          { type: 'inc', key: 'evidence' },
          { type: 'journal', id: 'terminal', title: 'Terminal: Transfer Orders', text: 'Forty-one names, each marked CONSENT: NONE. Signed with a doctor\'s initials and an Arkham board stamp.' },
        ],
      },
      {
        label: 'Swipe the guard keycard through the cabinet reader.',
        goto: 'medical_05',
        requires: { item: 'keycard' },
        hideIf: { flag: 'cabinet' },
        effects: [
          { type: 'flag', key: 'cabinet' },
          { type: 'addItem', item: 'medkit' },
          { type: 'journal', id: 'cabinet', title: 'Cabinet Contents', text: 'Sedatives, restraints, and a rack of unlabelled vials. Whatever this place was treating, it was not an illness.' },
        ],
      },
      { label: 'Take the service lift down.', goto: 'lift_01' },
    ],
  },
  {
    id: 'lift_01',
    area: 'Transit',
    title: 'Service Lift',
    text: `The lift shudders. Iron mesh, a single caged bulb, a handrail worn smooth by a hundred hands that never went anywhere nice.

For three floors, nobody is shooting at you. You can hear your own breath and the machine groaning on its cables.

Your ribs ache. Your gloves are damp. Below, through the grating, a greener light is climbing up the shaft.`,
    detectiveText: `Claw marks on the inside of the door. Long, deep, and made from the outside going in.`,
    choices: [
      {
        label: 'Rest a moment. Breathe.',
        goto: 'lift_01',
        hideIf: { flag: 'rested' },
        effects: [{ type: 'health', delta: 10 }, { type: 'alert', delta: -20 }, { type: 'flag', key: 'rested' }],
      },
      { label: 'Ride it down.', goto: 'garden_01' },
    ],
  },
];
