import express from 'express';
import request from 'supertest';
import {
  domClobberingProtection,
  enhancedSecurity,
  headerFloodProtection,
  redosProtection,
  sqlInjectionProtection,
  xssProtection
} from '../../src/middleware/security';

describe('Security Middleware Tests', () => {
  it('should run basic test', () => {
    expect(true).toBe(true);
  });

  describe('XSS Protection', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(xssProtection);
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
    });

    it('should sanitize XSS script tags', async () => {
      const maliciousInput = {
        name: '<script>alert("XSS")</script>',
        description: 'Normal text'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.received.name).not.toContain('<script>');
      expect(response.body.received.description).toBe('Normal text');
    });

    it('should sanitize malicious event handlers', async () => {
      const maliciousInput = {
        content: '<img src="x" onerror="alert(1)">'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(200);

      expect(response.body.received.content).not.toContain('onerror');
      expect(response.body.received.content).not.toContain('alert');
    });
  });

  describe('SQL Injection Protection', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(sqlInjectionProtection);
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
    });

    it('should block SQL injection attempts', async () => {
      const maliciousInput = {
        email: "admin@test.com' OR 1=1 --",
        password: 'password'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.code).toBe('SUSPICIOUS_INPUT');
    });

    it('should allow safe input', async () => {
      const safeInput = {
        email: 'user@example.com',
        name: 'John Doe'
      };

      const response = await request(app)
        .post('/test')
        .send(safeInput)
        .expect(200);

      expect(response.body.received).toEqual(safeInput);
    });
  });

  describe('ReDoS Protection', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(redosProtection);
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
    });

    it('should block ReDoS patterns', async () => {
      const maliciousInput = {
        pattern: 'a'.repeat(10000) + 'b'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.code).toBe('REDOS_PATTERN');
    });
  }); describe('DOM Clobbering Protection', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(domClobberingProtection);
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
    });

    it('should block DOM clobbering attempts', async () => {
      const maliciousInput = {
        content: '<div id="__webpack_require__">malicious</div>',
        template: 'constructor.constructor("alert(1)")()'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.code).toBe('DOM_CLOBBERING_BLOCKED');
    });

    it('should allow safe properties', async () => {
      const safeInput = {
        name: 'John',
        userType: 'admin'
      };

      const response = await request(app)
        .post('/test')
        .send(safeInput)
        .expect(200);

      expect(response.body.received).toEqual(safeInput);
    });
  });

  describe('Header Flood Protection', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(headerFloodProtection);
      app.get('/test', (req, res) => {
        res.json({ received: req.query });
      });
    });

    it('should block excessive headers', async () => {
      const req = request(app).get('/test');

      // Add many headers to trigger flood protection
      for (let i = 0; i < 150; i++) {
        req.set(`X-Custom-Header-${i}`, `value${i}`);
      }

      const response = await req.expect(400);
      expect(response.body.code).toBe('HEADER_FLOOD_DETECTED');
    });

    it('should allow normal header count', async () => {
      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer token')
        .expect(200);

      expect(response.body.received).toBeDefined();
    });
  });

  describe('Enhanced Security Stack', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(enhancedSecurity);
      app.post('/candidates', (req, res) => {
        res.json({ success: true, data: req.body });
      });
    });

    it('should allow legitimate candidate data', async () => {
      const legitimateCandidate = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        position: 'Software Engineer'
      };

      const response = await request(app)
        .post('/candidates')
        .send(legitimateCandidate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(legitimateCandidate);
    });

    it('should block malicious payloads', async () => {
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>',
        email: "admin' OR 1=1 --"
      };

      const response = await request(app)
        .post('/candidates')
        .send(maliciousPayload)
        .expect(400);

      expect(response.body.code).toBeDefined();
    });
  });
});
