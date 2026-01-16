// Category Tests - CRUD Operations
const { describe, it, expect } = require('@jest/globals');
const categoryController = require('../controllers/category.controller');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

describe('Category - CRUD Operations', () => {
  let createdCategoryId;

  // Test 1: CREATE - Create a new category
  it('should create a new category', async () => {
    const req = {
      body: {
        name: `Test Category ${Date.now()}`,
        description: 'Test Description'
      }
    };
    const res = mockResponse();

    await categoryController.createCategory(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.data).toHaveProperty('id');
    expect(res.data.name).toContain('Test Category');
    createdCategoryId = res.data.id;
  });

  // Test 2: READ - Get all categories
  it('should retrieve all categories', async () => {
    const req = {};
    const res = mockResponse();

    await categoryController.getAllCategories(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  // Test 3: UPDATE - Update a category
  it('should update an existing category', async () => {
    const req = {
      params: { id: createdCategoryId },
      body: {
        name: 'Updated Category Name',
        description: 'Updated Description'
      }
    };
    const res = mockResponse();

    await categoryController.updateCategory(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.name).toBe('Updated Category Name');
  });

  // Test 4: DELETE - Delete a category
  it('should delete a category', async () => {
    const req = {
      params: { id: createdCategoryId }
    };
    const res = mockResponse();

    await categoryController.deleteCategory(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data.message).toContain('deleted successfully');
  });

  // Test 5: ERROR - Try to update non-existent category
  it('should return 404 for non-existent category', async () => {
    const req = {
      params: { id: 99999 },
      body: { name: 'Should fail' }
    };
    const res = mockResponse();

    await categoryController.updateCategory(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toContain('not found');
  });
});
