import express from 'express';
import request from 'supertest';
import {
  enhancedSecurity
} from '../../src/middleware/security';

// ===================================================================
// DEBUG TEST TO UNDERSTAND WHAT'S FAILING
// ===================================================================

describe('🔍 SECURITY MIDDLEWARE DEBUG TESTS', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(enhancedSecurity);
    app.post('/test', (req, res) => res.json({ received: req.body }));
    app.get('/test', (req, res) => res.json({ received: req.query }));
  });

  it('should debug simple valid data that is failing', async () => {
    const testCases = [
      { name: 'John Doe', email: 'john@example.com', role: 'user' },
      { title: 'Software Engineer', department: 'Engineering', salary: 75000 },
      { description: 'A normal description with safe content', tags: ['web', 'api', 'database'] },
      { unicode: 'José García-Müller', language: 'es' },
      { text: 'Price: $99.99 (50% off!)' },
      { html: '&lt;safe&gt; HTML entities' }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🧪 Testing case ${index}:`, JSON.stringify(testCase));

      const response = await request(app)
        .post('/test')
        .send(testCase);

      console.log(`📊 Status: ${response.status}`);
      if (response.status !== 200) {
        console.log(`❌ Error:`, response.body);
      } else {
        console.log(`✅ Success`);
      }
    }
  });

  it('should debug SQL injection patterns', async () => {
    const testCases = [
      { email: "admin'; DROP TABLE users; --" },
      { search: "' UNION SELECT password FROM users WHERE id=1 --" },
      { id: "1 OR 1=1" },
      { simple: "admin" },
      { legit: "john@example.com" }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🧪 Testing SQL case ${index}:`, JSON.stringify(testCase));

      const response = await request(app)
        .post('/test')
        .send(testCase);

      console.log(`📊 Status: ${response.status}`);
      if (response.status !== 200) {
        console.log(`❌ Error:`, response.body);
      } else {
        console.log(`✅ Success`);
      }
    }
  });

  it('should debug ReDoS patterns', async () => {
    const testCases = [
      { pattern: 'a'.repeat(60) },
      { css: 'div:nth-child(' + 'n+1'.repeat(10) + ')' },
      { normal: 'short string' },
      { medium: 'x'.repeat(100) }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🧪 Testing ReDoS case ${index}:`, JSON.stringify(testCase).slice(0, 100) + '...');

      const response = await request(app)
        .post('/test')
        .send(testCase);

      console.log(`📊 Status: ${response.status}`);
      if (response.status !== 200) {
        console.log(`❌ Error:`, response.body);
      } else {
        console.log(`✅ Success`);
      }
    }
  });

  it('should debug DOM clobbering patterns', async () => {
    const testCases = [
      { content: '<form><input name="eval"></form>' },
      { html: '<div id="__webpack_require__">malicious</div>' },
      { payload: 'constructor.constructor("alert(1)")()' },
      { proto: '__proto__[isAdmin]=true' },
      { name: 'constructor' },
      { safe: 'normal text' }
    ];

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🧪 Testing DOM case ${index}:`, JSON.stringify(testCase));

      const response = await request(app)
        .post('/test')
        .send(testCase);

      console.log(`📊 Status: ${response.status}`);
      if (response.status !== 200) {
        console.log(`❌ Error:`, response.body);
      } else {
        console.log(`✅ Success`);
      }
    }
  });
});
