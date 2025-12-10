# DNS Server Documentation - AWTC

## 1. Introduction {#introduction}

This document details the implementation of a DNS server using Node.js for the AWTC project. The server resolves local domain names (`.awtc.local`) to the production server's IP address.

**Project Infrastructure:**
- **Server:** 209.97.187.131
- **Backend:** Port 8080 (Express.js)
- **Frontend:** Port 5173 (React + Vite)
- **Database:** MySQL on DigitalOcean
- **DNS Server:** Port 5454 (Node.js + dns2)

---

## 2. Dependencies Installation {#installation}

### 2.1. Install dns2 library

Navigate to the backend directory and install the required package:

```bash
cd AWTC/backend
npm install dns2
```

### 2.2. Verify installation

The `dns2` dependency was correctly added to `package.json`:

```json
{
  "dependencies": {
    "dns2": "^2.1.0"
  }
}
```

### 2.3. Created file structure

The DNS server implementation consists of the following files:

```
AWTC/backend/
└── dns-server/
    ├── dns-server.js    # Main DNS server
    ├── records.js       # DNS records (A, CNAME, MX, PTR)
    └── README.md        # Technical documentation
```

---

## 3. Forward Zone Configuration {#forward-zone}

### 3.1. A Records (name → IP)

The following A records were configured in `records.js`:

| Name                    | Type | IP             | Purpose                       |
|-------------------------|------|----------------|-------------------------------|
| awtc.local              | A    | 209.97.187.131 | Main domain                   |
| www.awtc.local          | A    | 209.97.187.131 | Main website                  |
| backend.awtc.local      | A    | 209.97.187.131 | Backend API (port 8080)       |
| frontend.awtc.local     | A    | 209.97.187.131 | Frontend (port 5173)          |
| api.awtc.local          | A    | 209.97.187.131 | REST API                      |
| admin.awtc.local        | A    | 209.97.187.131 | Admin dashboard               |
| swagger.awtc.local      | A    | 209.97.187.131 | Swagger documentation         |
| mail.awtc.local         | A    | 209.97.187.131 | Mail server                   |

### 3.2. CNAME Records (aliases)

| Alias                 | Points to           | Purpose                       |
|-----------------------|---------------------|-------------------------------|
| web.awtc.local        | frontend.awtc.local | Alias for web application     |
| portal.awtc.local     | frontend.awtc.local | Alternative alias             |
| rest.awtc.local       | backend.awtc.local  | Alias for REST services       |
| api-docs.awtc.local   | swagger.awtc.local  | Alias for API documentation   |

### 3.3. MX Records (Mail Exchange)

| Domain               | Priority | Mail server       |
|----------------------|----------|-------------------|
| awtc.local           | 10       | mail.awtc.local   |
| backend.awtc.local   | 10       | mail.awtc.local   |

---

## 4. Reverse Zone Configuration {#reverse-zone}

### 4.1. PTR Records (IP → name)

To implement Reverse Lookup, the following PTR record was configured:

| Reversed IP Address                 | Type | Resolves to |
|-------------------------------------|------|-------------|
| 131.187.97.209.in-addr.arpa         | PTR  | awtc.local  |

**Explanation:** The IP address `209.97.187.131` is reversed to `131.187.97.209` and `.in-addr.arpa` is appended to create the reverse zone entry.

---

## 5. Forward Lookup Tests {#forward-lookup}

### 5.1. Start the DNS server

First, start the DNS server in one terminal:

```bash
cd AWTC/backend
npm run dns
```

**Expected output:**
```
🚀 ========================================
   DNS UDP Server started
   Host: 0.0.0.0
   Port: 5454
   Protocol: UDP
   Status: ✅ Listening for queries...

   📍 Accessible from:
      - Localhost: 127.0.0.1:5454
      - Local network: [Your IP]:5454
      - Production: 209.97.187.131:5454
========================================

🚀 DNS TCP Server started on port 5454
```

### 5.2. Install dig tool (if not installed)

On Windows, install dig using Chocolatey:

```powershell
choco install bind-toolsonly
```

On Linux/Mac (usually pre-installed):
```bash
# Ubuntu/Debian
sudo apt-get install dnsutils

# macOS
brew install bind
```

### 5.3. Test A record (direct resolution)

Open a new terminal and test a direct A record:

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 www.awtc.local A
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 www.awtc.local A
```

**Expected result:**
```
;; ANSWER SECTION:
www.awtc.local.     300    IN    A    209.97.187.131
```

### 5.4. Test another A record

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 backend.awtc.local A
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 backend.awtc.local A
```

**Expected result:**
```
;; ANSWER SECTION:
backend.awtc.local.     300    IN    A    209.97.187.131
```

### 5.5. Test CNAME record (alias resolution)

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 web.awtc.local A
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 web.awtc.local A
```

**Expected result:**
```
;; ANSWER SECTION:
web.awtc.local.         300    IN    CNAME    frontend.awtc.local.
frontend.awtc.local.    300    IN    A        209.97.187.131
```

**Explanation:** The CNAME record first resolves `web.awtc.local` to `frontend.awtc.local`, then resolves the A record to get the IP address.

### 5.6. Test MX record (mail server)

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 awtc.local MX
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 awtc.local MX
```

