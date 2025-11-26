const { Project } = require('../models');
const db = require('../models');
const { User } = db;

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, start_date, end_date, location, capacity, status, categoryId } = req.body;
    const filename = req.file ? req.file.filename : null;

    const project = await Project.create({
      name,
      description,
      start_date,
      end_date,
      location,
      capacity,
      status,
      filename,
      categoryId
    });

    // Return the created project including its category
    const created = await Project.findByPk(project.id, { include: [{ model: db.Category, as: 'category' }] });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating project', error });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ include: [{ model: db.Category, as: 'category' }] });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving projects', error });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { name, description, start_date, end_date, location, capacity, status, categoryId } = req.body;

    const updateData = {
      name,
      description,
      start_date,
      end_date,
      location,
      capacity,
      status
    };

    // allow updating category
    if (typeof categoryId !== 'undefined') {
      updateData.categoryId = categoryId;
    }

    if (req.file && req.file.filename) {
      updateData.filename = req.file.filename;
    }

    await project.update(updateData);
    // Return updated project with category
    const updated = await Project.findByPk(project.id, { include: [{ model: db.Category, as: 'category' }] });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating project', error });
  }
};


// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.destroy();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

// Register current authenticated user to the project (self-registration)
exports.registerUser = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.id;

    // Prevent registration if user is banned from this project
    const existingBan = await db.UserProjectBan.findOne({ where: { userId, projectId } });
    if (existingBan) return res.status(403).json({ message: 'Cannot register to this project' });

    // check if subscription already exists
    const [row, created] = await db.UserProject.findOrCreate({
      where: { userId, projectId },
      defaults: { status: 'accepted' }
    });

    if (!created) return res.status(409).json({ message: 'Already registered' });

    return res.status(200).json({ message: 'Registered to project', subscription: row });
  } catch (err) {
    console.error('Register user error', err.message);
    return res.status(500).json({ message: 'Error registering user to project' });
  }
};

// Get volunteers for a project (requires admin/coordinator role)
exports.getVolunteers = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await Project.findByPk(projectId, { include: [{ model: db.User, through: { attributes: ['status', 'role'] } }] });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // project.Users is the list of volunteer users associated
    return res.status(200).json({ projectId: project.id, volunteers: project.Users || [] });
  } catch (err) {
    console.error('Get volunteers error', err.message);
    return res.status(500).json({ message: 'Error fetching volunteers' });
  }
};

// Accept a volunteer registration (admin/coordinator)
exports.acceptVolunteer = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const volunteerId = parseInt(req.params.userId, 10);
    const record = await db.UserProject.findOne({ where: { userId: volunteerId, projectId } });
    if (!record) return res.status(404).json({ message: 'Registration not found' });
    await record.update({ status: 'accepted' });
    return res.status(200).json({ message: 'Volunteer accepted', record });
  } catch (err) {
    console.error('Accept volunteer error', err.message);
    return res.status(500).json({ message: 'Error accepting volunteer' });
  }
};

// Admin manually add an existing user as volunteer for a project (accepted)
exports.addVolunteer = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const volunteerId = parseInt(req.params.userId, 10);
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Do not add if a ban exists
    const existingBan = await db.UserProjectBan.findOne({ where: { userId: volunteerId, projectId } });
    if (existingBan) return res.status(403).json({ message: 'User is banned from this project' });

    const [row, created] = await db.UserProject.findOrCreate({ where: { userId: volunteerId, projectId }, defaults: { status: 'accepted' } });
    if (!created) return res.status(409).json({ message: 'User already registered to this project' });
    return res.status(200).json({ message: 'Volunteer added to project', subscription: row });
  } catch (err) {
    console.error('Add volunteer error', err.message);
    return res.status(500).json({ message: 'Error adding volunteer to project' });
  }
};

// Reject a volunteer registration (admin/coordinator) — implemented as deletion + ban
exports.rejectVolunteer = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const volunteerId = parseInt(req.params.userId, 10);
    const record = await db.UserProject.findOne({ where: { userId: volunteerId, projectId } });
    if (!record) return res.status(404).json({ message: 'Registration not found' });
    await record.destroy();
    // Create a ban so the volunteer can't re-register
    await db.UserProjectBan.findOrCreate({ where: { userId: volunteerId, projectId }, defaults: { reason: 'Rejected by admin' } });
    return res.status(200).json({ message: 'Volunteer rejected and banned' });
  } catch (err) {
    console.error('Reject volunteer error', err.message);
    return res.status(500).json({ message: 'Error rejecting volunteer' });
  }
};

// User self-unregister from a project; delete their UserProject row and ban them from re-registering
exports.unregisterUser = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const userId = req.user.id;
    const record = await db.UserProject.findOne({ where: { userId, projectId } });
    if (!record) return res.status(404).json({ message: 'Not registered to project' });
    await record.destroy();
    // Add ban so the user cannot re-register
    await db.UserProjectBan.findOrCreate({ where: { userId, projectId }, defaults: { reason: 'User unsubscribed' } });
    return res.status(200).json({ message: 'Unregistered from project and banned' });
  } catch (err) {
    console.error('Unregister error', err.message);
    return res.status(500).json({ message: 'Error unregistering from project' });
  }
};

// Admin unban a volunteer (remove ban so they can register again)
exports.unbanVolunteer = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const volunteerId = parseInt(req.params.userId, 10);
    const ban = await db.UserProjectBan.findOne({ where: { userId: volunteerId, projectId } });
    if (!ban) return res.status(404).json({ message: 'Ban not found' });
    await ban.destroy();
    return res.status(200).json({ message: 'Unbanned user from project' });
  } catch (err) {
    console.error('Unban volunteer error', err.message);
    return res.status(500).json({ message: 'Error unbanning volunteer' });
  }
};
