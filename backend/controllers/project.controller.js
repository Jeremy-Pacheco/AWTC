const { Project } = require('../models');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, start_date, end_date, location, capacity, status } = req.body;
    const filename = req.file ? req.file.filename : null;

    const project = await Project.create({
      name,
      description,
      start_date,
      end_date,
      location,
      capacity,
      status,
      filename
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating project', error });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
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

    const { name, description, start_date, end_date, location, capacity, status } = req.body;

    const updateData = {
      name,
      description,
      start_date,
      end_date,
      location,
      capacity,
      status
    };

    if (req.file && req.file.filename) {
      updateData.filename = req.file.filename;
    }

    await project.update(updateData);

    res.status(200).json(project);
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
