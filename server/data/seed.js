// Usage: npm run seed   (wipes and reloads the Scene collection only)
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Scene from '../models/Scene.js';
import scenes from './scenes/index.js';

(async () => {
  try {
    await connectDB();
    await Scene.deleteMany({});
    await Scene.insertMany(scenes);
    console.log(`[seed] loaded ${scenes.length} scenes`);
  } catch (err) {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
