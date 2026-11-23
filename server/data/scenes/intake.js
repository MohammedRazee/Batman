export default [
  {
    id: 'intake_01',
    area: 'Intake',
    title: 'Sally Port',
    text: `Rain hammers the armoured van. Through the gap in the doors, Arkham squats on the island like something that crawled out of the sea and forgot to die.

The prisoner across from you hums. A tuneless, cheerful hum. His wrists are cuffed, his ankles are chained, and he has not stopped smiling since the bridge.

"Big night," he says. "Everyone's going to remember it."

The doors groan open. Floodlights. Guards with shotguns and tired faces. Cold air that smells of salt and old iron.`,
    detectiveText: `No tremor in his hands. No sweat. A man this calm has already planned the next ten minutes.`,
    clue: {
      id: 'calm_prisoner',
      title: 'The Prisoner Is Calm',
      text: 'Pulse steady, hands still. He wanted to be brought here.',
    },
    choices: [
      { label: 'Watch the prisoner. Memorise him.', goto: 'intake_02', effects: [{ type: 'flag', key: 'watched_joker' }] },
      { label: 'Keep your eyes on the guards and the corridor ahead.', goto: 'intake_02' },
    ],
  },
  {
    id: 'intake_02',
    trophy: { riddleId: 'tr_intake_clock', x: 72, y: 38 },
    area: 'Intake',
    title: 'The Long Corridor',
    text: `Fluorescent tubes buzz over the corridor. Somewhere above you a generator coughs, and the lights go out.

Dark. Total. Then the emergency strips come up, red, one after another, like the building opening its eyes.

The guard who had the prisoner is on the floor. The chain is on the floor. The cuffs hang open from the pipe where they were hooked, still swaying.

Down the corridor, laughter. It is not coming from any one direction.`,
    detectiveText: `Fresh scuffs on the tile, heading east. One set of boots. One set of bare feet. The cuffs were not forced. They were opened.`,
    choices: [
      {
        label: 'Kneel by the guard. Check for a pulse.',
        goto: 'intake_03',
        effects: [
          { type: 'addItem', item: 'keycard' },
          { type: 'journal', id: 'guard_pass', title: 'Guard Keycard', text: 'Taken from an unconscious guard in the Intake corridor. Maybe he will thank you. Maybe not.' },
        ],
      },
      { label: 'Go after the laughter.', goto: 'intake_03', effects: [{ type: 'alert', delta: 10 }] },
    ],
  },
  {
    id: 'intake_03',
    area: 'Intake',
    title: 'Control Room',
    text: `The control room is a glass box full of dead monitors. One screen still glows: every cell door on the island, listed in green, and beside each one the same word.

OPEN.

Your gear case sits in the locker where the staff signed it in. The latch is jammed halfway. Whatever you take, the locker will not give you a second pick before you are forced to move.

A radio crackles on the desk. Voices. Panicked. Overlapping.`,
    detectiveText: `The override was entered from inside this room. The keyboard is still warm.`,
    clue: {
      id: 'inside_job',
      title: 'Inside Job',
      text: 'The lockdown override was typed in from the control room. Someone on staff helped him.',
    },
    choices: [
      {
        label: 'Listen to the radio traffic first.',
        goto: 'intake_03',
        hideIf: { flag: 'heard_radio' },
        effects: [
          { type: 'flag', key: 'heard_radio' },
          { type: 'journal', id: 'radio', title: 'Radio Fragments', text: '"...the Doctor said keep Wing B sealed... they are not patients, they are... Medical, I repeat, Medical..."' },
        ],
      },
      { label: 'Take the grapnel launcher from the locker.', goto: 'medical_01', effects: [{ type: 'addItem', item: 'grapnel' }] },
      { label: 'Take the explosive gel from the locker.', goto: 'medical_01', effects: [{ type: 'addItem', item: 'gel' }] },
    ],
  },
];
