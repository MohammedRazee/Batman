import mongoose from 'mongoose';

// One document per playthrough: "someone with this name played the game".
const playLogSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    outcome: { type: String, enum: ['in_progress', 'ending', 'died'], default: 'in_progress' },
    endingId: String,
    choicesMade: { type: Number, default: 0 },
    lastScene: String,
    trophiesSolved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('PlayLog', playLogSchema);
