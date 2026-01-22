import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

/**
 * TESTS DE COMPONENTES - UI
 * Testean renderizado, interacciones y estados de componentes
 * Requisito: 3 componentes (Simple, Auth, Asíncrono) usando render, screen.findByRole
 */

// Polyfills necesarios
if (typeof (globalThis as any).atob === 'undefined') {
  (globalThis as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof (globalThis as any).btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

beforeEach(() => {
  vi.clearAllMocks();
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
});

// ==================== TEST 1: Componente Simple - DarkModeToggle ====================
describe('Component UI Test 1: Simple Component - DarkModeToggle', () => {
  // Componente simple para test
  const SimpleDarkToggle = () => {
    const [isDark, setIsDark] = React.useState(false);
    
    return (
      <div>
        <input
          type="checkbox"
          role="switch"
          aria-label="Dark mode toggle"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
        />
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </div>
    );
  };

  /**
   * TEST: Renderizar toggle switch con role accesible
   * 
   * EXPLICACIÓN:
   * Verifica que el componente de toggle (Dark Mode) se renderiza correctamente
   * con atributos de accesibilidad apropiados. El role="switch" y aria-label
   * permiten que lectores de pantalla identifiquen el propósito del control.
   * Es fundamental para accesibilidad (a11y) - usuarios con discapacidades visuales
   * deben poder navegar y entender la función de cada elemento.
   */
  it('should render toggle switch with accessible role', () => {
    // Act
    render(<SimpleDarkToggle />);
    
    // Assert
    const toggle = screen.getByRole('switch', { name: /dark mode toggle/i });
    expect(toggle).toBeDefined();
  });

  /**
   * TEST: Alternar entre modo claro y oscuro
   * 
   * EXPLICACIÓN:
   * Prueba la funcionalidad interactiva del toggle:
   * 1. Estado inicial: unchecked, muestra "Light Mode"
   * 2. Usuario hace clic en el toggle
   * 3. Estado cambia: checked, muestra "Dark Mode"
   * 
   * Valida que el estado interno del componente (isDark) se actualiza correctamente
   * y que la UI refleja el cambio. Esencial para features de temas/preferencias
   * que mejoran la experiencia del usuario.
   */
  it('should toggle between light and dark mode', () => {
    // Arrange
    render(<SimpleDarkToggle />);
    const toggle = screen.getByRole('switch') as HTMLInputElement;
    
    // Assert initial state
    expect(toggle.checked).toBe(false);
    expect(screen.getByText('Light Mode')).toBeDefined();
    
    // Act
    fireEvent.click(toggle);
    
    // Assert changed state
    expect(toggle.checked).toBe(true);
    expect(screen.getByText('Dark Mode')).toBeDefined();
  });
});

// ==================== TEST 2: Componente Simple - Button ====================
describe('Component UI Test 2: Simple Component - Button', () => {
  const SimpleButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button role="button" onClick={onClick}>
      {children}
    </button>
  );

  /**
   * TEST: Renderizar botón con texto
   * 
   * EXPLICACIÓN:
   * Test básico de renderizado que verifica:
   * 1. El componente Button se monta sin errores
   * 2. El texto pasado como children aparece en el DOM
   * 3. El elemento es identificable por su role="button"
   * 
   * Es el test más fundamental - si el componente no se renderiza,
   * nada más funcionará. Base para tests más complejos de interacción.
   */
  it('should render button with text', () => {
    // Arrange
    const handleClick = vi.fn();
    
    // Act
    render(<SimpleButton onClick={handleClick}>Click Me</SimpleButton>);
    
    // Assert
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
  });

  /**
   * TEST: Llamar handler onClick cuando se hace clic
   * 
   * EXPLICACIÓN:
   * Verifica la funcionalidad principal de un botón - ejecutar acción al hacer clic:
   * 1. Se crea un mock function (spy) para rastrear llamadas
   * 2. Se simula un click con fireEvent
   * 3. Se confirma que la función fue llamada exactamente 1 vez
   * 
   * Valida que eventos se propagan correctamente del DOM al JavaScript.
   * Sin esto, el botón sería solo visual, sin funcionalidad.
   */
  it('should call onClick handler when clicked', () => {
    // Arrange
    const handleClick = vi.fn();
    render(<SimpleButton onClick={handleClick}>Submit</SimpleButton>);
    const button = screen.getByRole('button');
    
    // Act
    fireEvent.click(button);
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// ==================== TEST 3: Componente con Auth - AuthModal ====================
describe('Component UI Test 3: Auth Component - Login Form', () => {
  const LoginForm = ({ onSubmit }: { onSubmit: (email: string, password: string) => void }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(email, password);
    };

    return (
      <form onSubmit={handleSubmit} role="form" aria-label="Login form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          role="textbox"
          aria-label="Email input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password input"
        />
        <button type="submit" role="button">Login</button>
      </form>
    );
  };

  /**
   * TEST: Renderizar formulario de login con inputs
   * 
   * EXPLICACIÓN:
   * Verifica el renderizado completo de un formulario de autenticación:
   * 1. Formulario tiene role="form" con aria-label descriptivo
   * 2. Input de email tiene role="textbox" y es identificable
   * 3. Botón de submit está presente y accesible
   * 
   * Test estructural que asegura todos los elementos necesarios existen
   * y son accesibles antes de probar interacciones. Fundamental para
   * accesibilidad y para que tests subsecuentes funcionen.
   */
  it('should render login form with inputs', async () => {
    // Arrange
    const handleSubmit = vi.fn();
    
    // Act
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Assert
    const form = await screen.findByRole('form', { name: /login form/i });
    expect(form).toBeDefined();
    
    const emailInput = screen.getByRole('textbox', { name: /email input/i });
    expect(emailInput).toBeDefined();
    
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toBeDefined();
  });

  /**
   * TEST: Actualizar valores de inputs al cambiar
   * 
   * EXPLICACIÓN:
   * Prueba que los inputs controlados mantienen sincronización entre estado y DOM:
   * 1. Inputs comienzan vacíos (estado inicial)
   * 2. Usuario escribe en email y contraseña (fireEvent.change)
   * 3. Se verifica que el valor del input refleja lo escrito
   * 
   * Valida el binding bidireccional (two-way binding) típico de React.
   * Sin esto, usuarios no verían lo que escriben - experiencia rota.
   */
  it('should update input values on change', () => {
    // Arrange
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email input/i }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password input/i) as HTMLInputElement;
    
    // Act
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Assert
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  /**
   * TEST: Llamar onSubmit con datos del formulario
   * 
   * EXPLICACIÓN:
   * Verifica el flujo completo de envío de formulario:
   * 1. Usuario llena campos de email y contraseña
   * 2. Usuario hace clic en botón submit
   * 3. Se ejecuta handler onSubmit con los valores ingresados
   * 
   * Valida que datos del formulario se recopilan y pasan correctamente
   * al handler padre. Esencial para que formularios funcionen - sin esto,
   * los datos nunca llegarían al backend.
   */
  it('should call onSubmit with form data', () => {
    // Arrange
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email input/i });
    const passwordInput = screen.getByLabelText(/password input/i);
    const button = screen.getByRole('button', { name: /login/i });
    
    // Act
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.click(button);
    
    // Assert
    expect(handleSubmit).toHaveBeenCalledWith('user@test.com', 'pass123');
  });
});

// ==================== TEST 4: Componente Asíncrono - Categories List ====================
describe('Component UI Test 4: Async Component - Categories', () => {
  const AsyncCategoriesList = () => {
    const [categories, setCategories] = React.useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      fetch('http://localhost:8080/api/categories')
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div role="status">Loading categories...</div>;

    return (
      <ul role="list" aria-label="Categories list">
        {categories.map(cat => (
          <li key={cat.id} role="listitem">{cat.name}</li>
        ))}
      </ul>
    );
  };

  /**
   * TEST: Mostrar estado de carga inicialmente
   * 
   * EXPLICACIÓN:
   * Prueba el estado inicial de un componente asíncrono:
   * 1. fetch se mockea para nunca resolver (simula red lenta)
   * 2. Componente muestra "Loading categories..." mientras espera
   * 3. Se verifica presencia del elemento con role="status"
   * 
   * Importante para UX - usuarios deben saber que algo está pasando,
   * no ver pantalla en blanco. Loading states previenen confusión
   * y mejoran percepción de performance.
   */
  it('should show loading state initially', () => {
    // Arrange
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves
    
    // Act
    render(<AsyncCategoriesList />);
    
    // Assert
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeDefined();
    expect(loadingElement.textContent).toContain('Loading');
  });

  /**
   * TEST: Renderizar categorías después de fetch
   * 
   * EXPLICACIÓN:
   * Verifica el ciclo completo de carga de datos asíncronos:
   * 1. fetch se mockea para retornar 2 categorías
   * 2. Se espera a que el componente procese la respuesta
   * 3. Loading desaparece y aparece lista con role="list"
   * 4. Se confirma que hay 2 items con contenido correcto
   * 
   * Prueba que componente maneja correctamente: llamada API, transición
   * de estados, y renderizado de datos. Patrón fundamental en SPAs.
   */
  it('should render categories after fetch', async () => {
    // Arrange
    const mockCategories = [
      { id: 1, name: 'Web Development' },
      { id: 2, name: 'Mobile Apps' }
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      } as Response)
    );
    
    // Act
    render(<AsyncCategoriesList />);
    
    // Assert
    const list = await screen.findByRole('list', { name: /categories list/i });
    expect(list).toBeDefined();
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Web Development');
    expect(items[1].textContent).toBe('Mobile Apps');
  });
});

