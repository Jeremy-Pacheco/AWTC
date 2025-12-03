/**
 * DNS Server for AWTC using Node.js + dns2
 * Implements Forward Lookup (A, CNAME, MX) and Reverse Lookup (PTR)
 */

const { UDPServer, TCPServer, Packet } = require('dns2');
const records = require('./records');

// DNS Port (5454 for development, 53 for production with admin permissions)
const DNS_PORT = process.env.DNS_PORT || 5454;

// Host - 0.0.0.0 listens on all interfaces (localhost + network)
const DNS_HOST = process.env.DNS_HOST || '0.0.0.0';

/**
 * Main function to handle DNS queries
 */
const handleDNSRequest = (request, send, rinfo) => {
  const response = Packet.createResponseFromRequest(request);
  const [question] = request.questions;
  const { name, type } = question;

  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] DNS query received:`);
  console.log(`   Name: ${name}`);
  console.log(`   Type: ${getTypeName(type)}`);
  console.log(`   From: ${rinfo.address}:${rinfo.port}`);

  try {
    // ========================================
    // A Records (Forward Lookup)
    // ========================================
    if (type === Packet.TYPE.A) {
      handleARecord(name, response);
    }

    // ========================================
    // MX Records (Mail Exchange)
    // ========================================
    if (type === Packet.TYPE.MX) {
      handleMXRecord(name, response);
    }

    // ========================================
    // PTR Records (Reverse Lookup)
    // ========================================
    if (type === Packet.TYPE.PTR) {
      handlePTRRecord(name, response);
    }

    // ========================================
    // TXT Records (text information)
    // ========================================
    if (type === Packet.TYPE.TXT) {
      handleTXTRecord(name, response);
    }

    // If no answers, add an informative message
    if (response.answers.length === 0) {
      console.log(`   [X] No record found for: ${name}`);
    }

  } catch (error) {
    console.error(`   [ERROR] Error processing DNS query:`, error.message);
  }

  send(response);
};

/**
 * Handles A records (name -> IP)
 * Also resolves CNAME if the name is an alias
 */
function handleARecord(name, response) {
  const ip = records.A[name];
  
  // Check if it's a CNAME (alias)
  if (!ip && records.CNAME[name]) {
    const realName = records.CNAME[name];
    const realIp = records.A[realName];
    
    if (realIp) {
      // Add CNAME record
      response.answers.push({
        name: name,
        type: Packet.TYPE.CNAME,
        class: Packet.CLASS.IN,
        ttl: 300,
        domain: realName
      });
      
      // Add A record for the real name
      response.answers.push({
        name: realName,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 300,
        address: realIp
      });
      
      console.log(`   [OK] CNAME resolved: ${name} -> ${realName} -> ${realIp}`);
    }
  } 
  // If it has a direct IP (A record)
  else if (ip) {
    response.answers.push({
      name: name,
      type: Packet.TYPE.A,
      class: Packet.CLASS.IN,
      ttl: 300,
      address: ip
    });
    
    console.log(`   [OK] A resolved: ${name} -> ${ip}`);
  }
}

/**
 * Handles MX records (mail server)
 */
function handleMXRecord(name, response) {
  const mx = records.MX[name];
  
  if (mx) {
    response.answers.push({
      name: name,
      type: Packet.TYPE.MX,
      class: Packet.CLASS.IN,
      ttl: 300,
      priority: mx.priority,
      exchange: mx.exchange
    });
    
    console.log(`   [OK] MX resolved: ${name} -> ${mx.exchange} (priority ${mx.priority})`);
  }
}

/**
 * Handles PTR records (IP -> name) - Reverse Lookup
 */
function handlePTRRecord(name, response) {
  const domain = records.PTR[name];
  
  if (domain) {
    response.answers.push({
      name: name,
      type: Packet.TYPE.PTR,
      class: Packet.CLASS.IN,
      ttl: 300,
      domain: domain
    });
    
    console.log(`   [OK] PTR resolved: ${name} -> ${domain}`);
  }
}

/**
 * Handles TXT records (text information)
 */
function handleTXTRecord(name, response) {
  const txt = records.TXT[name];
  
  if (txt) {
    response.answers.push({
      name: name,
      type: Packet.TYPE.TXT,
      class: Packet.CLASS.IN,
      ttl: 300,
      data: txt
    });
    
    console.log(`   [OK] TXT resolved: ${name} -> ${txt}`);
  }
}

/**
 * Converts DNS type numeric code to readable name
 */
function getTypeName(type) {
  const types = {
    [Packet.TYPE.A]: 'A (IPv4)',
    [Packet.TYPE.AAAA]: 'AAAA (IPv6)',
    [Packet.TYPE.CNAME]: 'CNAME (Alias)',
    [Packet.TYPE.MX]: 'MX (Mail)',
    [Packet.TYPE.PTR]: 'PTR (Reverse)',
    [Packet.TYPE.TXT]: 'TXT (Text)',
    [Packet.TYPE.NS]: 'NS (Nameserver)',
  };
  return types[type] || `UNKNOWN (${type})`;
}

// ========================================
// Create UDP server (main for DNS)
// ========================================
const udpServer = new UDPServer({
  type: 'udp4'  // Specify IPv4 explicitly
});

udpServer.on('request', handleDNSRequest);

udpServer.on('listening', () => {
  console.log('\n========================================');
  console.log('   DNS UDP Server started');
  console.log(`   Host: ${DNS_HOST}`);
  console.log(`   Port: ${DNS_PORT}`);
  console.log(`   Protocol: UDP`);
  console.log('   Status: Listening for queries...');
  console.log('\n   Accessible from:');
  console.log(`      - Localhost: 127.0.0.1:${DNS_PORT}`);
  console.log(`      - Local network: [Your IP]:${DNS_PORT}`);
  console.log(`      - Production: 209.97.187.131:${DNS_PORT}`);
  console.log('========================================\n');
});

udpServer.on('error', (err) => {
  console.error('[ERROR] Error in DNS UDP server:', err.message);
  process.exit(1);
});

// ========================================
// Create TCP server (optional, for large queries)
// ========================================
const tcpServer = new TCPServer();

tcpServer.on('request', handleDNSRequest);

tcpServer.on('listening', () => {
  console.log('DNS TCP Server started on port', DNS_PORT);
});

tcpServer.on('error', (err) => {
  console.error('[ERROR] Error in DNS TCP server:', err.message);
});

// ========================================
// Start servers
// ========================================
udpServer.bind(DNS_PORT, DNS_HOST);
tcpServer.listen(DNS_PORT, DNS_HOST);

// Signal handling for graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n[STOP] Closing DNS server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n[STOP] Closing DNS server...');
  process.exit(0);
});

module.exports = { udpServer, tcpServer };
