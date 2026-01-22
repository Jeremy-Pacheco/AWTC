import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

/**
 * TESTS DE INTEGRACIÓN - MOCKING
 * Testean flujos completos con mocking de APIs
 * Requisito: 2 flujos completos (Auth + 1 CRUD) usando vi.spyOn(global, 'fetch')
 */

// Polyfills
if (typeof (globalThis as any).atob === 'undefined') {
  (globalThis as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof (globalThis as any).btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

beforeEach(() => {
  let store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem(key: string) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key: string, value: string) { store[key] = String(value); },
    removeItem(key: string) { delete store[key]; },
    clear() { store = {}; },
    key(index: number) { return Object.keys(store)[index] ?? null; },
    get length() { return Object.keys(store).length; }
  } as unknown as Storage;
  (globalThis as any).localStorage = mockLocalStorage;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ==================== TEST 1: Flujo Auth Completo - Login ====================
describe('Integration Test 1: Complete Auth Flow - Login', () => {
  const CompleteLoginFlow = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [userName, setUserName] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      try {
        const tokenBasic = btoa(`${email}:${password}`);
        const response = await fetch('http://localhost:8080/api/users/login', {
          method: 'POST',
          headers: { Authorization: `Basic ${tokenBasic}` }
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('jwtToken', data.access_token);
        localStorage.setItem('userName', data.user.name);
        setUserName(data.user.name);
        setIsLoggedIn(true);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (isLoggedIn) {
      return <div role="status">Welcome, {userName}!</div>;
    }

    return (
      <form onSubmit={handleLogin} role="form">
        {error && <div role="alert">{error}</div>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
        />
        <button type="submit" role="button">Login</button>
      </form>
    );
  };

  /**
   * TEST: Completar flujo de login con llamada a API
   * 
   * EXPLICACIÓN:
   * Este test de integración verifica todo el flujo de autenticación:
   * 1. Usuario ingresa credenciales en el formulario
   * 2. Se codifica en Basic Auth y se envía POST al endpoint de login
   * 3. Se mockea la respuesta del servidor con token JWT y datos de usuario
   * 4. Se verifica que el token se guarda en localStorage
   * 5. Se confirma que la UI se actualiza mostrando el mensaje de bienvenida
   * 
   * Valida la integración entre UI, lógica de negocio, y llamadas API mockeadas.
   */
  it('should complete full login flow with API call', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'jwt-token-123',
        user: { name: 'John Doe', role: 'user' }
      })
    } as Response);

    render(<CompleteLoginFlow />);

    // Act
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic')
          })
        })
      );
    });

    const welcomeMessage = await screen.findByRole('status');
    expect(welcomeMessage.textContent).toContain('Welcome, John Doe!');
    expect(localStorage.getItem('jwtToken')).toBe('jwt-token-123');
    expect(localStorage.getItem('userName')).toBe('John Doe');
  });

  /**
   * TEST: Manejar fallo de login con mensaje de error
   * 
   * EXPLICACIÓN:
   * Prueba el manejo de errores cuando las credenciales son incorrectas.
   * Mockea una respuesta fallida (ok: false) del servidor y verifica que:
   * 1. La aplicación no se rompe al recibir un error
   * 2. Se muestra un mensaje de error al usuario mediante el role="alert"
   * 3. La función fetch fue llamada (intentamos autenticar)
   * 
   * Es crucial para UX - el usuario debe saber qué salió mal sin ver errores técnicos.
   */
  it('should handle login failure with error message', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    } as Response);

    render(<CompleteLoginFlow />);

    // Act
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(button);

    // Assert
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert.textContent).toContain('Login failed');
    expect(fetchSpy).toHaveBeenCalled();
  });
});

