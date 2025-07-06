import express from 'express';
import request from 'supertest';
import {
  enhancedSecurity
} from '../../src/middleware/security';

// ===================================================================
// COMPREHENSIVE TEST DATA - HAPPY PATH (Should PASS)
// ===================================================================

export const validTestData = {
  // Basic legitimate data
  simpleValid: [
    { name: 'John Doe', email: 'john@example.com', role: 'user' },
    { title: 'Software Engineer', department: 'Engineering', salary: 75000 },
    { description: 'A normal description with safe content', tags: ['web', 'api', 'database'] }
  ],

  // Edge cases that should still be valid
  edgeCasesValid: [
    { name: '', email: 'empty@example.com', optional: null }, // Empty strings
    { text: 'A'.repeat(1000) }, // Large but acceptable content
    { numbers: [1, 2, 3, 100000, -500] }, // Various number ranges
    { unicode: 'José García-Müller' }, // Unicode characters
    { special: 'Price: $99.99 (50% off!)' }, // Safe special characters
    { html: '&lt;safe&gt; HTML entities' }, // Properly encoded HTML
    { json: { nested: { deep: { valid: true } } } }, // Moderate nesting (safe)
    { array: Array(50).fill('item') }, // Medium arrays (safe)
    { mixed: 'Text with numbers 123 and symbols: @#$%^&*()' }
  ],

  // International and diverse content
  internationalValid: [
    { name: '张三', email: 'zhangsan@example.com', language: 'zh' },
    { name: 'Владимир', email: 'vladimir@example.com', language: 'ru' },
    { name: 'محمد', email: 'mohamed@example.com', language: 'ar' },
    { description: 'Café naïve résumé', currency: '€' },
    { text: 'Emoji test: 🚀 🎉 ✅ 👍' }
  ],

  // Business valid scenarios
  businessValid: [
    {
      candidate: {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0123',
        experience: '5 years',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
        resume: 'Senior software engineer with extensive experience in full-stack development...'
      }
    },
    {
      position: {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120,000 - $160,000',
        requirements: ['5+ years experience', 'React expertise', 'Team leadership'],
        benefits: ['Health insurance', '401k matching', 'Remote work option']
      }
    }
  ]
};

// ===================================================================
// MALICIOUS TEST DATA - SAD PATH (Should FAIL/BLOCK)
// ===================================================================

