// Static item definitions. Players only store item ids.
module.exports = {
  batarang: {
    id: 'batarang',
    name: 'Batarang',
    desc: 'Weighted steel wing. Throws true, bites into wood, rings off pipes.',
    usable: false,
  },
  grapnel: {
    id: 'grapnel',
    name: 'Grapnel Gun',
    desc: 'Compressed-gas launcher. Gets you up, over and out of reach.',
    usable: false,
  },
  gel: {
    id: 'gel',
    name: 'Explosive Gel',
    desc: 'Tacky, grey, and very impatient. Brings down weak walls.',
    usable: false,
  },
  sequencer: {
    id: 'sequencer',
    name: 'Cryptographic Sequencer',
    desc: 'Bleeds a lock until it gives up its secrets.',
    usable: false,
  },
  keycard: {
    id: 'keycard',
    name: 'Guard Keycard',
    desc: 'Scuffed plastic. Still opens the doors that matter.',
    usable: false,
  },
  medkit: {
    id: 'medkit',
    name: 'Field Medkit',
    desc: 'Stitches, stimulants, bad taste. Restores 30 health.',
    usable: true,
    consumable: true,
    use: { effects: [{ type: 'health', delta: 30 }], message: 'You work the stimulant in. The ache dulls. It does not leave.' },
  },
  antidote: {
    id: 'antidote',
    name: 'Toxin Antidote',
    desc: 'Cloudy green vial, still warm. Whatever the gas does, this argues with it.',
    usable: false,
  },
};
