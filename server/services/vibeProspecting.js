import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import logger from '../utils/logger.js';
import { setCachedResult, getCachedResult, getAgeInSeconds } from '../utils/cacheManager.js';

let client;

export async function initializeVibeProspecting() {
  try {
    // Connect to the MCP server via stdio
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['@modelcontextprotocol/server-vibe-prospecting']
    });

    client = new Client({
      name: 'propela-vibe-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    console.log('✅ Connected to Vibe Prospecting MCP server');
    return client;
  } catch (error) {
    logger.error('Failed to connect to Vibe Prospecting MCP', { error: error.message });
    throw error;
  }
}

export async function searchProspects(searchParams) {
  const startTime = Date.now();
  const { country, city, industry, minReviews = 3, limit = 20, useCache = true } = searchParams;

  try {
    // Check cache first
    if (useCache) {
      const cached = getCachedResult(searchParams);
      if (cached.found) {
        const age = getAgeInSeconds(cached.data.timestamp);
        logger.info('Cache hit for prospect search', {
          country,
          city,
          industry,
          cacheAgeSeconds: age
        });

        return {
          success: true,
          cached: true,
          cacheAge: age,
          results: cached.data.data,
          totalFound: cached.data.data.length,
          costEstimate: cached.data.costEstimate
        };
      }
    }

    // Call Vibe Prospecting match-prospects tool
    const locationQuery = `${city}, ${country}`;
    const query = {
      location: locationQuery,
      industry: industry.toLowerCase(),
      limit: Math.min(limit, 100),
      minReviews: minReviews
    };

    logger.info('Calling Vibe match-prospects', { query });

    const response = await client.callTool('match-prospects', {
      location: locationQuery,
      industry: industry.toLowerCase(),
      company_size: 'any',
      limit: query.limit
    });

    if (!response.success) {
      throw new Error(`Vibe API error: ${response.error}`);
    }

    // Normalize results
    const prospects = (response.data || []).map(prospect => ({
      id: prospect.id || `vibe_${Math.random().toString(36).substr(2, 9)}`,
      name: prospect.name || prospect.company_name,
      title: prospect.title || 'Unknown',
      location: prospect.location || `${city}, ${country}`,
      company: prospect.company || prospect.name,
      email: prospect.email,
      phone: prospect.phone,
      linkedinUrl: prospect.linkedin_url,
      vibeId: prospect.id,
      source: 'vibe-prospecting',
      reviewCount: prospect.review_count || minReviews,
      rating: prospect.rating || 0
    }));

    // Estimate cost (Vibe returns this in response)
    const costEstimate = response.cost_estimate || 0.02;

    // Cache the results
    if (useCache) {
      setCachedResult(searchParams, {
        data: prospects,
        timestamp: Date.now(),
        costEstimate
      }, costEstimate);
    }

    const latency = Date.now() - startTime;

    logger.info('Vibe prospect search successful', {
      country,
      city,
      industry,
      resultsCount: prospects.length,
      latencyMs: latency,
      costEstimate,
      cached: false
    });

    return {
      success: true,
      cached: false,
      results: prospects,
      totalFound: prospects.length,
      costEstimate,
      queryTime: latency
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const code = error.statusCode || 'UNKNOWN_ERROR';
    const retryAfter = error.retryAfter || null;

    logger.error('Vibe prospect search failed', {
      country,
      city,
      industry,
      error: error.message,
      code,
      retryAfter,
      latencyMs: latency
    });

    return {
      success: false,
      error: error.message,
      code,
      retryAfter,
      queryTime: latency
    };
  }
}

export async function enrichProspect(prospectId) {
  try {
    logger.info('Calling Vibe enrich-prospects', { prospectId });

    const response = await client.callTool('enrich-prospects', {
      prospect_id: prospectId
    });

    if (!response.success) {
      throw new Error(`Vibe enrich failed: ${response.error}`);
    }

    logger.info('Vibe prospect enrichment successful', { prospectId });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('Vibe prospect enrichment failed', {
      prospectId,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

export async function estimateCost(query) {
  try {
    logger.info('Calling Vibe estimate-cost', { query });

    const response = await client.callTool('estimate-cost', {
      location: query.location,
      industry: query.industry,
      limit: query.limit || 20
    });

    logger.info('Vibe cost estimate retrieved', {
      query,
      estimate: response.estimate
    });

    return {
      success: true,
      estimate: response.estimate,
      perCall: response.estimate,
      for100Calls: response.estimate * 100,
      for1000Calls: response.estimate * 1000
    };
  } catch (error) {
    logger.error('Vibe cost estimation failed', {
      query,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

export function getClient() {
  if (!client) {
    throw new Error('Vibe Prospecting client not initialized');
  }
  return client;
}
