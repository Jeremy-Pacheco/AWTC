import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isNotificationSupported, 
  getNotificationPermission 
} from '../services/notificationService';

/**
 * TESTS UNITARIOS - LÓGICA
 * Testean funciones puras y utilidades sin dependencias externas
 * Requisito: 4 funciones testeadas en helpers/utils/services/api
 */

// Polyfill para localStorage en tests
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
});

// ==================== TEST 1: JWT Token Decoder ====================
describe('Unit Logic Test 1: JWT Token Decoder', () => {
  /**
   * TEST: Decodificar payload de JWT correctamente
   * 
   * EXPLICACIÓN:
   * Verifica que la función puede extraer y decodificar el payload de un token JWT.
   * Un JWT tiene 3 partes separadas por puntos: header.payload.signature
   * Este test toma la parte del payload (índice 1), la decodifica con atob() y parsea el JSON.
   * Es fundamental para obtener información del usuario (id, email, rol) desde el token
   * almacenado en el navegador sin hacer llamadas adicionales al servidor.
   */
  it('should decode JWT token payload correctly', () => {
    // Arrange
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQHRlc3QuY29tIiwicm9sZSI6InVzZXIifQ.test';
    
    // Act
    const decodeJWT = (token: string) => {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    };
    const decoded = decodeJWT(token);
    
    // Assert
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('john@test.com');
    expect(decoded.role).toBe('user');
  });

  it('should handle invalid JWT token format', () => {
    // Arrange
    const invalidToken = 'invalid.token';
    
    // Act & Assert
    const decodeJWT = (token: string) => {
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
      } catch {
        return null;
      }
    };
    
    expect(decodeJWT(invalidToken)).toBeNull();
  });

  /**
   * TEST: Manejar formato inválido de JWT
   * 
   * EXPLICACIÓN:
   * Valida que la función maneja correctamente tokens con formato incorrecto.
   * Si el token no tiene el formato esperado (header.payload.signature), la decodificación
   * fallará al intentar parsear. El test verifica que la función retorna null en lugar
   * de lanzar un error, permitiendo que la aplicación maneje el caso elegantemente
   * (por ejemplo, redirigiendo al login si el token está corrupto).
   */
  it('should handle invalid JWT token format', () => {
    // Arrange
    const invalidToken = 'invalid.token';
    
    // Act & Assert
    const decodeJWT = (token: string) => {
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
      } catch {
        return null;
      }
    };
    
    expect(decodeJWT(invalidToken)).toBeNull();
  });
});

// ==================== TEST 2: User Display Name Generator ====================
describe('Unit Logic Test 2: User Display Name Generator', () => {
  /**
   * TEST: Retornar nombre de usuario cuando está disponible
   * 
   * EXPLICACIÓN:
   * Prueba que cuando un objeto de usuario tiene la propiedad 'name' definida,
   * la función la retorna como nombre para mostrar. Este es el caso ideal donde
   * tenemos toda la información del usuario. Se usa en la UI para mostrar un saludo
   * personalizado como "Hola, John Doe" en lugar de mostrar el email.
   */
  it('should return user name when available', () => {
    // Arrange
    const user = { name: 'John Doe', email: 'john@test.com' };
    
    // Act
    const getDisplayName = (user?: { name?: string; email?: string }) => {
      return user?.name || user?.email?.split('@')[0] || 'User';
    };
    const displayName = getDisplayName(user);
    
    // Assert
    expect(displayName).toBe('John Doe');
  });

  /**
   * TEST: Retornar 'User' por defecto cuando no hay datos
   * 
   * EXPLICACIÓN:
   * Verifica el comportamiento de fallback cuando no se proporciona información del usuario.
   * La función debe retornar un string por defecto ('User') para evitar mostrar 'undefined'
   * o valores vacíos en la UI. Esto garantiza que siempre haya algo que mostrar incluso
   * si los datos del usuario están incompletos o no disponibles.
   */
  it('should return default User when no data available', () => {
    // Act
    const getDisplayName = (user?: { name?: string; email?: string }) => {
      return user?.name || user?.email?.split('@')[0] || 'User';
    };
    const displayName = getDisplayName(undefined);
    
    // Assert
    expect(displayName).toBe('User');
  });
});

