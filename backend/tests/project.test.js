// Project Tests - CRUD Operations + Dashboard Queries
const { describe, it, expect } = require('@jest/globals');
const projectController = require('../controllers/project.controller');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

describe('Project - CRUD Operations & Dashboard', () => {
  let createdProjectId;

  // Test 1: CREATE - Create a new project
  it('should create a new project', async () => {
    const req = {
      body: {
        name: `Test Project ${Date.now()}`,
        description: 'Test project description',
        location: 'Test Location',
        capacity: 50,
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      file: null
    };
    const res = mockResponse();

    await projectController.createProject(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.data).toHaveProperty('id');
    expect(res.data.name).toContain('Test Project');
    createdProjectId = res.data.id;
  });

  // Test 2: READ - Get all projects
  it('should retrieve all projects', async () => {
    const req = {};
    const res = mockResponse();

    await projectController.getAllProjects(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  // Test 3: UPDATE - Update a project
  it('should update an existing project', async () => {
    const req = {
      params: { id: createdProjectId },
      body: {
        name: 'Updated Project Name',
        description: 'Updated description',
        status: 'completed'
      },
      file: null
    };
    const res = mockResponse();

    await projectController.updateProject(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.name).toBe('Updated Project Name');
  });

  // Test 4: DELETE - Delete a project
  it('should delete a project', async () => {
    const req = {
      params: { id: createdProjectId }
    };
    const res = mockResponse();

    await projectController.deleteProject(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.message).toContain('deleted successfully');
  });

  // Test 5: DASHBOARD - Get projects with volunteer count
  it('should retrieve projects with volunteer statistics', async () => {
    const req = {};
    const res = mockResponse();

    await projectController.getAllProjects(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    if (res.data.length > 0) {
      expect(res.data[0]).toHaveProperty('volunteerCount');
    }
  });
});
