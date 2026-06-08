const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@vinayakdentalcare.com';
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultAdmin = new Admin({
        email: adminEmail,
        password: 'Vinayak@123'
      });
      await defaultAdmin.save();
      console.log('Default admin credentials seeded successfully.');
    } else {
      console.log('Admin user already exists. Skipping seeding.');
    }
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
  }
};

module.exports = seedAdmin;
