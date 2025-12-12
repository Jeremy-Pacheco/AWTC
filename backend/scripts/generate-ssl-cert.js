const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '../ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('📁 Created ssl directory');
}

const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ SSL certificates already exist');
  console.log(`   Certificate: ${certPath}`);
  console.log(`   Private key: ${keyPath}`);
  process.exit(0);
}

console.log('🔐 Generating self-signed SSL certificates for local development...\n');

try {
  // Domain name for the certificate (use localhost for development)
  const domain = process.env.SSL_DOMAIN || 'localhost';
  
  // Generate self-signed certificate using OpenSSL
  const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=ES/ST=Madrid/L=Madrid/O=AWTC/OU=Development/CN=${domain}" -addext "subjectAltName=DNS:${domain},DNS:*.${domain},DNS:localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ SSL certificates generated successfully!');
  console.log(`   Certificate: ${certPath}`);
  console.log(`   Private key: ${keyPath}`);
  console.log(`   Domain: ${domain}`);
  console.log('\n⚠️  Note: These are self-signed certificates for development only.');
  console.log('   Your browser will show a security warning - this is normal.');
  console.log('   Click "Advanced" and "Proceed" to continue.\n');
  
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  console.log('\n💡 Make sure OpenSSL is installed:');
  console.log('   - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   - Or install via Chocolatey: choco install openssl');
  console.log('   - Linux/Mac: Usually pre-installed\n');
  process.exit(1);
}