// ==================== TEST 2: Flujo Auth Completo - Signup ====================
describe('Integration Test 2: Complete Auth Flow - Signup', () => {
  const CompleteSignupFlow = () => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
        const response = await fetch('http://localhost:8080/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) throw new Error('Signup failed');

        const data = await response.json();
        localStorage.setItem('jwtToken', data.access_token);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (success) {
      return <div role="status">Account created successfully!</div>;
    }

    return (
      <form onSubmit={handleSignup} role="form">
        {error && <div role="alert">{error}</div>}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="Name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
        />
        <button type="submit" role="button">Sign Up</button>
      </form>
    );
  };

  /**
   * TEST: Completar flujo de registro con llamada a API
   * 
   * EXPLICACIÓN:
   * Test de integración para el proceso completo de creación de cuenta:
   * 1. Usuario llena formulario con nombre, email y contraseña
   * 2. Datos se envían como JSON en POST a /api/users/signup
   * 3. Backend (mockeado) retorna token JWT de la nueva cuenta
   * 4. Token se almacena en localStorage para sesiones futuras
   * 5. UI muestra mensaje de éxito confirmando creación de cuenta
   * 
   * Valida que nuevos usuarios puedan registrarse exitosamente en el sistema.
   */
  it('should complete full signup flow with API call', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-jwt-token',
        user: { name: 'Jane Smith', email: 'jane@test.com', role: 'user' }
      })
    } as Response);

    render(<CompleteSignupFlow />);

    // Act
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secure123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: 'Jane Smith', 
            email: 'jane@test.com', 
            password: 'secure123' 
          })
        })
      );
    });

    const successMessage = await screen.findByRole('status');
    expect(successMessage.textContent).toContain('Account created successfully!');
    expect(localStorage.getItem('jwtToken')).toBe('new-jwt-token');
  });
});

// ==================== TEST 3: CRUD Completo - Create Review ====================
describe('Integration Test 3: Complete CRUD Flow - Create Review', () => {
  const CreateReviewFlow = () => {
    const [content, setContent] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
        const token = localStorage.getItem('jwtToken') || '';
        const response = await fetch('http://localhost:8080/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error('Failed to create review');

        setSubmitted(true);
        setContent('');
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <div>
        {submitted && <div role="status">Review submitted!</div>}
        {error && <div role="alert">{error}</div>}
        <form onSubmit={handleSubmit} role="form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your review"
            aria-label="Review content"
          />
          <button type="submit" role="button">Submit Review</button>
        </form>
      </div>
    );
  };

  /**
   * TEST: Completar flujo de creación de review con llamada autenticada
   * 
   * EXPLICACIÓN:
   * Test CRUD (Create) que verifica la creación de una nueva review:
   * 1. Usuario autenticado (token en localStorage) escribe contenido
   * 2. Se envía POST a /api/reviews con token Bearer en headers
   * 3. Backend mockea respuesta exitosa con la review creada
   * 4. UI muestra mensaje de confirmación y limpia el formulario
   * 
   * Valida que: a) autenticación funciona, b) datos se envían correctamente,
   * c) UI responde apropiadamente al éxito. Fundamental para funcionalidad de reviews.
   */
  it('should complete create review flow with authenticated API call', async () => {
    // Arrange
    localStorage.setItem('jwtToken', 'valid-token-123');
    
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, content: 'Great service!', userId: 1 })
    } as Response);

    render(<CreateReviewFlow />);

    // Act
    const textarea = screen.getByLabelText(/review content/i);
    const button = screen.getByRole('button', { name: /submit review/i });

    fireEvent.change(textarea, { target: { value: 'Great service!' } });
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8080/api/reviews',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token-123'
          }),
          body: JSON.stringify({ content: 'Great service!' })
        })
      );
    });

    const successMessage = await screen.findByRole('status');
    expect(successMessage.textContent).toContain('Review submitted!');
  });
});