**Expected result:**
```
;; ANSWER SECTION:
awtc.local.    300    IN    MX    10 mail.awtc.local.
```

---

## 6. Reverse Lookup Tests {#reverse-lookup}

### 6.1. Test PTR record (IP → name resolution)

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 -x 209.97.187.131
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 -x 209.97.187.131
```

**Expected result:**
```
;; ANSWER SECTION:
131.187.97.209.in-addr.arpa. 300 IN PTR awtc.local.
```

**Explanation:** The `-x` flag automatically reverses the IP address and queries for the PTR record.

### 6.2. Test PTR record (direct query)

Alternatively, you can query the reversed format directly:

**PowerShell:**
```powershell
dig "@127.0.0.1" -p 5454 131.187.97.209.in-addr.arpa PTR
```

**Git Bash / CMD:**
```bash
dig @127.0.0.1 -p 5454 131.187.97.209.in-addr.arpa PTR
```

**Expected result:**
```
;; ANSWER SECTION:
131.187.97.209.in-addr.arpa.  300  IN  PTR  awtc.local.
```

### 6.3. DNS server logs

The DNS server displays all processed queries in the console with detailed information:

```
[2025-12-03T10:30:15.234Z] 📡 DNS query received:
   Name: www.awtc.local
   Type: A (IPv4)
   From: 127.0.0.1:54321
   ✅ A resolved: www.awtc.local -> 209.97.187.131

[2025-12-03T10:30:18.567Z] 📡 DNS query received:
   Name: 131.187.97.209.in-addr.arpa
   Type: PTR (Reverse)
   From: 127.0.0.1:54322
   ✅ PTR resolved: 131.187.97.209.in-addr.arpa -> awtc.local
