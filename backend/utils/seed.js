const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not defined in environment. Skipping automatic admin seeding.');
      return;
    }

    if (adminPassword.length < 10) {
      console.warn('[SEED WARNING] ADMIN_PASSWORD must be at least 10 characters long. Refusing to seed admin with a weak password.');
      return;
    }

    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultAdmin = new Admin({
        email: adminEmail,
        password: adminPassword
      });
      await defaultAdmin.save();
      console.log(`[SEED] Admin account (${adminEmail}) seeded successfully.`);
    } else {
      console.log(`[SEED] Admin account (${adminEmail}) already exists. Skipping seeding.`);
    }
  } catch (error) {
    console.error(`[SEED ERROR] Error seeding admin: ${error.message}`);
  }
};

module.exports = seedAdmin;
