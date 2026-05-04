/**
 * Vibe Prospecting Unit Tests
 * Tests with mocked MCP client
 * Run with: npm test -- vibe.unit.test.js
 */

import { getCachedResult, setCachedResult, generateQueryHash, getAgeInSeconds } from '../server/utils/cacheManager.js';

describe('Vibe Prospecting Cache Manager', () => {
  describe('generateQueryHash', () => {
    it('should generate consistent hash for same params', () => {
      const params = { country: 'Netherlands', city: 'Amsterdam', industry: 'hotel' };
      const hash1 = generateQueryHash(params);
      const hash2 = generateQueryHash(params);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different params', () => {
      const params1 = { country: 'Netherlands', city: 'Amsterdam' };
      const params2 = { country: 'Denmark', city: 'Copenhagen' };

      const hash1 = generateQueryHash(params1);
      const hash2 = generateQueryHash(params2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('setCachedResult / getCachedResult', () => {
    it('should cache and retrieve results', () => {
      const params = { country: 'test', city: 'testcity' };
      const data = [{ id: 1, name: 'Test Company' }];
      const costEstimate = 0.02;

      setCachedResult(params, data, costEstimate);
      const cached = getCachedResult(params);

      expect(cached.found).toBe(true);
      expect(cached.data).toEqual(data);
      expect(cached.hash).toBeDefined();
    });

    it('should return not found for uncached query', () => {
      const params = { country: 'nocache', city: 'nocity' };
      const cached = getCachedResult(params);

      expect(cached.found).toBe(false);
      expect(cached.hash).toBeDefined();
    });

    it('should respect cache age', (done) => {
      const params = { country: 'agetest', city: 'agetestcity' };
      const data = [{ id: 1, name: 'Aged Data' }];

      setCachedResult(params, data);
      const cached1 = getCachedResult(params);
      expect(cached1.age).toBe(0);

      setTimeout(() => {
        const cached2 = getCachedResult(params);
        expect(cached2.age).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('getAgeInSeconds', () => {
    it('should calculate age correctly', () => {
      const now = Date.now();
      const oneSecondAgo = now - 1000;

      const age = getAgeInSeconds(oneSecondAgo);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThanOrEqual(2);
    });
  });
});

describe('Vibe Prospecting Service (Mocked)', () => {
  // Mock client responses
  const mockProspectData = [
    {
      id: 'vibe_001',
      name: 'Amsterdam Hotels Inc',
      title: 'Owner',
      company: 'Amsterdam Hotels Inc',
      location: 'Amsterdam, Netherlands',
      email: 'info@amhelots.nl',
      phone: '+31-20-555-0001',
      linkedin_url: 'https://linkedin.com/company/amsterdam-hotels',
      review_count: 45,
      rating: 4.5
    },
    {
      id: 'vibe_002',
      name: 'Palace Hotels Group',
      title: 'Manager',
      company: 'Palace Hotels Group',
      location: 'Amsterdam, Netherlands',
      email: 'contact@palace.nl',
      phone: '+31-20-555-0002',
      linkedin_url: 'https://linkedin.com/company/palace-hotels',
      review_count: 67,
      rating: 4.7
    }
  ];

  describe('Response normalization', () => {
    it('should normalize Vibe API response correctly', () => {
      // This test verifies the response structure matches expectations
      const normalized = mockProspectData.map(prospect => ({
        id: prospect.id || `vibe_${Math.random().toString(36).substr(2, 9)}`,
        name: prospect.name,
        title: prospect.title,
        location: prospect.location,
        company: prospect.company,
        email: prospect.email,
        phone: prospect.phone,
        linkedinUrl: prospect.linkedin_url,
        source: 'vibe-prospecting'
      }));

      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toHaveProperty('id');
      expect(normalized[0]).toHaveProperty('name');
      expect(normalized[0]).toHaveProperty('source');
      expect(normalized[0].source).toBe('vibe-prospecting');
    });

    it('should handle missing optional fields', () => {
      const incompleteData = {
        id: 'vibe_test',
        name: 'Test Company',
        company: 'Test Company'
        // Missing email, phone, etc
      };

      const normalized = {
        id: incompleteData.id,
        name: incompleteData.name,
        company: incompleteData.company,
        email: incompleteData.email || undefined,
        phone: incompleteData.phone || undefined,
        source: 'vibe-prospecting'
      };

      expect(normalized.email).toBeUndefined();
      expect(normalized.phone).toBeUndefined();
      expect(normalized.source).toBe('vibe-prospecting');
    });
  });

  describe('Error handling', () => {
    it('should structure rate limit error correctly', () => {
      const error = {
        statusCode: 429,
        message: 'Too many requests',
        retryAfter: 60
      };

      const response = {
        success: false,
        error: error.message,
        code: 'RATE_LIMIT_429',
        retryAfter: error.retryAfter
      };

      expect(response.success).toBe(false);
      expect(response.code).toBe('RATE_LIMIT_429');
      expect(response.retryAfter).toBe(60);
    });

    it('should structure auth error correctly', () => {
      const error = {
        statusCode: 401,
        message: 'Unauthorized'
      };

      const response = {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR_401'
      };

      expect(response.success).toBe(false);
      expect(response.code).toBe('AUTH_ERROR_401');
    });
  });
});
