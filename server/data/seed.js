// Usage: npm run seed   (wipes and reloads the Scene collection only)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Scene = require('../models/Scene');
const scenes = require('./scenes');

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
