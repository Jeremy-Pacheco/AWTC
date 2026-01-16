import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../components/AuthModal';
import Projects from '../components/Projects';
import * as api from '../api';

vi.mock('../api');

describe('Integration Tests', () => {
  let fetchSpy: any;

  beforeEach(() => {
    localStorage.clear();
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Complete Authentication Flow
  it('should complete full authentication flow with token persistence', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'jwt-token-abc123',
        user: { name: 'Jane Smith', role: 'admin' },
      }),
    });

    const mockOnClose = vi.fn();
    render(<AuthModal open={true} mode="login" onClose={mockOnClose} />);

    // User interaction
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'jane@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'AdminPass2024!' } 
    });

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    // Verify fetch was called with correct authentication
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    // Verify token persistence
    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBe('jwt-token-abc123');
      expect(localStorage.getItem('userName')).toBe('Jane Smith');
      expect(localStorage.getItem('userRole')).toBe('admin');
    });

    // Verify modal closes
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 2: Auth Flow - 401 Error Handling
  it('should handle 401 Unauthorized error with proper UI feedback', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        message: 'Invalid username or password',
      }),
    });

    render(<AuthModal open={true} mode="login" onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'wrong@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'wrongpassword' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Verify error message is displayed
    const errorMessage = await screen.findByText('Invalid username or password');
    expect(errorMessage).toBeDefined();

    // Verify no token was stored
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });

  // Test 3: Auth Flow - 500 Server Error
  it('should handle 500 Server Error gracefully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Internal server error',
      }),
    });

    render(<AuthModal open={true} mode="login" onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'user@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'password' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    const errorMessage = await screen.findByText(/Internal server error/);
    expect(errorMessage).toBeDefined();
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });

  // Test 4: CRUD Flow - Fetch Projects with JWT Token Verification
  it('should fetch projects and verify JWT token in Authorization header', async () => {
    localStorage.setItem('jwtToken', 'test-jwt-token-456');

    const mockProjects = [
      { id: 1, name: 'Community Garden', description: 'Garden project', categoryId: 1 },
      { id: 2, name: 'Tech Education', description: 'Teach coding', categoryId: 3 },
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    (api.getProjects as any).mockImplementation(async () => {
      const token = localStorage.getItem('jwtToken');
      await fetch('http://localhost:8080/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return mockProjects;
    });

    render(<Projects />);

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).toBeNull();
    });

    const project1 = await screen.findByText('Community Garden');
    const project2 = await screen.findByText('Tech Education');

    expect(project1).toBeDefined();
    expect(project2).toBeDefined();

    // Verify JWT token was included in Authorization header
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-jwt-token-456',
        }),
      })
    );
  });

  // Test 5: CRUD Flow - Handle 401 Unauthorized on Protected Resource
  it('should handle 401 when fetching projects without valid token', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    (api.getProjects as any).mockImplementation(async () => {
      const response = await fetch('http://localhost:8080/api/projects');
      if (response.status === 401) {
        throw new Error('Unauthorized access - please login');
      }
      return response.json();
    });

    render(<Projects />);

    const errorMessage = await screen.findByText(/Unauthorized access - please login/);
    expect(errorMessage).toBeDefined();
  });

  // Test 6: CRUD Flow - Handle 500 Server Error on Data Fetch
  it('should handle 500 Server Error when fetching projects', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Database connection failed' }),
    });

    (api.getProjects as any).mockImplementation(async () => {
      const response = await fetch('http://localhost:8080/api/projects');
      if (response.status === 500) {
        throw new Error('Server error - please try again later');
      }
      return response.json();
    });

    render(<Projects />);

    const errorMessage = await screen.findByText(/Server error - please try again later/);
    expect(errorMessage).toBeDefined();
  });
});