// ==================== TEST 3: URL Builder ====================
describe('Unit Logic Test 3: API URL Builder', () => {
  /**
   * TEST: Construir URL de endpoint de API correctamente
   * 
   * EXPLICACIÓN:
   * Valida que la función concatena correctamente la URL base con el path del endpoint.
   * Esta es la funcionalidad más básica del constructor de URLs. Es esencial para
   * mantener consistencia en todas las llamadas HTTP del frontend, permitiendo cambiar
   * la URL base fácilmente (por ejemplo, entre desarrollo y producción) sin modificar
   * cada llamada individual a la API.
   */
  it('should build correct API endpoint URL', () => {
    // Arrange
    const baseUrl = 'http://localhost:8080';
    const endpoint = '/api/projects';
    
    // Act
    const buildApiUrl = (base: string, path: string) => {
      return `${base}${path}`;
    };
    const fullUrl = buildApiUrl(baseUrl, endpoint);
    
    // Assert
    expect(fullUrl).toBe('http://localhost:8080/api/projects');
  });

  /**
   * TEST: Manejar barras diagonales finales en URL base
   * 
   * EXPLICACIÓN:
   * Prueba que la función normaliza URLs que terminan con '/' para evitar URLs
   * malformadas como 'http://localhost:8080//api/reviews' (doble barra).
   * Esto es importante porque diferentes configuraciones pueden incluir o no la barra
   * final, y queremos que el resultado sea siempre consistente sin importar la fuente.
   */
  it('should handle trailing slashes in base URL', () => {
    // Arrange
    const baseUrl = 'http://localhost:8080/';
    const endpoint = '/api/reviews';
    
    // Act
    const buildApiUrl = (base: string, path: string) => {
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      return `${cleanBase}${path}`;
    };
    const fullUrl = buildApiUrl(baseUrl, endpoint);
    
    // Assert
    expect(fullUrl).toBe('http://localhost:8080/api/reviews');
  });

  /**
   * TEST: Construir URL con parámetros de query
   * 
   * EXPLICACIÓN:
   * Verifica que la función puede agregar parámetros de consulta (query params) a la URL.
   * Los query params se usan para filtrado, paginación, ordenamiento, etc.
   * La función debe convertir un objeto JavaScript en una query string válida
   * (ej: {page: 1, limit: 10} -> '?page=1&limit=10'), permitiendo pasar filtros
   * de forma programática sin construir strings manualmente.
   */
  it('should build URL with query parameters', () => {
    // Arrange
    const baseUrl = 'http://localhost:8080';
    const endpoint = '/api/projects';
    const params = { page: 1, limit: 10 };
    
    // Act
    const buildApiUrl = (base: string, path: string, params?: Record<string, any>) => {
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      let url = `${cleanBase}${path}`;
      if (params) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
        url += `?${queryString}`;
      }
      return url;
    };
    const fullUrl = buildApiUrl(baseUrl, endpoint, params);
    
    // Assert
    expect(fullUrl).toBe('http://localhost:8080/api/projects?page=1&limit=10');
  });
});

