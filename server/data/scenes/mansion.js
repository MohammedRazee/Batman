export default [
  {
    id: 'cell_01',
    trophy: { riddleId: 'tr_cell_cell', x: 24, y: 34 },
    area: 'Cell Block',
    title: 'Cell Block C',
    text: `A row of cages in an old building that has pretended to be a hospital too long. Most of the doors are open. One is not.

A thin man grips the bars, hollow-eyed, still in the grey shirt they give the long-term cases. He has been crying, and then he has not.

"You're not one of them," he says. "You're not. Please. They said they'd come back for me in the morning."

Down the corridor, the red lights pulse. Somewhere on the island, glass breaks.`,
    detectiveText: `A clipboard hangs on the cell door. Dates, initials, a column headed TREATMENT. Every line ends the same way: DOSE INCREASED.`,
    choices: [
      {
        label: 'Free him.',
        goto: 'mansion_01',
        effects: [
          { type: 'alert', delta: 10 },
          { type: 'flag', key: 'freed_inmate' },
          { type: 'journal', id: 'inmate', title: 'The Freed Inmate', text: 'He whispered where the doctor kept his ledgers. The Records Room, past the old chapel. He said no more than that before the dark took him.' },
        ],
      },
      { label: 'Leave him in the dark.', goto: 'mansion_01', effects: [{ type: 'alert', delta: -5 }] },
      {
        label: 'Read the clipboard on the cell door.',
        goto: 'cell_01',
        detective: true,
        hideIf: { flag: 'logread' },
        effects: [
          { type: 'flag', key: 'logread' },
          { type: 'journal', id: 'cell_log', title: 'Cell Door Log', text: 'Doses rising. Names changed. A patient who arrived with a broken leg is listed as "voluntary".' },
        ],
      },
    ],
  },
  {
    id: 'mansion_01',
    area: 'Mansion',
    title: 'The Records Room',
    text: `A tall room lined with shelves, drowning in paper. Green-shaded lamps lie on their sides. A fire has been laid in the hearth and never lit.

At the desk, a leather patient ledger sits open to a page that has been torn out. In the wall behind the desk, a scorched steel safe peeks through a loose panel.

On the floorboards, a trail of dark spots runs from the doorway to the bookcase. The bookcase stands slightly out of line, as if it were a door.

The service stairs at the back go up to the Tower.`,
    detectiveText: `The blood is old, brown, and walked in. Whoever was bleeding went through that bookcase more than once.`,
    choices: [
      { label: 'Read the patient ledger.', goto: 'mansion_02', hideIf: { flag: 'ledger' } },
      { label: 'Open the scorched wall safe.', goto: 'mansion_03', requires: { item: 'sequencer' }, hideIf: { flag: 'safe' } },
      { label: 'Trace the blood trail across the floorboards.', goto: 'mansion_04', detective: true, hideIf: { flag: 'trail' } },
      { label: 'Take the service stairs up to the Tower.', goto: 'mansion_05' },
    ],
  },
  {
    id: 'mansion_02',
    trophy: { riddleId: 'tr_records_file', x: 75, y: 30 },
    area: 'Mansion',
    title: 'The Ledger',
    text: `Columns of names, in a doctor's neat hand. Ward. Admission. Condition. Under Condition, almost every entry says the same thing: Cured.

Under Discharge, there is no date at all.

A page is missing, but the impression of the ink remains in the page beneath. Held to the lamp, you can read three names on it. All three are board members. All three have been dead since last spring.`,
    onEnter: [
      { type: 'flag', key: 'ledger' },
      { type: 'inc', key: 'evidence' },
      { type: 'journal', id: 'ledger', title: 'The Patient Ledger', text: 'Every entry marked "Cured" has no discharge date. A torn page named three board members, all dead since spring.' },
    ],
    choices: [{ label: 'Back to the shelves.', goto: 'mansion_01' }],
  },
  {
    id: 'mansion_03',
    area: 'Mansion',
    title: 'The Safe',
    text: `The sequencer chews the lock for a long, long minute. Then the safe gives up its secrets with a sigh.

Inside: a stack of photographs, a bank passbook, and a recording tape in a plain brown sleeve. In the photographs, men in good suits shake hands with men in orange, in rooms with no windows.

On the tape label, in a careful hand: for the committee, ensure the long-term cohort remains "voluntary".

You could take it all, and it would be enough to ruin people.`,
    onEnter: [
      { type: 'flag', key: 'safe' },
      { type: 'inc', key: 'evidence' },
      { type: 'journal', id: 'safe', title: "The Safe's Contents", text: 'Photographs, a passbook, a tape: proof that committee members were paid to keep the experiments quiet.' },
    ],
    choices: [{ label: 'Pocket the evidence. Back to the room.', goto: 'mansion_01' }],
  },
  {
    id: 'mansion_04',
    area: 'Mansion',
    title: 'The Blood Trail',
    text: `The trail ends at the bookcase. You push, and it swings.

A narrow stair spirals down to a stone room with a single chair bolted to the floor. Leather straps, worn through in places. A table beside it, laid with things you do not want to name.

On the wall, a row of hooks. On the hooks, a row of white coats, each with a name stitched into the collar. Every name is one of the patients on the ledger.

Whoever wore these coats is still inside them, somewhere, still working.`,
    onEnter: [
      { type: 'flag', key: 'trail' },
      { type: 'inc', key: 'evidence' },
      { type: 'journal', id: 'trail', title: 'The Hidden Room', text: 'A secret treatment room beneath the Records Room. White coats stitched with patient names.' },
    ],
    choices: [{ label: 'Climb back up.', goto: 'mansion_01' }],
  },
  {
    id: 'mansion_05',
    area: 'Mansion',
    title: 'The Stairwell',
    text: `The stairs wind up through the old building. At each landing, a speaker has been wired to the wall, and out of every one of them, a voice.

"Is this thing on? Testing. Testing. Ladies and gentlemen, boys and girls, patients and staff, the management of Arkham Asylum regrets to inform you that tonight's performance is cancelled."

A giggle that goes on a long time.

"Please remain seated. We'll be right with you."

At the top of the stairs, a wide iron door stands slightly open, bleeding warm light and the sound of applause.`,
    detectiveText: `The speakers are on a single circuit. Every one of them leads up. He wants you to arrive on time.`,
    choices: [{ label: 'Climb to the Tower.', goto: 'finale_01' }],
  },
];
