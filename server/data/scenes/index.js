import intake from './intake.js';
import medical from './medical.js';
import gardens from './gardens.js';
import sewers from './sewers.js';
import mansion from './mansion.js';
import finale from './finale.js';
import endings from './endings.js';

const all = [
  ...intake,
  ...medical,
  ...gardens,
  ...sewers,
  ...mansion,
  ...finale,
  ...endings,
];

// Every Botanical Gardens scene is a fear section.
export default all.map((sc) => (sc.area === 'Botanical Gardens' ? { ...sc, fear: true } : sc));