// ==================== TEST 5: Componente Asíncrono - Projects List ====================
describe('Component UI Test 5: Async Component - Projects', () => {
  const AsyncProjectsList = () => {
    const [projects, setProjects] = React.useState<{ id: number; name: string }[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      fetch('http://localhost:8080/api/projects')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then(data => {
          setProjects(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, []);

    if (loading) return <div role="status">Loading...</div>;
    if (error) return <div role="alert">Error: {error}</div>;

    return (
      <div role="region" aria-label="Projects section">
        <h2>Projects</h2>
        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <ul role="list">
            {projects.map(proj => (
              <li key={proj.id} role="listitem">{proj.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  /**
   * TEST: Renderizar lista de proyectos después de fetch exitoso
   * 
   * EXPLICACIÓN:
   * Similar al test de categorías pero con estructura más compleja:
   * 1. fetch mockea 3 proyectos
   * 2. Componente renderiza sección completa con título "Projects"
   * 3. Se verifica region con aria-label para accesibilidad
   * 4. Se confirman 3 items en lista con nombres correctos
   * 
   * Valida renderizado de listas más complejas con múltiples elementos.
   * Componentes de este tipo son core en aplicaciones tipo dashboard.
   */
  it('should render projects list after successful fetch', async () => {
    // Arrange
    const mockProjects = [
      { id: 1, name: 'Project Alpha' },
      { id: 2, name: 'Project Beta' },
      { id: 3, name: 'Project Gamma' }
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProjects)
      } as Response)
    );
    
    // Act
    render(<AsyncProjectsList />);
    
    // Assert
    const section = await screen.findByRole('region', { name: /projects section/i });
    expect(section).toBeDefined();
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('Project Alpha');
  });

  /**
   * TEST: Mostrar mensaje de error al fallar fetch
   * 
   * EXPLICACIÓN:
   * Prueba el manejo de errores en componentes asíncronos:
   * 1. fetch se mockea para fallar (ok: false)
   * 2. Componente captura el error
   * 3. Se renderiza mensaje de error con role="alert"
   * 4. Se verifica que texto contiene "Error"
   * 
   * Crítico para resiliencia - redes fallan, servidores caen.
   * Usuario debe ver mensaje informativo, no aplicación rota o vacía.
   * Mejora confianza y permite al usuario intentar de nuevo.
   */
  it('should show error message on fetch failure', async () => {
    // Arrange
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error('Failed to fetch'))
      } as Response)
    );
    
    // Act
    render(<AsyncProjectsList />);
    
    // Assert
    const errorElement = await screen.findByRole('alert');
    expect(errorElement).toBeDefined();
    expect(errorElement.textContent).toContain('Error');
  });

  /**
   * TEST: Mostrar estado vacío cuando no hay proyectos
   * 
   * EXPLICACIÓN:
   * Verifica el caso edge de respuesta exitosa pero sin datos:
   * 1. fetch retorna array vacío [] (sin error, pero sin proyectos)
   * 2. Componente detecta longitud 0
   * 3. Se muestra mensaje "No projects found" en lugar de lista vacía
   * 
   * Importante para UX - distinguir entre "cargando", "error" y "sin datos".
   * Usuario debe saber que la carga funcionó pero simplemente no hay
   * proyectos aún, evitando confusión.
   */
  it('should show empty state when no projects', async () => {
    // Arrange
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      } as Response)
    );
    
    // arrange
    render(<AsyncProjectsList />);
  
    // Assert
    await waitFor(() => {
      const emptyMessage = screen.getByText(/no projects found/i);
      expect(emptyMessage).toBeDefined();
    });
  });
});
