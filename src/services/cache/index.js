class CacheService {
  constructor() {
    this.cacheData = {};
  }

  getCache(id) {
    if (!this.cacheData.hasOwnProperty(id)) return null;
    return this.cacheData[id];
  }

  setCache(id, data) {
    Object.assign(this.cacheData, { [id]: data });
    return null;
  }

  clearCache(id) {
    if (!this.cacheData.hasOwnProperty(id)) return null;
    delete this.cacheData[id];
    return null;
  }
}

export const cacheService = new CacheService();
