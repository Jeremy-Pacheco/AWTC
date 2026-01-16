import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import Projects from '../components/Projects';
import * as api from '../api';

vi.mock('../api');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'footer.tagline': 'Connecting volunteers worldwide',
        'footer.explore': 'Explore',
        'footer.company': 'Company',
        'footer.legal': 'Legal',
        'footer.contact': 'Contact',
        'footer.terms': 'Terms',
        'footer.privacy': 'Privacy',
        'footer.copyright': '© 2026 AWTC',
        'nav.home': 'Home',
        'nav.volunteering': 'Volunteering',
        'nav.info': 'More Info',
        'nav.aboutUs': 'About Us',
      };
      return translations[key] || key;
    },
  }),
}));

describe('Component Tests - Simple Static UI', () => {
  // Test 1: Footer - Componente estático
  it('should render Footer with all navigation links and logo', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByAltText('AWTC Logo')).toBeDefined();
    expect(screen.getByText('Connecting volunteers worldwide')).toBeDefined();
    expect(screen.getByText('Explore')).toBeDefined();
    expect(screen.getByText('Company')).toBeDefined();
    expect(screen.getByText('Legal')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Volunteering')).toBeDefined();
    expect(screen.getByText('About Us')).toBeDefined();
  });
});

describe('Component Tests - Authentication Interaction', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 2: AuthModal - Login form rendering
  it('should render login form with email and password inputs', () => {
    render(<AuthModal open={true} mode="login" onClose={() => {}} />);

    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /log in/i })).toBeDefined();
  });

  // Test 3: AuthModal - Successful login with token storage
  it('should handle successful login and store token', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'test-jwt-token-123',
        user: { name: 'John Doe', role: 'volunteer' },
      }),
    });

    const mockOnClose = vi.fn();
    render(<AuthModal open={true} mode="login" onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'SecurePass123' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBe('test-jwt-token-123');
      expect(localStorage.getItem('userName')).toBe('John Doe');
      expect(localStorage.getItem('userRole')).toBe('volunteer');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test 4: AuthModal - Error handling
  it('should display error message on failed login', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<AuthModal open={true} mode="login" onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'wrong@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'wrongpass' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    const errorMessage = await screen.findByText('Invalid credentials');
    expect(errorMessage).toBeDefined();
  });
});

describe('Component Tests - Asynchronous Data Fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 5: Projects - Loading state
  it('should display loading state initially', () => {
    (api.getProjects as any).mockImplementation(() => new Promise(() => {}));

    render(<Projects />);

    expect(screen.getByText('Loading projects...')).toBeDefined();
  });

  // Test 6: Projects - Successful data fetch and render
  it('should fetch and display projects using findByText', async () => {
    const mockProjects = [
      { id: 1, name: 'Beach Cleanup', description: 'Clean the beach', categoryId: 1 },
      { id: 2, name: 'Food Bank Help', description: 'Help at food bank', categoryId: 2 },
      { id: 3, name: 'Tree Planting', description: 'Plant trees', categoryId: 1 },
    ];

    (api.getProjects as any).mockResolvedValueOnce(mockProjects);

    render(<Projects />);

    // Verify loading disappears
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).toBeNull();
    });

    // Use findByText for async rendering
    const beachProject = await screen.findByText('Beach Cleanup');
    const foodBankProject = await screen.findByText('Food Bank Help');
    const treePlantingProject = await screen.findByText('Tree Planting');

    expect(beachProject).toBeDefined();
    expect(foodBankProject).toBeDefined();
    expect(treePlantingProject).toBeDefined();
    expect(screen.getByText(/Clean the beach/)).toBeDefined();
  });
});
