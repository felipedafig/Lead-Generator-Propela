import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

const cache = new LRUCache({
  max: 500,
  maxSize: 50 * 1024 * 1024, // 50MB max
  sizeCalculation: (item) => JSON.stringify(item).length,
  ttl: (process.env.VIBE_CACHE_TTL_SECONDS || 900) * 1000, // Convert to ms
  updateAgeOnGet: true
});

export function generateQueryHash(params) {
  const key = JSON.stringify(params);
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function getCachedResult(params) {
  const hash = generateQueryHash(params);
  const cached = cache.get(hash);

  if (cached) {
    return {
      found: true,
      data: cached.data,
      age: cached.age,
      hash
    };
  }

  return { found: false, hash };
}

export function setCachedResult(params, data, costEstimate = null) {
  const hash = generateQueryHash(params);
  const item = {
    data,
    timestamp: Date.now(),
    costEstimate,
    age: 0
  };

  cache.set(hash, item);
  return hash;
}

export function getAgeInSeconds(timestamp) {
  return Math.floor((Date.now() - timestamp) / 1000);
}

export function clearCache() {
  cache.clear();
}

export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: cache.maxSize,
    itemCount: cache.size
  };
}
