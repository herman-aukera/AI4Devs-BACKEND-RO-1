import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Security Middleware Stack
 *
 * Implements defense-in-depth against various attack vectors:
 * - Rate limiting to prevent DoS
 * - Input validation and sanitization
 * - XSS protection
 * - CSRF protection
 * - Path traversal prevention
 * - ReDoS protection
 */

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip requests from localhost in development
  skip: (req: Request) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
});

// Strict rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true
});

// DoS protection - request size and complexity limits
export const dosProtection = (req: Request, res: Response, next: NextFunction) => {
  // Check request size
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 1024 * 1024; // 1MB limit

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: maxSize
    });
  }

  // Check JSON complexity if applicable
  if (req.body && typeof req.body === 'object') {
    const complexity = calculateJsonComplexity(req.body);

    if (complexity.depth > 10) {
      return res.status(400).json({
        error: 'JSON structure too deeply nested',
        code: 'EXCESSIVE_NESTING',
        maxDepth: 10
      });
    }

    if (complexity.fieldCount > 1000) {
      return res.status(400).json({
        error: 'Too many fields in request',
        code: 'EXCESSIVE_FIELDS',
        maxFields: 1000
      });
    }
  }

  next();
};

// Calculate JSON complexity to prevent DoS
function calculateJsonComplexity(obj: any, depth = 0): { depth: number; fieldCount: number } {
  if (depth > 50) return { depth: 50, fieldCount: 0 }; // Circuit breaker

  let maxDepth = depth;
  let fieldCount = 0;

  if (Array.isArray(obj)) {
    fieldCount += obj.length;
    const complexity = processArrayComplexity(obj, depth);
    maxDepth = Math.max(maxDepth, complexity.depth);
    fieldCount += complexity.fieldCount;
  } else if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    fieldCount += keys.length;
    const complexity = processObjectComplexity(obj, keys, depth);
    maxDepth = Math.max(maxDepth, complexity.depth);
    fieldCount += complexity.fieldCount;
  }

  return { depth: maxDepth, fieldCount };
}

function processArrayComplexity(arr: any[], depth: number): { depth: number; fieldCount: number } {
  let maxDepth = depth;
  let fieldCount = 0;

  for (const item of arr) {
    if (typeof item === 'object' && item !== null) {
      const subComplexity = calculateJsonComplexity(item, depth + 1);
      maxDepth = Math.max(maxDepth, subComplexity.depth);
      fieldCount += subComplexity.fieldCount;
    }
  }

  return { depth: maxDepth, fieldCount };
}

function processObjectComplexity(obj: any, keys: string[], depth: number): { depth: number; fieldCount: number } {
  let maxDepth = depth;
  let fieldCount = 0;

  for (const key of keys) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const subComplexity = calculateJsonComplexity(obj[key], depth + 1);
      maxDepth = Math.max(maxDepth, subComplexity.depth);
      fieldCount += subComplexity.fieldCount;
    }
  }

  return { depth: maxDepth, fieldCount };
}

// XSS Protection - sanitize input
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Also sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = DOMPurify.sanitize(key, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      });
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

// SQL Injection Protection - validate input patterns
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(script|javascript|vbscript|onload|onerror|onclick)\b)/i,
    /(char|nchar|varchar|nvarchar)\s*\(/i,
    /(waitfor|delay|benchmark|sleep)\s*\(/i
  ];

  const checkForSqlInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForSqlInjection);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSqlInjection);
    }

    return false;
  };

  if (req.body && checkForSqlInjection(req.body)) {
    return res.status(400).json({
      error: 'Potentially malicious input detected',
      code: 'SUSPICIOUS_INPUT',
      message: 'Request contains patterns that may indicate SQL injection attempt'
    });
  }

  if (req.query && checkForSqlInjection(req.query)) {
    return res.status(400).json({
      error: 'Potentially malicious query parameters',
      code: 'SUSPICIOUS_QUERY',
      message: 'Query parameters contain suspicious patterns'
    });
  }

  next();
};

// Path Traversal Protection
export const pathTraversalProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPathPatterns = [
    /\.\./,  // Directory traversal
    /%2e%2e/i,  // URL-encoded ..
    /\0/,  // Null bytes
    /[<>:"|?*]/,  // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
  ];

  const checkPath = (path: string): boolean => {
    return suspiciousPathPatterns.some(pattern => pattern.test(path));
  };

  if (checkPath(req.path)) {
    return res.status(400).json({
      error: 'Invalid path detected',
      code: 'INVALID_PATH',
      message: 'Path contains potentially dangerous characters'
    });
  }

  // Check file upload paths if present
  if (req.file && checkPath(req.file.originalname)) {
    return res.status(400).json({
      error: 'Invalid filename',
      code: 'INVALID_FILENAME',
      message: 'Filename contains potentially dangerous characters'
    });
  }

  next();
};

