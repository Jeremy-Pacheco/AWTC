// Reviews Tests - CRUD Operations with User Relations
const { describe, it, expect } = require('@jest/globals');
const reviewsController = require('../controllers/reviews.controller');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

describe('Reviews - CRUD Operations & Relations', () => {
  let createdReviewId;

  // Test 1: CREATE - Create a new review (requires auth)
  it('should fail to create review without authentication', async () => {
    const req = {
      body: {
        content: 'Test review content'
      },
      user: null,
      file: null
    };
    const res = mockResponse();

    await reviewsController.createReview(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.data.message).toContain('iniciar sesión');
  });

  // Test 2: READ - Get all reviews
  it('should retrieve all reviews', async () => {
    const req = {};
    const res = mockResponse();

    await reviewsController.getAllReviews(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  // Test 3: UPDATE - Try to update review without auth
  it('should fail to update review without authentication', async () => {
    const req = {
      params: { id: 1 },
      body: {
        content: 'Updated content'
      },
      user: null,
      file: null
    };
    const res = mockResponse();

    await reviewsController.updateReview(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.data.message).toContain('No autorizado');
  });

  // Test 4: DELETE - Try to delete review without auth
  it('should fail to delete review without authentication', async () => {
    const req = {
      params: { id: 1 },
      user: null
    };
    const res = mockResponse();

    await reviewsController.deleteReview(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.data.message).toContain('No autorizado');
  });

  // Test 5: ERROR - Try to get non-existent review
  it('should return 404 for non-existent review', async () => {
    const req = {
      params: { id: 99999 },
      user: { id: 1, role: 'admin' }
    };
    const res = mockResponse();

    await reviewsController.deleteReview(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.data.message).toContain('not found');
  });
});
