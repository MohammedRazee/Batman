import mongoose from 'mongoose';

// Effects and requirements are free-form and interpreted by services/engine.js
const choiceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    goto: { type: String, required: true },
    requires: { type: mongoose.Schema.Types.Mixed, default: undefined },
    hideIf: { type: mongoose.Schema.Types.Mixed, default: undefined },
    detective: { type: Boolean, default: false },
    effects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const sceneSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  area: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  detectiveText: String,
  timed: { type: mongoose.Schema.Types.Mixed, default: undefined },
  trophy: { type: mongoose.Schema.Types.Mixed, default: undefined },
  clue: { type: mongoose.Schema.Types.Mixed, default: undefined },
  onEnter: { type: [mongoose.Schema.Types.Mixed], default: [] },
  repeat: { type: Boolean, default: false },
  choices: { type: [choiceSchema], default: [] },
  ending: { type: mongoose.Schema.Types.Mixed, default: undefined },
});

export default mongoose.model('Scene', sceneSchema);
