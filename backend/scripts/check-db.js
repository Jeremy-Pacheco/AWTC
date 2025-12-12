const { User, Project, Category } = require('../models');

async function check() {
  try {
    console.log('Checking database content...');
    const userCount = await User.count();
    const projectCount = await Project.count();
    const categoryCount = await Category.count();

    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Categories: ${categoryCount}`);

    if (userCount === 0 || projectCount === 0 || categoryCount === 0) {
      console.error('❌ Database seems empty or missing data!');
    } else {
      console.log('✅ Database has data.');
    }
  } catch (error) {
    console.error('❌ Error connecting or querying database:', error);
  } finally {
    process.exit();
  }
}

check();
