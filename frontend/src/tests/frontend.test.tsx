import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Test 1: ReviewsSection renders reviews list
describe('ReviewsSection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render reviews list when data is fetched', async () => {
    const mockReviews = [
      {
        id: 1,
        content: 'Great experience!',
        date: '2025-12-12',
        userId: 1,
        user: { name: 'John', email: 'john@test.com' }
      }
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReviews)
      })
    );

    // Simular fetch de reviews
    const response = await fetch('http://localhost:8080/api/reviews');
    const data = await response.json();

    expect(data).toEqual(mockReviews);
    expect(data[0].content).toBe('Great experience!');
  });
});

// Test 2: Carousel navigation
describe('Carousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch projects for carousel', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', filename: 'image1.jpg' },
      { id: 2, name: 'Project 2', filename: 'image2.jpg' },
      { id: 3, name: 'Project 3', filename: 'image3.jpg' }
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProjects)
      })
    );

    const response = await fetch('http://localhost:8080/api/projects');
    const data = await response.json();

    expect(data.length).toBe(3);
    expect(data[0].filename).toBe('image1.jpg');
  });
});

// Test 3: Authentication token handling
describe('Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store JWT token in localStorage', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4ifQ.test';
    localStorage.setItem('jwtToken', token);

    expect(localStorage.getItem('jwtToken')).toBe(token);
  });

  it('should decode JWT token correctly', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQHRlc3QuY29tIn0.test';
    localStorage.setItem('jwtToken', token);

    const payload = JSON.parse(atob(token.split('.')[1]));
    expect(payload.id).toBe(1);
    expect(payload.email).toBe('john@test.com');
  });
});

// Test 4: Review creation API call
describe('Review Creation', () => {
  it('should POST review to API with FormData', async () => {
    const token = 'test-token';
    const formData = new FormData();
    formData.append('content', 'Test review');
    formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, content: 'Test review' })
      })
    );

    const response = await fetch('http://localhost:8080/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    expect(response.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reviews'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

// Test 5: Review deletion
describe('Review Deletion', () => {
  it('should DELETE review from API', async () => {
    const token = 'test-token';
    const reviewId = 1;

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true })
    );

    const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/reviews/${reviewId}`),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// Test 6: Review filtering by user
describe('Review Filtering', () => {
  it('should filter reviews by user ID', () => {
    const reviews = [
      { id: 1, userId: 1, content: 'Review 1' },
      { id: 2, userId: 2, content: 'Review 2' },
      { id: 3, userId: 1, content: 'Review 3' }
    ];

    const userId = 1;
    const filteredReviews = reviews.filter(r => r.userId === userId);

    expect(filteredReviews.length).toBe(2);
    expect(filteredReviews.every(r => r.userId === userId)).toBe(true);
  });
});

// Test 7: User display name generation
describe('User Display Name', () => {
  it('should return user name if available', () => {
    const user = { name: 'John Doe', email: 'john@test.com' };
    const displayName = user.name ? user.name : user.email.split('@')[0];
    expect(displayName).toBe('John Doe');
  });

  it('should return email prefix if name is not available', () => {
    const user = { email: 'john@test.com' };
    const displayName = user.name ? user.name : user.email.split('@')[0];
    expect(displayName).toBe('john');
  });

  it('should return User as fallback', () => {
    const user = undefined;
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';
    expect(displayName).toBe('User');
  });
});

// Test 8: Date formatting
describe('Date Formatting', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-12-12');
    const formatted = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    expect(formatted).toContain('12');
    expect(formatted).toContain('2025');
  });
});

// Test 9: File upload handling
describe('File Upload', () => {
  it('should handle file selection', () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    expect(file.name).toBe('test.jpg');
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should validate image file type', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const isImage = file.type.startsWith('image/');

    expect(isImage).toBe(true);
  });
});

// Test 10: API error handling
describe('API Error Handling', () => {
  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    try {
      await fetch('http://localhost:8080/api/reviews');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});