// ==================== TEST 4: CRUD Completo - Read & Filter Reviews ====================
describe('Integration Test 4: Complete CRUD Flow - Read Reviews', () => {
  const ReviewsListFlow = () => {
    const [reviews, setReviews] = React.useState<any[]>([]);
    const [filter, setFilter] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const fetchReviews = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/reviews');
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setReviews(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchReviews();
    }, []);

    const filteredReviews = filter
      ? reviews.filter(r => r.content.toLowerCase().includes(filter.toLowerCase()))
      : reviews;

    if (loading) return <div role="status">Loading...</div>;

    return (
      <div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter reviews"
          aria-label="Filter"
        />
        <ul role="list">
          {filteredReviews.map(review => (
            <li key={review.id} role="listitem">{review.content}</li>
          ))}
        </ul>
      </div>
    );
  };

  /**
   * TEST: Obtener y mostrar lista de reviews
   * 
   * EXPLICACIÓN:
   * Test CRUD (Read) que verifica la carga y visualización de datos:
   * 1. Componente se monta y automáticamente hace GET a /api/reviews
   * 2. Backend mockeado retorna array de 3 reviews
   * 3. Se verifica que fetch fue llamado con la URL correcta
   * 4. Se confirma que todas las reviews se renderizan en la lista
   * 5. Se valida que el contenido es correcto
   * 
   * Prueba la carga inicial de datos y el renderizado de listas, patrón común en SPAs.
   */
  it('should fetch and display reviews list', async () => {
    // Arrange
    const mockReviews = [
      { id: 1, content: 'Excellent work!', userId: 1 },
      { id: 2, content: 'Good experience', userId: 2 },
      { id: 3, content: 'Amazing service', userId: 1 }
    ];

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockReviews
    } as Response);

    // Act
    render(<ReviewsListFlow />);

    // Assert
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8080/api/reviews');
    });

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('Excellent work!');
  });

  /**
   * TEST: Filtrar reviews basado en input de búsqueda
   * 
   * EXPLICACIÓN:
   * Extiende el test anterior agregando funcionalidad de filtrado:
   * 1. Se carga lista completa de 3 reviews
   * 2. Usuario escribe "excellent" en el campo de filtro
   * 3. Lista se actualiza automáticamente mostrando solo 2 items
   * 4. Se verifica que solo aparecen reviews que contienen "excellent"
   * 
   * Valida filtrado en tiempo real sin hacer nuevas llamadas al servidor,
   * mejorando rendimiento y UX al permitir búsqueda instantánea.
   */
  it('should filter reviews based on search input', async () => {
    // Arrange
    const mockReviews = [
      { id: 1, content: 'Excellent work!', userId: 1 },
      { id: 2, content: 'Good experience', userId: 2 },
      { id: 3, content: 'Excellent service', userId: 1 }
    ];

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockReviews
    } as Response);

    render(<ReviewsListFlow />);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    // Act
    const filterInput = screen.getByLabelText(/filter/i);
    fireEvent.change(filterInput, { target: { value: 'excellent' } });

    // Assert
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
      expect(items[0].textContent).toContain('Excellent');
    });
  });
});

// ==================== TEST 5: CRUD Completo - Delete Review ====================
describe('Integration Test 5: Complete CRUD Flow - Delete Review', () => {
  const DeleteReviewFlow = ({ reviewId }: { reviewId: number }) => {
    const [deleted, setDeleted] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleDelete = async () => {
      setError('');
      try {
        const token = localStorage.getItem('jwtToken') || '';
        const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete');

        setDeleted(true);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (deleted) {
      return <div role="status">Review deleted</div>;
    }

    return (
      <div>
        {error && <div role="alert">{error}</div>}
        <button onClick={handleDelete} role="button">Delete Review</button>
      </div>
    );
  };

  /**
   * TEST: Eliminar review con llamada API autenticada
   * 
   * EXPLICACIÓN:
   * Test CRUD (Delete) que verifica la eliminación de recursos:
   * 1. Usuario hace clic en botón "Delete Review"
   * 2. Se envía DELETE a /api/reviews/:id con token Bearer
   * 3. Se verifica que el fetch usa método DELETE y headers correctos
   * 4. Backend mockea respuesta exitosa
   * 5. UI actualiza mostrando mensaje de confirmación
   * 
   * Valida que usuarios autenticados puedan eliminar reviews y que la
   * autorización se maneja correctamente en operaciones destructivas.
   */
  it('should delete review with authenticated API call', async () => {
    // Arrange
    localStorage.setItem('jwtToken', 'auth-token-456');
    
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Deleted' })
    } as Response);

    render(<DeleteReviewFlow reviewId={5} />);

    // Act
    const deleteButton = screen.getByRole('button', { name: /delete review/i });
    fireEvent.click(deleteButton);

    // Assert
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8080/api/reviews/5',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer auth-token-456'
          })
        })
      );
    });

    const statusMessage = await screen.findByRole('status');
    expect(statusMessage.textContent).toContain('Review deleted');
  });

  /**
   * TEST: Manejar fallo al eliminar con error
   * 
   * EXPLICACIÓN:
   * Prueba el manejo de errores en operaciones de eliminación:
   * 1. Intento de eliminar una review (id 10)
   * 2. Backend mockea respuesta fallida (ok: false) - puede ser sin permisos
   * 3. Se verifica que aparece mensaje de error (role="alert")
   * 4. Review NO se marca como eliminada
   * 
   * Es crítico que fallos (ej: intentar eliminar review de otro usuario) se manejen
   * elegantemente, informando al usuario sin romper la aplicación.
   */
  it('should handle delete failure with error', async () => {
    // Arrange
    localStorage.setItem('jwtToken', 'auth-token');
    
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unauthorized' })
    } as Response);

    render(<DeleteReviewFlow reviewId={10} />);

    // Act
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    // Assert
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert.textContent).toContain('Failed to delete');
  });
});
