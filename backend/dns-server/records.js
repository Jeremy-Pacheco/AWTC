/**
 * DNS Records for AWTC project
 * Server: 209.97.187.131
 * Backend: 8080 | Frontend: 5173
 */

const SERVER_IP = '209.97.187.131';

const records = {
  // ========================================
  // A Records (Forward Lookup: name -> IP)
  // ========================================
  A: {
    // Main domain
    'awtc.local': SERVER_IP,
    'www.awtc.local': SERVER_IP,
    
    // Backend services
    'backend.awtc.local': SERVER_IP,
    'api.awtc.local': SERVER_IP,
    
    // Frontend services
    'frontend.awtc.local': SERVER_IP,
    'app.awtc.local': SERVER_IP,
    
    // Admin dashboard
    'admin.awtc.local': SERVER_IP,
    'dashboard.awtc.local': SERVER_IP,
    
    // Swagger documentation
    'docs.awtc.local': SERVER_IP,
    'swagger.awtc.local': SERVER_IP,
    
    // Database (DigitalOcean)
    'db.awtc.local': 'db-mysql-lon1-73311-do-user-29593823-0.f.db.ondigitalocean.com',
    
    // Mail server (simulated)
    'mail.awtc.local': SERVER_IP,
  },

  // ========================================
  // CNAME Records (Alias: points to another name)
  // ========================================
  CNAME: {
    // Alias for main application
    'web.awtc.local': 'frontend.awtc.local',
    'portal.awtc.local': 'frontend.awtc.local',
    
    // Alias for API
    'rest.awtc.local': 'backend.awtc.local',
    'services.awtc.local': 'backend.awtc.local',
    
    // Alias for documentation
    'api-docs.awtc.local': 'swagger.awtc.local',
  },

  // ========================================
  // MX Records (Mail Exchange: mail server)
  // ========================================
  MX: {
    'awtc.local': {
      priority: 10,
      exchange: 'mail.awtc.local'
    },
    'backend.awtc.local': {
      priority: 10,
      exchange: 'mail.awtc.local'
    }
  },

  // ========================================
  // PTR Records (Reverse Lookup: IP -> name)
  // ========================================
  PTR: {
    // Format: reversed IP address + .in-addr.arpa
    // 209.97.187.131 -> 131.187.97.209.in-addr.arpa
    '131.187.97.209.in-addr.arpa': 'awtc.local',
  },

  // ========================================
  // TXT Records (additional information)
  // ========================================
  TXT: {
    'awtc.local': 'v=spf1 mx ~all',
    '_info.awtc.local': 'A Will To Change - Social management project'
  }
};

module.exports = records;