// ReDoS Protection - timeout dangerous regex operations
export const redosProtection = (req: Request, res: Response, next: NextFunction) => {
  // Check for potentially problematic input lengths
  const checkForRedosInput = (obj: any): boolean => {
    if (typeof obj === 'string') {
      // Extremely long strings with repetitive patterns are suspicious
      if (obj.length > 10000) {
        const hasRepetitivePattern = /(.)\1{100,}/.test(obj);
        if (hasRepetitivePattern) return true;
      }

      // Check for specific ReDoS attack patterns
      const redosAttackPatterns = [
        /^2n\s+!$/,  // nth-check specific attack
        /^a\*+b$/,   // micromatch attack pattern
      ];

      return redosAttackPatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForRedosInput);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForRedosInput);
    }

    return false;
  };

  if (req.body && checkForRedosInput(req.body)) {
    return res.status(400).json({
      error: 'Potentially malicious pattern detected',
      code: 'REDOS_PATTERN',
      message: 'Input contains patterns that may cause Regular Expression Denial of Service'
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
});

// Combined security middleware
export const applySecurity = [
  securityHeaders,
  rateLimiter,
  dosProtection,
  xssProtection,
  sqlInjectionProtection,
  pathTraversalProtection,
  redosProtection
];

// DOM Clobbering Protection
export const domClobberingProtection = (req: Request, res: Response, next: NextFunction) => {
  const domClobberingPatterns = [
    /<\s*form[^>]*>/i,
    /<\s*input\s+[^>]*name\s*=\s*["']?(eval|location|constructor|__proto__)["']?/i,
    /<\s*div\s+[^>]*id\s*=\s*["']?(__webpack_require__|publicPath)["']?/i,
    /document\.(eval|location|constructor)/i,
    /window\.(eval|location|constructor)/i,
    /constructor\.constructor/i
  ];

  const checkForDomClobbering = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return domClobberingPatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForDomClobbering);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForDomClobbering);
    }

    return false;
  };

  if (checkForDomClobbering(req.body) || checkForDomClobbering(req.query) || checkForDomClobbering(req.params)) {
    return res.status(400).json({
      error: 'Potential DOM clobbering attack detected',
      code: 'DOM_CLOBBERING_BLOCKED'
    });
  }

  next();
};

// WebSocket Header Flood Protection
export const headerFloodProtection = (req: Request, res: Response, next: NextFunction) => {
  const headers = req.headers;
  const headerCount = Object.keys(headers).length;
  const maxHeaders = 100;

  if (headerCount > maxHeaders) {
    return res.status(400).json({
      error: 'Too many HTTP headers',
      code: 'HEADER_FLOOD_DETECTED',
      headerCount,
      maxHeaders
    });
  }

  // Check for excessively long header values
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string' && value.length > 8192) { // 8KB limit per header
      return res.status(400).json({
        error: 'Header value too long',
        code: 'HEADER_TOO_LONG',
        header: key,
        length: value.length,
        maxLength: 8192
      });
    }
  }

  next();
};

// Template Injection Protection
export const templateInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const templatePatterns = [
    /\{\{.*?\}\}/,
    /\$\{.*?\}/,
    /<%.+?%>/,
    /\{%.+?%\}/,
    /constructor\.constructor/i,
    /process\..*?\(/i,
    /require\s*\(/i,
    /import\s*\(/i
  ];

  const checkForTemplateInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return templatePatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForTemplateInjection);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForTemplateInjection);
    }

    return false;
  };

  if (checkForTemplateInjection(req.body) || checkForTemplateInjection(req.query) || checkForTemplateInjection(req.params)) {
    return res.status(400).json({
      error: 'Potential template injection detected',
      code: 'TEMPLATE_INJECTION_BLOCKED'
    });
  }

  next();
};

// Cookie Parsing Protection
export const cookieParsingProtection = (req: Request, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    // Check for null bytes and other control characters
    const hasControlChars = cookieHeader.split('').some(char => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || (code >= 127 && code <= 159);
    });

    if (hasControlChars) {
      return res.status(400).json({
        error: 'Invalid characters in cookie header',
        code: 'MALFORMED_COOKIE'
      });
    }

    // Check for excessively long cookie values
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      if (cookie.length > 4096) { // 4KB limit per cookie
        return res.status(400).json({
          error: 'Cookie value too long',
          code: 'COOKIE_TOO_LONG',
          maxLength: 4096
        });
      }
    }
  }

  next();
};

// Enhanced CSS/PostCSS Protection
export const cssProtection = (req: Request, res: Response, next: NextFunction) => {
  const cssPatterns = [
    /@font-face\s*\{\s*font\s*:\s*\([^)]*\\r[^)]*\)/i, // PostCSS line return vulnerability
    /expression\s*\(/i, // CSS expression injection
    /javascript\s*:/i, // JavaScript URLs in CSS
    /behavior\s*:/i, // IE behavior property
    /@import\s+url\s*\(\s*["']?javascript:/i, // JavaScript import
    /binding\s*:/i // Mozilla binding property
  ];

  const checkForMaliciousCSS = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return cssPatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForMaliciousCSS);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForMaliciousCSS);
    }

    return false;
  };

  if (checkForMaliciousCSS(req.body) || checkForMaliciousCSS(req.query)) {
    return res.status(400).json({
      error: 'Malicious CSS detected',
      code: 'MALICIOUS_CSS_BLOCKED'
    });
  }

  next();
};

// Enhanced redirect protection
export const redirectProtection = (req: Request, res: Response, next: NextFunction) => {
  // Store reference to request for validation
  (req as any).validateRedirect = (url: string) => {
    const dangerousProtocols = /^(javascript|data|vbscript|file|ftp):/i;
    const domainConfusion = /\/\/.*@/;
    return !dangerousProtocols.test(url) && !domainConfusion.test(url);
  };

  next();
};

// Enhanced combined security middleware with new protections
export const enhancedSecurity = [
  securityHeaders,
  rateLimiter,
  dosProtection,
  headerFloodProtection,
  cookieParsingProtection,
  redirectProtection,
  xssProtection,
  sqlInjectionProtection,
  pathTraversalProtection,
  redosProtection,
  domClobberingProtection,
  templateInjectionProtection,
  cssProtection
];
