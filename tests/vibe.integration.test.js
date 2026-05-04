/**
 * Vibe Prospecting Integration Test
 * Tests real MCP server connection and API calls
 * Run with: npm test -- vibe.integration.test.js
 */

import { searchProspects } from '../server/services/vibeProspecting.js';
import { initializeVibeProspecting } from '../server/services/vibeProspecting.js';

describe('Vibe Prospecting Integration', () => {
  let client;

  beforeAll(async () => {
    // Initialize Vibe MCP connection
    try {
      client = await initializeVibeProspecting();
    } catch (error) {
      console.error('Failed to initialize Vibe', error);
      throw error;
    }
  });

  describe('searchProspects', () => {
    it('should search for hotels in Amsterdam with real data', async () => {
      const result = await searchProspects({
        country: 'Netherlands',
        city: 'Amsterdam',
        industry: 'hotel',
        minReviews: 3,
        limit: 5,
        useCache: false
      });

      expect(result.success).toBe(true);
      expect(result.cached).toBe(false);
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
      expect(result.costEstimate).toBeGreaterThanOrEqual(0);
      expect(result.queryTime).toBeGreaterThan(0);

      if (result.results.length > 0) {
        const lead = result.results[0];
        expect(lead).toHaveProperty('name');
        expect(lead).toHaveProperty('company');
        expect(lead).toHaveProperty('location');
        expect(lead.source).toBe('vibe-prospecting');
      }
    });

    it('should cache results on second identical search', async () => {
      const searchParams = {
        country: 'Denmark',
        city: 'Copenhagen',
        industry: 'hotel',
        minReviews: 3,
        limit: 5,
        useCache: true
      };

      // First call - should hit API
      const result1 = await searchProspects(searchParams);
      expect(result1.success).toBe(true);
      expect(result1.cached).toBe(false);

      // Second call - should be cached
      const result2 = await searchProspects(searchParams);
      expect(result2.success).toBe(true);
      expect(result2.cached).toBe(true);
      expect(result2.cacheAge).toBeLessThan(5); // Should be fresh cache
    });

    it('should handle different countries correctly', async () => {
      const locations = [
        { country: 'Spain', city: 'Barcelona' },
        { country: 'Mexico', city: 'Mexico City' },
        { country: 'Brazil', city: 'São Paulo' }
      ];

      for (const location of locations) {
        const result = await searchProspects({
          country: location.country,
          city: location.city,
          industry: 'hotel',
          minReviews: 3,
          limit: 3,
          useCache: false
        });

        expect(result.success).toBe(true);
        expect(Array.isArray(result.results)).toBe(true);
      }
    });

    it('should handle different industries', async () => {
      const industries = ['hotel', 'property manager'];

      for (const industry of industries) {
        const result = await searchProspects({
          country: 'United States',
          city: 'Miami',
          industry,
          minReviews: 3,
          limit: 3,
          useCache: false
        });

        expect(result.success).toBe(true);
        expect(Array.isArray(result.results)).toBe(true);
      }
    });
  });

  afterAll(async () => {
    // Cleanup if needed
    if (client) {
      // Close client connection if available
    }
  });
});