export const maliciousTestData = {
  // XSS Attack Vectors
  xssAttacks: [
    { content: '<script>alert("XSS")</script>' },
    { html: '<img src="x" onerror="alert(1)">' },
    { link: '<a href="javascript:alert(1)">Click me</a>' },
    { iframe: '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>' },
    { svg: '<svg onload="alert(1)"></svg>' },
    { input: '<input onfocus="alert(1)" autofocus>' },
    { style: '<style>body{background:url("javascript:alert(1)")}</style>' },
    { nested: { deep: '<script>nested.attack()</script>' } },
    { array: ['<script>array[0]</script>', 'safe', '<img onerror="array[2]">'] }
  ],

  // SQL Injection Vectors
  sqlInjection: [
    { email: "admin'; DROP TABLE users; --" },
    { search: "' UNION SELECT * FROM passwords --" },
    { id: "1 OR 1=1" },
    { filter: "'; INSERT INTO admin VALUES('hacker','pass'); --" },
    { order: "name'; DELETE FROM customers; --" },
    { login: "admin'/**/OR/**/1=1#" },
    { blind: "admin' AND (SELECT COUNT(*) FROM users) > 0 --" },
    { time: "admin'; WAITFOR DELAY '00:00:05'; --" },
    { stacked: "1'; EXEC xp_cmdshell('dir'); --" }
  ],

  // ReDoS (Regular Expression DoS) Attacks
  redosAttacks: [
    { pattern: 'a'.repeat(50000) + 'b' }, // Exponential backtracking
    { css: 'div:nth-child(' + 'n+1'.repeat(1000) + ')' }, // nth-check ReDoS
    { regex: '('.repeat(1000) + 'a' + ')'.repeat(1000) }, // Nested groups
    { email: 'a@' + 'b'.repeat(10000) + '.com' }, // Email validation ReDoS
    { phone: '(' + '1'.repeat(10000) + ')' }, // Phone ReDoS
    { url: 'http://' + 'a'.repeat(10000) + '.com' } // URL ReDoS
  ],

  // DOM Clobbering Attacks
  domClobbering: [
    { content: '<form><input name="eval"></form>' },
    { html: '<div id="__webpack_require__">malicious</div>' },
    { payload: 'constructor.constructor("alert(1)")()' },
    { proto: '__proto__[isAdmin]=true' },
    { name: 'constructor' },
    { id: '__defineGetter__' },
    { form: '<form><input name="location"><input name="href"></form>' }
  ],

  // Template Injection Attacks
  templateInjection: [
    { template: '${constructor.constructor("return process")().env}' },
    { expression: '{{constructor.constructor("alert(1)")()}}' },
    { server: '${global.process.mainModule.require("child_process").exec("whoami")}' },
    { client: '{{this.constructor.constructor("alert(1)")()}}' },
    { angular: '{{constructor.constructor("document.cookie")()}}' },
    { handlebars: '{{#with "constructor"}}{{lookup . "constructor"}}{{/with}}' }
  ],

  // Header-based Attacks
  headerAttacks: [
    { 'X-Injection': '<script>alert(1)</script>' },
    { 'User-Agent': 'Mozilla/5.0 <script>alert(1)</script>' },
    { 'Referer': 'javascript:alert(document.domain)' },
    { 'X-Forwarded-For': '127.0.0.1; DROP TABLE users; --' },
    { 'Cookie': '__proto__[isAdmin]=true' },
    { 'Accept-Language': '../../../etc/passwd' },
    { 'Content-Type': 'application/json; charset=utf-8<script>alert(1)</script>' }
  ],

  // DoS Attacks
  dosAttacks: [
    { data: 'x'.repeat(10000000) }, // 10MB payload
    { nested: JSON.parse('{"a":'.repeat(200) + '1' + '}'.repeat(200)) }, // Deep nesting
    { fields: Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`field${i}`, 'value'])) },
    { array: Array(100000).fill('item') }, // Massive array
    { recursive: { a: { b: { c: { d: { e: 'deep' } } } } } } // Moderate but excessive nesting
  ],

  // Path Traversal Attacks
  pathTraversal: [
    { file: '../../../etc/passwd' },
    { path: '..\\..\\..\\windows\\system32\\config\\sam' },
    { encoded: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd' },
    { double: '....//....//....//etc/passwd' },
    { null: '../../../etc/passwd\0.jpg' },
    { unicode: '\u002e\u002e\u002f\u002e\u002e\u002f\u002e\u002e\u002fetc\u002fpasswd' }
  ],

  // Cookie Manipulation
  cookieAttacks: [
    'malicious=__proto__[isAdmin]=true',
    'session="; document.cookie="admin=true',
    'auth=\x00\x01\x02malicious',
    'token=javascript:alert(1)',
    'user=<script>alert(1)</script>',
    'data=../../etc/passwd'
  ],

  // CSS Injection Attacks
  cssAttacks: [
    { styles: 'body { background: url("javascript:alert(1)") }' },
    { css: '@import "javascript:alert(1)";' },
    { expression: 'div { width: expression(alert(1)); }' },
    { data: 'background: url("data:text/html,<script>alert(1)</script>")' },
    { unicode: 'body { background: \\75 \\72 \\6C \\28 \\6A \\61 \\76 \\61 \\73 \\63 \\72 \\69 \\70 \\74 \\3A \\61 \\6C \\65 \\72 \\74 \\28 \\31 \\29 \\29; }' }
  ]
};

// ===================================================================
// BOUNDARY CONDITIONS AND EDGE CASES
// ===================================================================

