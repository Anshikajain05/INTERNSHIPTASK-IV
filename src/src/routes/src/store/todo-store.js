import { randomUUID } from 'crypto';

/**
 * In-memory todo store with a tiny read cache.
 * This module isolates data access so it is easy to swap for DB later.
 */
export class TodoStore {
  constructor() {
    this.items = new Map(); // id -> item
    this._cache = null;
    this._cacheTs = 0;
    this._cacheTTL = 1000; // 1s TTL for GET list cached snapshot

    // seed sample items
    this.create({ title: 'Learn Node.js' });
    this.create({ title: 'Refactor API', completed: false });
  }

  _invalidateCache() {
    this._cache = null;
    this._cacheTs = 0;
  }

  async create({ title, completed = false }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const item = { id, title, completed: !!completed, createdAt: now, updatedAt: now };
    this.items.set(id, item);
    this._invalidateCache();
    return item;
  }

  async get(id) {
    return this.items.get(id) || null;
  }

  async list({ q = '' } = {}) {
    // fast path: if no query and cache is fresh, return cached array
    const now = Date.now();
    if (!q && this._cache && now - this._cacheTs < this._cacheTTL) {
      return this._cache;
    }

    const results = [];
    const needle = q.toLowerCase();
    for (const item of this.items.values()) {
      if (!needle || item.title.toLowerCase().includes(needle)) results.push(item);
    }
    // update cache for the no-query case
    if (!q) {
      this._cache = results;
      this._cacheTs = now;
    }
    return results;
  }

  async update(id, patch = {}) {
    const item = this.items.get(id);
    if (!item) return null;
    if (patch.title !== undefined) item.title = patch.title;
    if (patch.completed !== undefined) item.completed = !!patch.completed;
    item.updatedAt = new Date().toISOString();
    this.items.set(id, item);
    this._invalidateCache();
    return item;
  }

  async remove(id) {
    const existed = this.items.delete(id);
    if (existed) this._invalidateCache();
    return existed;
  }
}