```

---

## 7. Concepts Explanation {#concepts}

### 7.1. Forward Lookup (Direct Resolution)

**Definition:**  
Forward Lookup is the process of converting a **domain name** into an **IP address**. This is the most common DNS operation used when accessing websites or services.

**How does it work?**
1. A client requests to resolve a domain name (e.g., `www.awtc.local`)
2. The DNS server searches its database for matching records
3. For CNAME records, it first resolves the alias to the canonical name, then resolves that to an IP
4. Returns the corresponding IP address to the client

**Record types used in Forward Lookup:**

- **A (Address Record):** Direct mapping from hostname to IPv4 address
  - Example: `www.awtc.local` → `209.97.187.131`
  
- **CNAME (Canonical Name):** Alias that points to another hostname
  - Example: `web.awtc.local` → `frontend.awtc.local` → `209.97.187.131`
  
- **MX (Mail Exchange):** Specifies mail servers for the domain
  - Example: `awtc.local` → `mail.awtc.local` (priority 10)

**Practical example:**
```
User types: www.awtc.local
DNS Server: Searches for A record
Response: 209.97.187.131
Result: Browser connects to 209.97.187.131
```

**Use cases:**
- Accessing websites by typing domain names in a browser
- Email delivery using MX records
- API endpoint discovery
- Service location and load balancing
- Human-readable names for network resources

---

### 7.2. Reverse Lookup (Inverse Resolution)

**Definition:**  
Reverse Lookup is the inverse process: it converts an **IP address** back into a **domain name**. This is less common but critical for certain security and verification scenarios.

**How does it work?**
1. The IP address is reversed octet by octet
   - `209.97.187.131` becomes `131.187.97.209`
2. The special domain `.in-addr.arpa` is appended
   - Result: `131.187.97.209.in-addr.arpa`
3. The DNS server searches for a PTR (Pointer) record matching this reversed format
4. Returns the associated domain name

**Reverse zone format:**
```
Original IP:        209.97.187.131
Reversed format:    131.187.97.209
Complete PTR name:  131.187.97.209.in-addr.arpa
Resolves to:        awtc.local
```

**Record type used:**
- **PTR (Pointer Record):** Maps IP addresses to domain names

**Practical example:**
```
Query: Who is 209.97.187.131?
DNS Server: Searches for 131.187.97.209.in-addr.arpa
Response: awtc.local
Result: IP verified as belonging to awtc.local
```

**Use cases:**

1. **Email server verification (Anti-spam):**
   - SMTP servers check that the sending server's IP has a valid PTR record
   - Emails from IPs without PTR records are often flagged as spam
   - Example: Gmail verifies that 209.97.187.131 → awtc.local

2. **Security logging and forensics:**
   - Firewall logs can show hostnames instead of just IP addresses
   - Makes it easier to identify sources of attacks or suspicious activity
   - Example: Log shows "connection from awtc.local" instead of "connection from 209.97.187.131"

3. **Network troubleshooting:**
   - Verify bidirectional DNS configuration
   - Confirm that forward and reverse lookups match
   - Example: Check that www.awtc.local → 209.97.187.131 → awtc.local

4. **Service authentication:**
   - Some services require valid PTR records for access
   - Ensures the connecting host is properly configured
   - Example: SSH servers can enforce reverse DNS checks

---

### 7.3. Forward vs Reverse Lookup Comparison

| Aspect              | Forward Lookup            | Reverse Lookup                    |
|---------------------|---------------------------|-----------------------------------|
| **Input**           | Domain name               | IP address                        |
| **Output**          | IP address                | Domain name                       |
| **Records used**    | A, AAAA, CNAME, MX        | PTR                               |
| **Zone type**       | Forward zone              | Reverse zone (in-addr.arpa)       |
| **Common use**      | Web browsing, API calls   | Email verification, logging       |
| **Frequency**       | Very high (millions/day)  | Lower (on-demand verification)    |
| **Mandatory**       | Yes (for all services)    | No (but highly recommended)       |
| **Example**         | www.awtc.local → 209.97.187.131 | 209.97.187.131 → awtc.local |

### 7.4. Why both are important

**Forward Lookup** enables the basic functionality of the internet - allowing users to access services using human-readable names instead of memorizing IP addresses.

**Reverse Lookup** adds a layer of verification and trust - confirming that an IP address legitimately belongs to the claimed domain, which is crucial for security and anti-spam measures.

Together, they form a complete DNS infrastructure that is both user-friendly and secure.

---

## 8. Conclusions {#conclusions}

### 8.1. Achieved objectives

This project successfully implemented a fully functional DNS server using Node.js:

- **dns2 Library Installation:** Successfully installed and configured the dns2 package for DNS protocol handling  
- **Forward Zone Configuration:** Implemented 8 A records, 4 CNAME records, and 2 MX records  
- **Reverse Zone Configuration:** Configured PTR record for reverse IP-to-name resolution  
- **Forward Lookup Testing:** All forward queries (A, CNAME, MX) resolve correctly using dig  
- **Reverse Lookup Testing:** PTR queries successfully resolve IP addresses to domain names  
- **Complete Documentation:** Comprehensive documentation with concept explanations and test evidence  

### 8.2. Technical learnings

Through this project, the following technical skills and knowledge were acquired:

- **DNS Protocol Understanding:** Deep comprehension of how DNS works at the protocol level
- **Node.js DNS Implementation:** Practical experience implementing a DNS server using JavaScript
- **DNS Record Types:** Hands-on configuration of A, CNAME, MX, and PTR records
- **Forward vs Reverse Resolution:** Clear understanding of bidirectional DNS resolution
- **DNS Testing Tools:** Proficiency with dig command-line tool for DNS queries
- **Network Protocols:** Understanding of UDP/TCP protocols for DNS communication

### 8.3. Practical applications

This DNS server implementation demonstrates:

- **Scalability:** The server can handle multiple simultaneous queries efficiently
- **Flexibility:** Easy to add or modify DNS records by editing records.js
- **Production-ready:** Can be deployed to DigitalOcean or any Node.js hosting platform
- **Educational value:** Excellent tool for understanding DNS infrastructure

### 8.4. Possible improvements

Future enhancements could include:

1. **DNS over TLS (DoT):** Implement encrypted DNS queries for enhanced security
2. **IPv6 Support:** Add AAAA records for IPv6 address resolution
3. **Query Caching:** Implement response caching to improve performance
4. **Rate Limiting:** Add protection against DNS amplification attacks
5. **Dynamic Updates:** Allow programmatic updates to DNS records via API
6. **Database Backend:** Store records in a database instead of a JavaScript file
7. **Load Balancing:** Support multiple A records for the same hostname
8. **DNSSEC:** Implement DNS Security Extensions for cryptographic verification

---

## 📚 References

- [dns2 - npm Package](https://www.npmjs.com/package/dns2) - Official documentation for the dns2 library
- [RFC 1035 - Domain Names Implementation](https://www.rfc-editor.org/rfc/rfc1035) - Official DNS protocol specification
- [ISC BIND dig tool](https://www.isc.org/bind/) - DNS query tool documentation
- [AWTC Project - Backend](http://209.97.187.131:8080/) - Production backend server
- [AWTC Project - Frontend](http://209.97.187.131:5173/) - Production frontend application

---

## 📝 Appendix: Quick Reference Commands

### Start DNS Server
```bash
cd AWTC/backend
npm run dns
```

### Test Commands

**PowerShell:**
```powershell
# A record
dig "@127.0.0.1" -p 5454 www.awtc.local A

# CNAME record
dig "@127.0.0.1" -p 5454 web.awtc.local A

# MX record
dig "@127.0.0.1" -p 5454 awtc.local MX

# PTR record (reverse)
dig "@127.0.0.1" -p 5454 -x 209.97.187.131
```

**Git Bash / CMD:**
```bash
# A record
dig @127.0.0.1 -p 5454 www.awtc.local A

# CNAME record
dig @127.0.0.1 -p 5454 web.awtc.local A

# MX record
dig @127.0.0.1 -p 5454 awtc.local MX

# PTR record (reverse)
dig @127.0.0.1 -p 5454 -x 209.97.187.131
```

### Package.json Scripts
```json
{
  "scripts": {
    "dns": "node dns-server/dns-server.js",
    "dns:prod": "cross-env DNS_PORT=53 node dns-server/dns-server.js"
  }
}
```

