import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 24 },
    scene: { type: String, required: true },
    health: { type: Number, default: 100 },
    alert: { type: Number, default: 0 },
    inventory: { type: [String], default: [] },
    flags: { type: mongoose.Schema.Types.Mixed, default: {} },
    journal: {
      type: [{ id: String, title: String, text: String, section: String, _id: false }],
      default: [],
    },
    trophies: { type: [String], default: [] },
    riddleTries: { type: mongoose.Schema.Types.Mixed, default: {} },
    visited: { type: [String], default: [] },
    returnTo: { type: String, default: null },
    detectiveMode: { type: Boolean, default: false },
    over: { type: Boolean, default: false },
    logId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayLog' },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model('Player', playerSchema);