export const boundaryTestData = {
  // Size boundaries
  sizeBoundaries: [
    { small: '' }, // Empty
    { medium: 'x'.repeat(1000) }, // 1KB
    { large: 'x'.repeat(100000) }, // 100KB
    { xlarge: 'x'.repeat(1000000) }, // 1MB (should be at limit)
    { toolarge: 'x'.repeat(2000000) } // 2MB (should fail)
  ],

  // Nesting boundaries
  nestingBoundaries: Array.from({ length: 10 }, (_, depth) => {
    let obj: any = 'deep';
    for (let i = 0; i < depth * 20; i++) {
      obj = { nested: obj };
    }
    return { depth: depth * 20, data: obj };
  }),

  // Field count boundaries
  fieldBoundaries: Array.from({ length: 5 }, (_, i) => {
    const count = Math.pow(10, i + 1); // 10, 100, 1000, 10000, 100000
    return {
      fieldCount: count,
      data: Object.fromEntries(Array.from({ length: count }, (_, j) => [`field${j}`, `value${j}`]))
    };
  }),

  // Header count boundaries
  headerBoundaries: Array.from({ length: 5 }, (_, i) => {
    const count = i * 50 + 50; // 50, 100, 150, 200, 250 headers
    return {
      count,
      headers: Object.fromEntries(Array.from({ length: count }, (_, j) => [`X-Header-${j}`, `value${j}`]))
    };
  }),

  // String length boundaries for different fields
  stringBoundaries: [
    { type: 'name', values: ['', 'A', 'A'.repeat(50), 'A'.repeat(255), 'A'.repeat(1000), 'A'.repeat(10000)] },
    { type: 'email', values: ['', 'a@b.c', 'user@domain.com', 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com'] },
    { type: 'description', values: ['', 'Short', 'A'.repeat(1000), 'A'.repeat(10000), 'A'.repeat(100000)] }
  ]
};

// ===================================================================
// ERROR CONDITION TEST CASES
// ===================================================================

export const errorTestData = {
  // Malformed data that should trigger specific errors
  malformedData: [
    { invalid: undefined },
    { circular: (() => { const obj: any = {}; obj.self = obj; return obj; })() },
    { badJson: '{"incomplete": true' },
    { wrongType: { number: 'not a number', boolean: 'not a boolean', array: 'not an array' } },
    { nullProto: Object.create(null) },
    { symbol: { key: Symbol('test') } }
  ],

  // Network/connection errors simulation
  networkErrors: [
    { timeout: true, delay: 30000 }, // Should timeout
    { corruption: 'partially\x00corrupted\x01data' },
    { encoding: Buffer.from('binary data', 'binary').toString() },
    { incomplete: { data: 'truncated' } } // Incomplete transmission simulation
  ],

  // Authentication/authorization edge cases
  authErrors: [
    { token: '' }, // Empty token
    { token: 'invalid.jwt.token' }, // Malformed JWT
    { token: 'expired_token_123' }, // Expired token
    { permissions: [] }, // No permissions
    { role: null }, // Null role
    { session: 'hijacked_session' } // Session hijacking attempt
  ]
};

// ===================================================================
// COMPREHENSIVE SECURITY TEST SUITE
// ===================================================================

describe('🛡️ COMPREHENSIVE SECURITY VALIDATION SUITE', () => {
  // ===============================================================
  // HAPPY PATH TESTS - All should PASS
  // ===============================================================

  describe('✅ HAPPY PATH - Valid Data Processing', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(enhancedSecurity);
      app.post('/test', (req, res) => res.json({ received: req.body }));
      app.get('/test', (req, res) => res.json({ received: req.query }));
    });

    it('should accept all simple valid data', async () => {
      for (const validData of validTestData.simpleValid) {
        const response = await request(app)
          .post('/test')
          .send(validData)
          .expect(200);

        expect(response.body.received).toEqual(validData);
      }
    });

    it('should handle edge cases that are still valid', async () => {
      for (const edgeCase of validTestData.edgeCasesValid) {
        const response = await request(app)
          .post('/test')
          .send(edgeCase)
          .expect(200);

        expect(response.body.received).toEqual(edgeCase);
      }
    });

    it('should process international content correctly', async () => {
      for (const intlData of validTestData.internationalValid) {
        const response = await request(app)
          .post('/test')
          .send(intlData)
          .expect(200);

        expect(response.body.received).toEqual(intlData);
      }
    });

    it('should handle business scenarios successfully', async () => {
      for (const businessData of validTestData.businessValid) {
        const response = await request(app)
          .post('/test')
          .send(businessData)
          .expect(200);

        expect(response.body.received).toEqual(businessData);
      }
    });
  });

  // ===============================================================
  // SAD PATH TESTS - All should FAIL/BLOCK
  // ===============================================================

  describe('🚫 SAD PATH - Malicious Data Blocking', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(enhancedSecurity);
      app.post('/test', (req, res) => res.json({ received: req.body }));
      app.get('/test', (req, res) => res.json({ received: req.query }));
    });

    it('should block all XSS attack vectors', async () => {
      for (const xssAttack of maliciousTestData.xssAttacks) {
        const response = await request(app)
          .post('/test')
          .send(xssAttack);

        // Should either block (400) or sanitize (200 but cleaned)
        if (response.status === 200) {
          // If allowed through, content should be sanitized
          const receivedContent = JSON.stringify(response.body.received);
          expect(receivedContent).not.toMatch(/<script|onerror|javascript:|onload|onfocus/i);
        } else {
          expect(response.status).toBe(400);
          expect(response.body.code).toBeDefined();
        }
      }
    });

    it('should block all SQL injection attempts', async () => {
      for (const sqlAttack of maliciousTestData.sqlInjection) {
        const response = await request(app)
          .post('/test')
          .send(sqlAttack)
          .expect(400);

        expect(response.body.code).toBe('SUSPICIOUS_INPUT');
      }
    });

    it('should prevent ReDoS attacks', async () => {
      for (const redosAttack of maliciousTestData.redosAttacks) {
        const response = await request(app)
          .post('/test')
          .send(redosAttack)
          .expect(400);

        expect(response.body.code).toBe('REDOS_PATTERN');
      }
    });

    it('should block DOM clobbering attempts', async () => {
      for (const domAttack of maliciousTestData.domClobbering) {
        const response = await request(app)
          .post('/test')
          .send(domAttack);

        expect(response.status).toBe(400);
        expect(['DOM_CLOBBERING_BLOCKED', 'SUSPICIOUS_INPUT']).toContain(response.body.code);
      }
    });

    it('should prevent template injection', async () => {
      for (const templateAttack of maliciousTestData.templateInjection) {
        const response = await request(app)
          .post('/test')
          .send(templateAttack)
          .expect(400);

        expect(response.body.code).toBe('TEMPLATE_INJECTION');
      }
    });

    it('should block DoS attacks', async () => {
      for (const dosAttack of maliciousTestData.dosAttacks) {
        const response = await request(app)
          .post('/test')
          .send(dosAttack)
          .expect(400);

        expect(['EXCESSIVE_NESTING', 'PAYLOAD_TOO_LARGE', 'SUSPICIOUS_INPUT']).toContain(response.body.code);
      }
    });

    it('should prevent path traversal', async () => {
      for (const pathAttack of maliciousTestData.pathTraversal) {
        const response = await request(app)
          .post('/test')
          .send(pathAttack)
          .expect(400);

        expect(response.body.code).toBeDefined();
      }
    });

    it('should block malicious cookies', async () => {
      for (const cookieAttack of maliciousTestData.cookieAttacks) {
        const response = await request(app)
          .get('/test')
          .set('Cookie', cookieAttack)
          .expect(400);

        expect(response.body.code).toBe('MALICIOUS_COOKIE');
      }
    });

    it('should prevent CSS injection', async () => {
      for (const cssAttack of maliciousTestData.cssAttacks) {
        const response = await request(app)
          .post('/test')
          .send(cssAttack)
          .expect(400);

        expect(response.body.code).toBe('MALICIOUS_CSS');
      }
    });
  });

  // ===============================================================
  // BOUNDARY CONDITION TESTS
  // ===============================================================

  describe('🎯 BOUNDARY CONDITIONS - Edge Case Validation', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(enhancedSecurity);
      app.post('/test', (req, res) => res.json({ received: req.body }));
      app.get('/test', (req, res) => res.json({ received: req.query }));
    });

    it('should handle size boundaries correctly', async () => {
      for (const [index, sizeTest] of boundaryTestData.sizeBoundaries.entries()) {
        const response = await request(app)
          .post('/test')
          .send(sizeTest);

        if (index < 4) { // First 4 should pass
          expect(response.status).toBe(200);
        } else { // Last one (2MB) should fail
          expect(response.status).toBe(400);
        }
      }
    });

    it('should enforce nesting limits', async () => {
      for (const nestTest of boundaryTestData.nestingBoundaries) {
        const response = await request(app)
          .post('/test')
          .send(nestTest);

        if (nestTest.depth <= 100) { // Under limit
          expect(response.status).toBe(200);
        } else { // Over limit
          expect(response.status).toBe(400);
          expect(response.body.code).toBe('EXCESSIVE_NESTING');
        }
      }
    });

    it('should enforce field count limits', async () => {
      for (const fieldTest of boundaryTestData.fieldBoundaries) {
        const response = await request(app)
          .post('/test')
          .send(fieldTest);

        if (fieldTest.fieldCount <= 1000) { // Under limit
          expect(response.status).toBe(200);
        } else { // Over limit
          expect(response.status).toBe(400);
        }
      }
    });

    it('should enforce header count limits', async () => {
      for (const headerTest of boundaryTestData.headerBoundaries) {
        const req = request(app).get('/test');

        // Add all headers
        Object.entries(headerTest.headers).forEach(([key, value]) => {
          req.set(key, value as string);
        });

        const response = await req;

        if (headerTest.count <= 100) { // Under limit
          expect(response.status).toBe(200);
        } else { // Over limit
          expect(response.status).toBe(400);
          expect(response.body.code).toBe('HEADER_FLOOD_DETECTED');
        }
      }
    });
  });

  // ===============================================================
  // ERROR HANDLING TESTS
  // ===============================================================

  describe('💥 ERROR HANDLING - Exception Management', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(enhancedSecurity);
      app.post('/test', (req, res) => res.json({ received: req.body }));
      app.get('/test', (req, res) => res.json({ received: req.query }));
    });

    it('should handle malformed data gracefully', async () => {
      // Test with invalid JSON
      const response = await request(app)
        .post('/test')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should provide proper error responses', async () => {
      const maliciousPayload = { script: '<script>alert(1)</script>' };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(400);

      // Should have proper error structure
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
      expect(typeof response.body.error).toBe('string');
      expect(typeof response.body.code).toBe('string');
    });

    it('should handle concurrent malicious requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .post('/test')
          .send({ malicious: '<script>alert(1)</script>' })
      );

      const responses = await Promise.all(promises);

      // All should be blocked
      responses.forEach(response => {
        expect(response.status).toBe(400);
        expect(response.body.code).toBeDefined();
      });
    });
  });

  // ===============================================================
  // PERFORMANCE IMPACT TESTS
  // ===============================================================

  describe('⚡ PERFORMANCE - Security Impact Validation', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use(enhancedSecurity);
      app.post('/test', (req, res) => res.json({ received: req.body }));
    });

    it('should process legitimate requests quickly', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/test')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second max
    });

    it('should handle multiple legitimate requests efficiently', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 50 }, () =>
        request(app)
          .post('/test')
          .send({ name: 'User', email: 'user@example.com', data: 'legitimate content' })
      );

      const responses = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time for 50 requests
      expect(duration).toBeLessThan(5000); // 5 seconds max for 50 requests
    });
  });
});
