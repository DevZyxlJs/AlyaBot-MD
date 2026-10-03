const defaultPrefixes = ['.', '/', '#', '!', '-', '+'];
const botPrefixes = new Map();
const prefixLock = new Map();

export const prefix = {
  defaults: defaultPrefixes,
  async load(botId) {
    if (!botId) return defaultPrefixes;
    if (botPrefixes.has(botId)) return botPrefixes.get(botId);
    if (prefixLock.has(botId)) return prefixLock.get(botId);
    const promise = (async () => {
      try {
        const db = (await import('#db')).default;
        let settings = null;
        if (typeof db?.getSettings === 'function') {
          settings = await db.getSettings(botId).catch(() => null);
        }
        let list = defaultPrefixes;
        if (settings?.prefijo) {
          const raw = Array.isArray(settings.prefijo) ? settings.prefijo : String(settings.prefijo);
          const parsed = (Array.isArray(raw) ? raw : raw.split(/[\s,]+/)).map(s => String(s).trim()).filter(Boolean);
          if (parsed.length) list = parsed;
        } else if (settings?.prefix) {
          const raw = Array.isArray(settings.prefix) ? settings.prefix : String(settings.prefix);
          const parsed = (Array.isArray(raw) ? raw : raw.split(/[\s,]+/)).map(s => String(s).trim()).filter(Boolean);
          if (parsed.length) list = parsed;
        }
        botPrefixes.set(botId, list);
        return list;
      } catch {
        botPrefixes.set(botId, defaultPrefixes);
        return defaultPrefixes;
      } finally {
        prefixLock.delete(botId);
      }
    })();
    prefixLock.set(botId, promise);
    return promise;
  },
  resolvePrefix(botId) {
    if (!botId) return defaultPrefixes;
    return botPrefixes.get(botId) || defaultPrefixes;
  },
  set(botId, prefixes) {
    if (!botId) return;
    const list = (Array.isArray(prefixes) ? prefixes : [prefixes]).map(s => String(s).trim()).filter(Boolean);
    botPrefixes.set(botId, list.length ? list : defaultPrefixes);
  },
  clear(botId) {
    if (botId) botPrefixes.delete(botId);
    else botPrefixes.clear();
  },
  invalidate(botId) {
    if (botId) botPrefixes.delete(botId);
  },
};

export default { prefix };