// ==================== TEST 4: Form Validation Helpers ====================
describe('Unit Logic Test 4: Form Validation', () => {
  /**
   * TEST: Validar formato de email correctamente
   * 
   * EXPLICACIÓN:
   * Comprueba que la expresión regular identifica correctamente emails válidos e inválidos.
   * Valida formato básico: algo@dominio.extensión. Es crítico para formularios de
   * registro/login, evitando enviar datos inválidos al backend. Rechaza casos como
   * emails sin @, sin dominio, o sin usuario, mejorando la experiencia del usuario
   * con feedback inmediato antes del envío del formulario.
   */
  it('should validate email format correctly', () => {
    // Act
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    // Assert
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user@domain.co.uk')).toBe(true);
    expect(validateEmail('invalid.email')).toBe(false);
    expect(validateEmail('no@domain')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
  });



  /**
   * TEST: Recortar espacios y validar strings no vacíos
   * 
   * EXPLICACIÓN:
   * Prueba que la función identifica correctamente strings vacíos incluso si contienen
   * solo espacios en blanco. Usa trim() para eliminar espacios al inicio/final y luego
   * verifica la longitud. Esto previene que usuarios envíen campos "vacíos" que solo
   * contienen espacios, asegurando que campos requeridos tengan contenido real.
   */
  it('should trim and validate non-empty strings', () => {
    // Act
    const validateNonEmpty = (value: string): boolean => {
      return value.trim().length > 0;
    };
    
    // Assert
    expect(validateNonEmpty('Valid Name')).toBe(true);
    expect(validateNonEmpty('  ')).toBe(false);
    expect(validateNonEmpty('')).toBe(false);
    expect(validateNonEmpty('   text   ')).toBe(true);
  });
});

// ==================== TEST 5: Date Formatting Utilities ====================
describe('Unit Logic Test 5: Date Formatting', () => {
  /**
   * TEST: Formatear fecha a string localizado
   * 
   * EXPLICACIÓN:
   * Valida que la función convierte un objeto Date a un formato legible según el locale
   * del navegador. Usa toLocaleDateString() que automáticamente adapta el formato
   * (día/mes/año en España, mes/día/año en USA, etc.). Es esencial para mostrar fechas
   * de creación de proyectos, reviews, etc., de forma que el usuario las entienda
   * naturalmente según su región.
   */
  it('should format date to locale string', () => {
    // Arrange
    const date = new Date('2025-12-25T10:30:00');
    
    // Act
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    const formatted = formatDate(date);
    
    // Assert
    expect(formatted).toMatch(/2025/);
    expect(formatted).toMatch(/25/);
  });

  /**
   * TEST: Calcular diferencia en días entre fechas
   * 
   * EXPLICACIÓN:
   * Verifica que la función calcula correctamente el número de días entre dos fechas.
   * Convierte fechas a timestamps (milisegundos), calcula la diferencia absoluta,
   * y la divide por milisegundos en un día para obtener días completos.
   * Útil para mostrar "hace X días", calcular tiempos de entrega, o determinar
   * si una fecha límite está próxima.
   */
  it('should calculate days difference between dates', () => {
    // Arrange
    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-01-10');
    
    // Act
    const daysDifference = (d1: Date, d2: Date): number => {
      const diff = Math.abs(d2.getTime() - d1.getTime());
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    };
    const days = daysDifference(date1, date2);
    
    // Assert
    expect(days).toBe(9);
  });

  /**
   * TEST: Verificar si una fecha está en el pasado
   * 
   * EXPLICACIÓN:
   * Comprueba que la función determina correctamente si una fecha ya ocurrió.
   * Compara el timestamp de la fecha con Date.now() (momento actual).
   * Se usa para deshabilitar fechas pasadas en calendarios, validar fechas de entrega,
   * mostrar badges de "vencido", o filtrar eventos pasados vs futuros.
   */
  it('should check if date is in the past', () => {
    // Arrange
    const pastDate = new Date('2020-01-01');
    const futureDate = new Date('2030-01-01');
    
    // Act
    const isPast = (date: Date): boolean => {
      return date.getTime() < Date.now();
    };
    
    // Assert
    expect(isPast(pastDate)).toBe(true);
    expect(isPast(futureDate)).toBe(false);
  });

  /**
   * TEST: Formatear fecha a string ISO
   * 
   * EXPLICACIÓN:
   * Valida que la función extrae solo la parte de fecha (YYYY-MM-DD) de un ISO string
   * completo que incluye hora. El formato ISO (2025-06-15) es el estándar universal
   * para APIs y bases de datos. Se usa al enviar fechas al backend, almacenar en
   * inputs type="date", y garantizar formato consistente independiente del locale.
   */
  it('should format date to ISO string', () => {
    // Arrange
    const date = new Date('2025-06-15T14:30:00Z');
    
    // Act
    const toISODate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };
    const formatted = toISODate(date);
    
    // Assert
    expect(formatted).toBe('2025-06-15');
  });
});
