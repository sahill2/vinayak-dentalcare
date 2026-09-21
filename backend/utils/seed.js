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
    const isReset = process.argv.includes('--reset');

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

    // Check for old legacy account
    const oldDefaultEmail = 'admin@vinayakdentalcare.com';
    if (adminEmail !== oldDefaultEmail) {
      const legacyAdmin = await Admin.findOne({ email: oldDefaultEmail });
      if (legacyAdmin) {
        console.warn(`\n⚠️  [SECURITY WARNING] Legacy default admin account (${oldDefaultEmail}) exists in database while ADMIN_EMAIL is configured as (${adminEmail}). Consider removing or updating the legacy account.\n`);
      }
    }

    const admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      if (isReset) {
        admin.password = adminPassword;
        admin.tokenVersion = (admin.tokenVersion || 0) + 1;
        admin.failedLoginAttempts = 0;
        admin.lockUntil = null;
        await admin.save();
        console.log(`[SEED RESET] Admin password for (${adminEmail}) updated successfully and tokens invalidated.`);
      } else {
        console.log(`[SEED] Admin account (${adminEmail}) already exists. Use --reset or 'npm run seed:reset' to update password.`);
      }
    } else {
      const newAdmin = new Admin({
        email: adminEmail,
        password: adminPassword,
        tokenVersion: 0
      });
      await newAdmin.save();
      console.log(`[SEED] Admin account (${adminEmail}) created successfully.`);
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

// If run directly from CLI
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
