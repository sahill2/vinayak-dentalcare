const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if run directly
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('[SEED ERROR] ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables.');
      if (require.main === module) {
        process.exit(1);
      }
      return;
    }

    if (adminPassword.length < 10) {
      console.error('[SEED ERROR] ADMIN_PASSWORD must be at least 10 characters long.');
      if (require.main === module) {
        process.exit(1);
      }
      return;
    }

    await connectDB();

    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultAdmin = new Admin({
        email: adminEmail,
        password: adminPassword
      });
      await defaultAdmin.save();
      console.log(`[SEED] Admin account (${adminEmail}) seeded successfully.`);
    } else {
      console.log(`[SEED] Admin account (${adminEmail}) already exists. Skipping.`);
    }

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`[SEED ERROR] Failed to seed admin: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// If run directly from CLI (npm run seed or node seed.js)
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
