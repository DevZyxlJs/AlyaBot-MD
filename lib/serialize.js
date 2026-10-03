import { proto, delay, areJidsSameUser, generateWAMessage, generateWAMessageFromContent, generateWAMessageContent, generateForwardMessageContent, prepareWAMessageMedia, downloadContentFromMessage, getContentType, getDevice, extractMessageContent, jidDecode, jidNormalizedUser } from 'baileys';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import exif from './exif.js';
import { prefix } from '#utils';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = exif;

class BoundedMap {
  #map = new Map();
  #max;
  #ttl;
  constructor(max, ttlMs = 0) { this.#max = max; this.#ttl = ttlMs; }
  get size() { return this.#map.size; }
  #expired(e) { return this.#ttl > 0 && Date.now() - e.ts > this.#ttl; }
  has(k) {
    const e = this.#map.get(k);
    if (!e) return false;
    if (this.#expired(e)) { this.#map.delete(k); return false; }
    return true;
  }
  get(k) {
    const e = this.#map.get(k);
    if (!e) return undefined;
    if (this.#expired(e)) { this.#map.delete(k); return undefined; }
    this.#map.delete(k);
    this.#map.set(k, e);
    return e.v;
  }
  set(k, v) {
    if (this.#map.size >= this.#max) this.#map.delete(this.#map.keys().next().value);
    this.#map.set(k, { v, ts: Date.now() });
  }
  delete(k) {
    return this.#map.delete(k);
  }
  prune() {
    if (this.#ttl <= 0) return;
    const now = Date.now();
    for (const [k, e] of this.#map)
      if (now - e.ts > this.#ttl) this.#map.delete(k);
  }
  clear() {
    this.#map.clear();
  }
}

const groupMetaCache = new Map();
const rawMetaCache = new Map();
const communityMetaCache = new BoundedMap(1000, 24 * 60 * 60000);
const metaInFlight = new Map();
const onWhatsAppInFlight = new Map();
const lidCache = new BoundedMap(2000, 24 * 60 * 60000);
const lidNegativeCache = new BoundedMap(5000, 5 * 60000);
const lidWarming = new Set();
const lidWarmingMax = 2000;
const metaTTL = 300000;
const gcMeta = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of groupMetaCache)
    if (now - val.ts > metaTTL) groupMetaCache.delete(key);
  for (const [key, val] of rawMetaCache)
    if (now - val.ts > metaTTL) rawMetaCache.delete(key);
  communityMetaCache.prune();
  lidCache.prune();
  lidNegativeCache.prune();
}, 10 * 60 * 1000);
gcMeta.unref();

function buildParticipantIndex(participants) {
  const adminSet = new Set();
  const byBase = new Map();
  const byUsername = new Map();
  for (const p of participants ?? []) {
    const id = p.id?.split('@')[0];
    const lid = p.lid?.split('@')[0];
    const phone = p.phoneNumber?.split('@')[0];
    const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
    const info = { id: p.id, lid: p.lid, phoneNumber: p.phoneNumber, username: p.username || null, name: p.name || null, notify: p.notify || null, admin: p.admin ?? null };
    for (const base of [id, lid, phone]) {
      if (!base) continue;
      byBase.set(base, info);
      if (isAdmin) adminSet.add(base);
    }
    if (p.username) byUsername.set(String(p.username).toLowerCase(), info);
  }
  return { adminSet, byBase, byUsername };
}

const participantIndexByMeta = new WeakMap();
function getParticipantIndex(groupMetadata) {
  if (!groupMetadata) return { adminSet: new Set(), byBase: new Map(), byUsername: new Map() };
  let idx = participantIndexByMeta.get(groupMetadata);
  if (!idx) { idx = buildParticipantIndex(groupMetadata.participants); participantIndexByMeta.set(groupMetadata, idx); }
  return idx;
}

function getAdminSet(groupMetadata) {
  return getParticipantIndex(groupMetadata).adminSet;
}

function getParticipantInfo(groupMetadata, jid) {
  if (!groupMetadata || !jid) return null;
  const base = String(jid).split('@')[0];
  return getParticipantIndex(groupMetadata).byBase.get(base) || null;
}

function getParticipantInfoByUsername(groupMetadata, username) {
  if (!groupMetadata || !username) return null;
  const clean = String(username).replace(/^@/, '').trim().toLowerCase();
  if (!clean) return null;
  return getParticipantIndex(groupMetadata).byUsername.get(clean) || null;
}

function getUsername(groupMetadata, jid) {
  return getParticipantInfo(groupMetadata, jid)?.username || null;
}

function isCommunityMeta(metadata) {
  return !!(metadata?.isCommunity || metadata?.isCommunityAnnounce);
}

function getCachedMeta(groupJid) {
  const community = communityMetaCache.get(groupJid);
  if (community) return community;
  const c = groupMetaCache.get(groupJid);
  if (!c || Date.now() - c.ts > metaTTL) return null;
  return c.metadata;
}

function getRawMeta(groupJid) {
  const c = rawMetaCache.get(groupJid);
  if (!c || Date.now() - c.ts > metaTTL) return null;
  return c.metadata;
}

function setCachedMeta(groupJid, metadata) {
  if (isCommunityMeta(metadata)) {
    communityMetaCache.set(groupJid, metadata);
    groupMetaCache.delete(groupJid);
    return;
  }
  groupMetaCache.set(groupJid, { metadata, ts: Date.now() });
}

function deleteCachedMeta(groupJid) {
  groupMetaCache.delete(groupJid);
  rawMetaCache.delete(groupJid);
  communityMetaCache.delete(groupJid);
}

function normalizeJid(raw) {
  if (!raw) return null;
  const s = typeof raw === 'number' ? String(raw) : String(raw).trim();
  if (!s) return null;
  if (s.endsWith('@g.us')) return s;
  if (s.endsWith('@newsletter')) return s;
  if (s.endsWith('@lid')) return s;
  if (/:\d+@/i.test(s)) {
    const decoded = jidDecode(s);
    if (decoded?.user && decoded?.server) return `${decoded.user}@${decoded.server}`;
  }
  if (s.endsWith('@s.whatsapp.net')) return s;
  const digits = s.replace(/\D/g, '');
  if (digits && digits.length >= 4 && digits.length <= 15) return `${digits}@s.whatsapp.net`;
  return s;
}

function resolveParticipantJid(p, sock) {
  if (!p) return null;
  if (p.phoneNumber) {
    const n = normalizeJid(p.phoneNumber);
    if (n && !n.endsWith('@lid')) return n;
  }
  if (p.id && !p.id.endsWith('@lid')) {
    const n = normalizeJid(p.id);
    if (n && !n.endsWith('@lid')) return n;
  }
  if (p.jid && !p.jid.endsWith('@lid')) {
    const n = normalizeJid(p.jid);
    if (n && !n.endsWith('@lid')) return n;
  }
  const rawLid = p.lid || (p.id?.endsWith('@lid') ? p.id : null) || (p.jid?.endsWith('@lid') ? p.jid : null);
  if (rawLid) {
    if (lidCache.has(rawLid)) return lidCache.get(rawLid);
    const peek = peekMappingCache(rawLid, sock);
    if (peek) { lidCache.set(rawLid, peek); return peek; }
    return rawLid;
  }
  return null;
}

function hasLidStore(sock) {
  const lm = sock?.signalRepository?.lidMapping;
  return typeof lm?.getPNsForLIDs === 'function' || typeof lm?.getPNForLID === 'function';
}

function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, ms);
    Promise.resolve(promise).then((v) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } }, () => { if (!done) { done = true; clearTimeout(timer); resolve(null); } });
  });
}

function peekMappingCache(lid, sock) {
  const mc = sock?.signalRepository?.lidMapping?.mappingCache;
  if (!mc || typeof mc.get !== 'function') return null;
  try {
    const cached = mc.get(`lid:${String(lid).split('@')[0]}`);
    if (typeof cached === 'string' && cached) {
      const n = normalizeJid(cached.includes('@') ? cached : `${cached}@s.whatsapp.net`);
      return n && !n.endsWith('@lid') ? n : null;
    }
  } catch {}
  return null;
}

function warmLids(lids, sock) {
  const lm = sock?.signalRepository?.lidMapping;
  const pending = [...new Set(lids)].filter(l => l && !lidCache.has(l) && !lidNegativeCache.has(l) && !lidWarming.has(l));
  if (!pending.length) return;
  for (const l of pending) lidWarming.add(l);
  const finish = (resolvedSet) => {
    for (const l of pending) if (!resolvedSet.has(l)) lidNegativeCache.set(l, true);
    for (const l of pending) lidWarming.delete(l);
  };
  if (typeof lm?.getPNsForLIDs === 'function') {
    withTimeout(Promise.resolve(lm.getPNsForLIDs(pending)), 4000).then((pairs) => {
        const resolvedSet = new Set();
        for (const pair of pairs || []) {
          const n = normalizeJid(pair?.pn);
          if (pair?.lid && n && !n.endsWith('@lid')) { lidCache.set(pair.lid, n); resolvedSet.add(pair.lid); }
        }
        finish(resolvedSet);
      }).catch(() => finish(new Set()));
  } else if (typeof lm?.getPNForLID === 'function') {
    Promise.all(pending.map(lid => withTimeout(Promise.resolve(lm.getPNForLID(lid)), 4000).then((pn) => { const n = normalizeJid(pn); if (n && !n.endsWith('@lid')) { lidCache.set(lid, n); return lid; } return null; }).catch(() => null))).then((resolved) => finish(new Set(resolved.filter(Boolean))));
  } else {
    finish(new Set());
  }
}

async function resolveLidsAsync(lids, sock) {
  const list = [...new Set((lids ?? []).filter(l => l?.endsWith('@lid')))];
  const result = new Map();
  if (!list.length || !hasLidStore(sock)) return result;
  const pending = [];
  for (const lid of list) {
    const sync = peekMappingCache(lid, sock);
    if (sync) { lidCache.set(lid, sync); result.set(lid, sync); }
    else if (!lidNegativeCache.has(lid)) pending.push(lid);
  }
  if (!pending.length) return result;
  const lm = sock?.signalRepository?.lidMapping;
  const resolvedSet = new Set();
  if (typeof lm?.getPNsForLIDs === 'function') {
    const pairs = (await withTimeout(lm.getPNsForLIDs(pending), 4000)) || [];
    for (const pair of pairs) {
      const n = normalizeJid(pair?.pn);
      if (pair?.lid && n && !n.endsWith('@lid')) {
        lidCache.set(pair.lid, n);
        result.set(pair.lid, n);
        resolvedSet.add(pair.lid);
      }
    }
  } else if (typeof lm?.getPNForLID === 'function') {
    await Promise.all(pending.map(async (lid) => {
      const pn = await withTimeout(lm.getPNForLID(lid), 4000);
      const n = normalizeJid(pn);
      if (n && !n.endsWith('@lid')) { lidCache.set(lid, n); result.set(lid, n); resolvedSet.add(lid); }
    }));
  }
  for (const l of pending) if (!resolvedSet.has(l)) lidNegativeCache.set(l, true);
  return result;
}

async function resolveLidAsync(lid, sock) {
  if (!lid?.endsWith('@lid')) return null;
  const map = await resolveLidsAsync([lid], sock);
  return map.get(lid) || null;
}

async function resolveParticipants(participants, sock) {
  if (!Array.isArray(participants)) return [];
  const prelim = participants.map(p => ({ p, realJid: resolveParticipantJid(p, sock) }));
  const unresolvedLids = prelim.filter(e => e.realJid?.endsWith('@lid')).map(e => e.realJid);
  const batchResolved = unresolvedLids.length ? await resolveLidsAsync(unresolvedLids, sock) : new Map();
  const resolved = prelim.map(({ p, realJid }) => {
    const finalJid = (realJid?.endsWith('@lid') ? batchResolved.get(realJid) : null) || realJid;
    if (!finalJid) return p;
    const originalLid = p.lid || (p.id?.endsWith('@lid') ? p.id : undefined) || (p.jid?.endsWith('@lid') ? p.jid : undefined);
    return { ...p, id: finalJid, ...(originalLid ? { lid: originalLid } : {}), ...(p.phoneNumber ? { phoneNumber: p.phoneNumber } : (!finalJid.endsWith('@lid') ? { phoneNumber: finalJid } : {})) };
  });
  return resolved.filter(p => p.id);
}

function resolveJidSync(raw, sock) {
  if (!raw) return null;
  const norm = normalizeJid(raw);
  if (!norm) return null;
  if (!norm.endsWith('@lid')) return norm;
  if (lidCache.has(norm)) return lidCache.get(norm);
  const peek = peekMappingCache(norm, sock);
  if (peek) { lidCache.set(norm, peek); return peek; }
  return norm;
}

async function resolveJidAsync(raw, sock, groupJid, altHint) {
  if (!raw) return null;
  const norm = normalizeJid(raw);
  if (!norm) return null;
  if (!norm.endsWith('@lid')) return norm;
  if (altHint) {
    const hinted = normalizeJid(altHint);
    if (hinted && !hinted.endsWith('@lid')) { lidCache.set(norm, hinted); return hinted; }
  }
  const sync = resolveJidSync(norm, sock);
  if (sync && !sync.endsWith('@lid')) return sync;
  const viaStore = await resolveLidAsync(norm, sock);
  if (viaStore) return viaStore;
  if (!groupJid?.endsWith('@g.us')) {
    let pending = onWhatsAppInFlight.get(norm);
    if (!pending) {
      pending = Promise.resolve().then(() => withTimeout(sock.onWhatsApp(norm), 4000)).then((results) => {
          const hit = Array.isArray(results) ? results.find(r => r?.exists) || results[0] : null;
          const resolvedJid = hit?.jid ? normalizeJid(hit.jid) : null;
          if (resolvedJid && !resolvedJid.endsWith('@lid')) lidCache.set(norm, resolvedJid);
          return resolvedJid;
        }).catch(() => null).finally(() => onWhatsAppInFlight.delete(norm));
      onWhatsAppInFlight.set(norm, pending);
    }
    const resolvedJid = await pending;
    return (resolvedJid && !resolvedJid.endsWith('@lid')) ? resolvedJid : norm;
  }
  const lidBase = norm.split('@')[0];
  let meta = getCachedMeta(groupJid);
  if (!meta) {
    try { meta = await sock.groupMetadata(groupJid); if (meta?.participants) setCachedMeta(groupJid, meta); else meta = null; }
    catch { return norm; }
  }
  for (const p of meta?.participants ?? []) {
    const pLidBase = p.lid?.split('@')[0];
    const pIdBase  = (p.id && !p.id.endsWith('@lid')) ? p.id.split('@')[0] : null;
    if (pLidBase !== lidBase && pIdBase !== lidBase) continue;
    const phone = p.phoneNumber ? normalizeJid(p.phoneNumber) : (p.id && !p.id.endsWith('@lid') ? normalizeJid(p.id) : null);
    if (phone) { lidCache.set(norm, phone); return phone; }
    break;
  }
  return norm;
}

function patchGroupMetadata(sock) {
  if (sock.groupMetadataPatched) return;
  sock.groupMetadataPatched = true;
  const orig = sock.groupMetadata.bind(sock);
  sock.groupMetadata = (jid) => {
    const cached = getCachedMeta(jid);
    if (cached) return Promise.resolve(cached);
    const inFlight = metaInFlight.get(jid);
    if (inFlight) return inFlight;
    const fetchPromise = (async () => {
      try {
        const meta = await orig(jid);
        if (!meta?.participants) return meta;
        const crudos = meta.participants;
        const rawOwner = meta.owner;
        rawMetaCache.set(jid, { metadata: { ...meta, participants: crudos, owner: rawOwner }, ts: Date.now() });
        meta.participants = await resolveParticipants(crudos, sock);
        if (rawOwner) {
          const ownerFromParticipants = meta.participants.find(p => p.lid === rawOwner || p.id === rawOwner)?.id;
          meta.owner = ownerFromParticipants || resolveParticipantJid({ id: rawOwner }, sock) || rawOwner;
        }
        setCachedMeta(jid, meta);
        return meta;
      } catch (e) {
        return null;
      } finally {
        metaInFlight.delete(jid);
      }
    })();
    metaInFlight.set(jid, fetchPromise);
    return fetchPromise;
  };
}

function patchRelayMessage(sock) {
  if (sock.relayMessagePatched) return;
  sock.relayMessagePatched = true;
  const origRelay = sock.relayMessage.bind(sock);
  sock.relayMessage = (...args) => {
    if (sock.ws && sock.ws.isOpen === false) return Promise.resolve(null);
    const p = origRelay(...args);
    p.catch(() => {});
    return p;
  };
  const origSend = sock.sendMessage.bind(sock);
  sock.sendMessage = (...args) => {
    if (sock.ws && sock.ws.isOpen === false) return Promise.resolve(null);
    const p = origSend(...args);
    p.catch(() => {});
    return p;
  };
}

export function createMessageCache(max = 200) {
  const map = new Map();
  const store = (key, msg) => {
    if (!key) return;
    if (map.has(key)) map.delete(key);
    map.set(key, msg);
    if (map.size > max) map.delete(map.keys().next().value);
  };
  const buildKey = (key) => {
    if (!key) return null;
    const remoteJid = key.remoteJid;
    const id = key.id;
    if (!remoteJid || !id) return null;
    const participant = key.participant || key.remoteJid;
    return `${remoteJid}::${participant}::${id}`;
  };
  const cache = {
    store,
    bind(ev) {
      if (!ev || typeof ev.on !== 'function') return cache;
      ev.on('messages.upsert', ({ messages }) => {
        for (const m of messages ?? []) {
          if (!m?.key?.id) continue;
          store(buildKey(m.key), m);
        }
      });
      return cache;
    },
    async getMessage(key) {
      const k = buildKey(key);
      if (!k) return null;
      const cached = map.get(k);
      if (!cached) return null;
      try {
        const content = extractMessageContent(cached.message) || cached.message;
        return content || null;
      } catch {
        return cached.message || null;
      }
    },
    has(key) {
      const k = buildKey(key);
      return k ? map.has(k) : false;
    },
    delete(key) {
      const k = buildKey(key);
      if (k) return map.delete(k);
      return false;
    },
    clear() {
      map.clear();
    },
    get size() {
      return map.size;
    }
  };
  return cache;
}

export function cacheSizes() {
  return { groupMeta: groupMetaCache.size, rawMeta: rawMetaCache.size, community: communityMetaCache.size, metaInFlight: metaInFlight.size, onWhatsAppInFlight: onWhatsAppInFlight.size, lid: lidCache.size, lidNegative: lidNegativeCache.size, lidWarming: lidWarming.size };
}

const bannerPreviewCache = new Map();
export async function linksPreview(sock, banner) {
  if (!banner || !sock) return null;
  const botId = sock.user?.id || 'default';
  const cached = bannerPreviewCache.get(botId);
  if (cached && cached.banner === banner) {
    try {
      return await cached.promise;
    } catch {
      bannerPreviewCache.delete(botId);
    }
  }
  const promise = prepareWAMessageMedia({ image: { url: banner } }, { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }).then(({ imageMessage }) => imageMessage);
  bannerPreviewCache.set(botId, { banner, promise });
  try {
    return await promise;
  } catch (e) {
    bannerPreviewCache.delete(botId);
    throw e;
  }
}

export { normalizeJid, resolveParticipantJid, resolveJidSync, resolveLidAsync, patchGroupMetadata, getCachedMeta, setCachedMeta, deleteCachedMeta, getRawMeta, isCommunityMeta, getAdminSet, getParticipantInfo, getParticipantInfoByUsername, getUsername, BoundedMap, patchRelayMessage };

const maxBufferBytes = 500 * 1024 * 1024;
export async function getBuffer(url, options = {}) {
  try {
    const res = await axios({ method: 'get', url, headers: { DNT: 1, 'Upgrade-Insecure-Request': 1 }, responseType: 'arraybuffer', timeout: 30000, maxContentLength: maxBufferBytes, maxBodyLength: maxBufferBytes, ...options });
    return res.data;
  } catch (e) { throw e; }
}

export async function smsg(sock, msg) {
  const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
  if (!sock.decodeJid) {
    sock.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decoded = jidDecode(jid) || {};
        return (decoded.user && decoded.server && decoded.user + '@' + decoded.server) || jid;
      }
      return jid;
    };
  }
  patchGroupMetadata(sock);
  patchRelayMessage(sock);
  if (!sock.downloadMediaMessage) {
  sock.downloadMediaMessage = async (message) => {
    const m = message.content || message;
    const normalized = message.message ? extractMessageContent(message.message) : null;
    const realType = (normalized && getContentType(normalized)) || message.type;
    const mime = m.mimetype || '';
    const messageType = (realType || mime.split('/')[0] || '').replace(/Message/gi, '');
    const stream = await downloadContentFromMessage(m, messageType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  };
  }
  if (!msg) return msg;
  let groupMeta = null;
  if (msg.key) {
    msg.id = msg.key.id;
    msg.chat = msg.key.remoteJid;
    msg.fromMe = msg.key.fromMe;
    msg.isBot = ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some((a) => msg.id.startsWith(a) && [12, 16, 20, 22, 40].includes(msg.id.length)) || /(.)\1{5,}|[^a-zA-Z0-9]/.test(msg.id) || false;
    msg.isGroup = msg.chat?.endsWith('@g.us') ?? false;
    if (!msg.isGroup && msg.chat?.endsWith('@lid')) {
      const resolved = await resolveJidAsync(msg.chat, sock, null);
      if (resolved && !resolved.endsWith('@lid')) msg.chat = resolved;
    }
    const rawSender = (msg.fromMe && sock.user.id) || msg.key?.participant || msg.key?.remoteJid || '';
    const senderAltHint = msg.key?.participantAlt || msg.key?.remoteJidAlt;
    msg.sender = await resolveJidAsync(sock.decodeJid(rawSender), sock, msg.key?.remoteJid, senderAltHint);
    groupMeta = msg.isGroup ? getCachedMeta(msg.chat) : null;
    msg.username = msg.key?.participantUsername || (msg.isGroup ? getUsername(groupMeta, msg.sender) : null);
  }

  if (msg.message) {
    msg.type = getContentType(msg.message) || Object.keys(msg.message)[0];
    msg.content = /viewOnceMessage|viewOnceMessageV2Extension|editedMessage|ephemeralMessage/i.test(msg.type) ? msg.message[msg.type].message[getContentType(msg.message[msg.type].message)] : extractMessageContent(msg.message[msg.type]) || msg.message[msg.type];
    msg.body = msg.message?.conversation || msg.content?.text || msg.content?.conversation || msg.content?.caption || msg.content?.selectedButtonId || msg.content?.singleSelectReply?.selectedRowId || msg.content?.selectedId || msg.content?.contentText || msg.content?.selectedDisplayText || msg.content?.title || msg.content?.name || '';
    const rawMentioned = msg.content?.contextInfo?.mentionedJid ?? [];
    let metaParticipants = null;
    if (msg.isGroup && rawMentioned.some(j => j?.endsWith('@lid'))) {
      try {
        if (!groupMeta) {
          groupMeta = await sock.groupMetadata(msg.chat).catch(() => null);
          if (groupMeta) setCachedMeta(msg.chat, groupMeta);
        }
        metaParticipants = groupMeta?.participants ?? null;
      } catch {}
    }
    const resolveMentionedJids = async (rawList) => {
      const normalized = (rawList ?? []).map(raw => raw ? normalizeJid(raw) : null);
      const out = new Array(normalized.length);
      const needStore = [];
      for (let i = 0; i < normalized.length; i++) {
        const norm = normalized[i];
        if (!norm) { out[i] = null; continue; }
        if (!norm.endsWith('@lid')) { out[i] = norm; continue; }
        const sync = resolveJidSync(norm, sock);
        if (sync && !sync.endsWith('@lid')) { out[i] = sync; continue; }
        out[i] = norm;
        needStore.push(i);
      }
      if (needStore.length) {
        const batchResolved = await resolveLidsAsync(needStore.map(i => out[i]), sock);
        for (const i of needStore) {
          const lid = out[i];
          const viaStore = batchResolved.get(lid);
          if (viaStore) { out[i] = viaStore; continue; }
          if (metaParticipants) {
            const lidBase = lid.split('@')[0];
            for (const p of metaParticipants) {
              if (p.lid?.split('@')[0] === lidBase) { out[i] = p.id; break; }
              if (p.id?.split('@')[0] === lidBase) { out[i] = p.id; break; }
            }
          }
        }
      }
      return out.filter(Boolean);
    };
    msg.mentionedJid = await resolveMentionedJids(rawMentioned);
    msg.mentionedUsernames = msg.isGroup ? msg.mentionedJid.map(j => getUsername(groupMeta, j)) : [];
    msg.text = msg.content?.text || msg.content?.caption || msg.message?.conversation || msg.content?.contentText || msg.content?.selectedDisplayText || msg.content?.title || '';
    const activePrefixes = prefix.resolvePrefix(botId);
    msg.usedPrefix = '';
    for (const p of activePrefixes) { if (msg.body?.startsWith(p)) { msg.usedPrefix = p; break; } }
    msg.command = msg.body && msg.body.replace(msg.usedPrefix, '').trim().split(/ +/).shift();
    msg.args = msg.body?.trim().replace(new RegExp('^' + (msg.usedPrefix || '').replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&'), 'i'), '').replace(msg.command, '').split(/ +/).filter((a) => a) || [];
    msg.device = getDevice(msg.id);
    msg.expiration = msg.content?.contextInfo?.expiration || msg?.metadata?.ephemeralDuration || sock?.messages?.[msg.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0;
    msg.timestamp = (typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : msg.messageTimestamp?.low || msg.messageTimestamp?.high) || (msg.content?.timestampMs * 1000);
    msg.isMedia = !!msg.content?.mimetype || !!msg.content?.thumbnailDirectPath;
    if (msg.isMedia && /webp/i.test(msg.content?.mimetype || '')) msg.isAnimated = msg.content?.isAnimated;
    msg.mimetype = msg.content?.mimetype || '';
    msg.quoted = msg.content?.contextInfo?.quotedMessage ? {} : null;
    if (msg.quoted) {
      msg.quoted.message = extractMessageContent(msg.content?.contextInfo?.quotedMessage);
      msg.quoted.type = getContentType(msg.quoted.message) || Object.keys(msg.quoted.message)[0];
      msg.quoted.content = extractMessageContent(msg.quoted.message[msg.quoted.type]) || msg.quoted.message[msg.quoted.type];
      msg.quoted.id = msg.content.contextInfo.stanzaId;
      msg.quoted.device = getDevice(msg.quoted.id);
      msg.quoted.chat = msg.content.contextInfo.remoteJid || msg.chat;
      msg.quoted.isBot = msg.quoted.id ? ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some((a) => msg.quoted.id.startsWith(a) && [12, 16, 20, 22, 40].includes(msg.quoted.id.length)) || /(.)\1{5,}|[^a-zA-Z0-9]/.test(msg.quoted.id) : false;
      const rawQP = msg.content?.contextInfo?.participant ?? '';
      msg.quoted.sender = await resolveJidAsync(sock.decodeJid(rawQP), sock, msg.chat);
      msg.quoted.fromMe = areJidsSameUser(msg.quoted.sender, sock.decodeJid(sock.user.id));
      msg.quoted.username = msg.quoted.chat?.endsWith('@g.us') ? getUsername(getCachedMeta(msg.quoted.chat), msg.quoted.sender) : null;
      msg.quoted.text = msg.quoted.content?.text || msg.quoted.content?.caption || msg.quoted.content?.conversation || msg.quoted.content?.contentText || msg.quoted.content?.selectedDisplayText || msg.quoted.content?.title || '';
      msg.quoted.body = msg.quoted.content?.text || msg.quoted.content?.caption || msg.quoted.message?.conversation || msg.quoted.content?.selectedButtonId || msg.quoted.content?.singleSelectReply?.selectedRowId || msg.quoted.content?.selectedId || msg.quoted.content?.contentText || msg.quoted.content?.selectedDisplayText || msg.quoted.content?.title || msg.quoted.content?.name || '';
      msg.quoted.mentionedJid = await resolveMentionedJids(msg.quoted.content?.contextInfo?.mentionedJid ?? []);
      msg.quoted.isGroup = msg.quoted.chat?.endsWith('@g.us');
      let quotedPrefix = '';
      for (const p of activePrefixes) { if (msg.quoted.body?.startsWith(p)) { quotedPrefix = p; break; } }
      msg.quoted.usedPrefix = quotedPrefix;
      msg.quoted.command = msg.quoted.body && msg.quoted.body.replace(msg.quoted.usedPrefix, '').trim().split(/ +/).shift();
      msg.quoted.isMedia = !!msg.quoted.content?.mimetype || !!msg.quoted.content?.thumbnailDirectPath;
      if (msg.quoted.isMedia && /webp/i.test(msg.quoted.content?.mimetype || '')) msg.quoted.isAnimated = msg.quoted.content?.isAnimated || false;
      msg.quoted.mimetype = msg.quoted.content?.mimetype || '';
      msg.quoted.msg = msg.quoted.content;
      msg.quoted.key = { remoteJid: msg.content?.contextInfo?.remoteJid || msg.chat, participant: msg.quoted.sender, fromMe: areJidsSameUser(sock.decodeJid(msg.content?.contextInfo?.participant), sock.decodeJid(sock?.user?.id)), id: msg.content?.contextInfo?.stanzaId };
      msg.quoted.fakeObj = proto.WebMessageInfo.fromObject({ key: { remoteJid: msg.quoted.chat, fromMe: msg.quoted.fromMe, id: msg.quoted.id }, message: msg.quoted.message, ...(msg.isGroup ? { participant: msg.quoted.sender } : {}) });
      msg.getQuotedObj = async () => false;
      msg.quoted.download = () => sock.downloadMediaMessage(msg.quoted);
      msg.quoted.delete = async () => {
        let isBotAdmins = false;
        if (msg.quoted.isGroup) {
          const botJid = sock?.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : '';
          const botBase = botJid.split('@')[0];
          let meta = getCachedMeta(msg.quoted.chat);
          if (!meta) meta = await sock.groupMetadata(msg.quoted.chat).catch(() => null);
          const participants = meta?.participants || [];
          const adminSet = new Set(participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin').flatMap((p) => [p.id?.split('@')[0], p.lid?.split('@')[0], p.phoneNumber?.split('@')[0]].filter(Boolean)));
          isBotAdmins = adminSet.has(botBase);
        }
        return sock.sendMessage(msg.quoted.chat, { delete: { remoteJid: msg.quoted.chat, fromMe: isBotAdmins ? false : true, id: msg.quoted.id, participant: msg.quoted.sender } });
      };
    }
  }
  msg.getUsername = (jid = msg.sender) => msg.isGroup ? getUsername(getCachedMeta(msg.chat), jid) : null;
  msg.download = () => sock.downloadMediaMessage(msg);
  msg.copy = () => smsg(sock, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(msg)));
  msg.react = (u) => sock.sendMessage(msg.chat, { react: { text: u, key: msg.key } });
  msg.copyNForward = (jid = msg.chat, forceForward = false, options = {}) => sock.copyNForward(jid, msg, forceForward, options);

  msg.getMedia = () => {
    const quoted = msg.quoted ? msg.quoted : msg;
    const content = quoted.content ?? quoted.message ?? quoted;
    const mime = content?.mimetype || '';
    return { quoted, content, mime };
  };

  msg.getMediaMime = () => {
    const quoted = msg.quoted ? msg.quoted : msg;
    const content = quoted.content ?? quoted.message ?? quoted;
    return content?.mimetype || '';
  };

  msg.getMediaContent = () => {
    const quoted = msg.quoted ? msg.quoted : msg;
    return quoted.content ?? quoted.message ?? quoted;
  };

  msg.getMediaBuffer = async () => {
    const quoted = msg.quoted ? msg.quoted : msg;
    return await quoted.download();
  };

  msg.reply = async (content, options = {}) => {
    const quoted = msg;
    const chat = msg.chat;
    const ephemeralExpiration = msg.expiration;
    const mentions = '';
    if (typeof content === 'object') {
      return sock.sendMessage(chat, content, { ...options, quoted, ephemeralExpiration });
    }
    return sock.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration });
  };

  if (!sock.parseMention) {
  sock.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net');
  };
  }
  
  if (!sock.sendImageAsSticker) {
  sock.sendImageAsSticker = async (jid, p, quoted, options = {}) => {
    const buff = Buffer.isBuffer(p) ? p : /^data:.*?\/.*?;base64,/i.test(p) ? Buffer.from(p.split`,`[1], 'base64') : /^https?:\/\//.test(p) ? await getBuffer(p) : await fs.promises.readFile(p).catch(() => Buffer.alloc(0));
    const usesExif = !!(options?.packname || options?.author);
    const buffer = usesExif ? await writeExifImg(buff, options) : await imageToWebp(buff);
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    if (usesExif) { try { await fs.promises.unlink(buffer); } catch {} }
    return buffer;
  };
  }

  if (!sock.sendVideoAsSticker) {
  sock.sendVideoAsSticker = async (jid, p, quoted, options = {}) => {
    const buff = Buffer.isBuffer(p) ? p : /^data:.*?\/.*?;base64,/i.test(p) ? Buffer.from(p.split`,`[1], 'base64') : /^https?:\/\//.test(p) ? await getBuffer(p) : await fs.promises.readFile(p).catch(() => Buffer.alloc(0));
    const usesExif = !!(options?.packname || options?.author);
    const buffer = usesExif ? await writeExifVid(buff, options) : await videoToWebp(buff);
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    if (usesExif) { try { await fs.promises.unlink(buffer); } catch {} }
    return buffer;
  };
  }

  if (!sock.sendFile) {
  sock.sendFile = async (jid, p, filename = 'file', caption = '', quoted = null, ptt = false, options = {}) => {
    let buffer;
    if (Buffer.isBuffer(p)) buffer = p;
    else if (/^https?:\/\//.test(p)) buffer = await getBuffer(p);
    else { try { buffer = await fs.promises.readFile(p); } catch { throw new Error('Ruta o buffer inválido'); } }
    const mimetype = options.mimetype ?? 'application/octet-stream';
    let mtype = 'document';
    if (/webp/i.test(mimetype)) mtype = 'sticker';
    else if (/image/i.test(mimetype)) mtype = 'image';
    else if (/video/i.test(mimetype)) mtype = 'video';
    else if (/audio/i.test(mimetype)) mtype = 'audio';
    if (options.asDocument) mtype = 'document';
    const clean = { ...options };
    ;['asDocument', 'asSticker', 'asImage', 'asVideo'].forEach(k => delete clean[k]);
    return sock.sendMessage(jid, { ...clean, caption, ptt, [mtype]: buffer, mimetype, fileName: filename }, { quoted });
  };
  }

  if (!sock.copyNForward) {
  sock.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    const content = generateForwardMessageContent(message, forceForward);
    if (message.expiration) content[Object.keys(content)[0]].contextInfo = { ...content[Object.keys(content)[0]].contextInfo, expiration: message.expiration };
    return sock.sendMessage(jid, content, options);
  };
  }

  if (!sock.sendAlbumMessage) {
  sock.sendAlbumMessage = async (jid, medias, options = {}) => {
    if (typeof jid !== 'string') throw new TypeError(`jid must be string, received: ${jid}`);
    if (!Array.isArray(medias) || medias.length < 2) throw new RangeError('Minimum 2 media required');
    for (const media of medias) {
      if (!media.type || (media.type !== 'image' && media.type !== 'video')) throw new TypeError(`Invalid media type: ${media.type}`);
      if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) throw new TypeError(`Invalid media data`);
    }
    const caption = options.text || options.caption || '';
    const delayMs = !isNaN(options.delay) ? options.delay : 500;
    delete options.text; delete options.caption; delete options.delay;
    const album = generateWAMessageFromContent(jid, { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.filter(m => m.type === 'image').length, expectedVideoCount: medias.filter(m => m.type === 'video').length, ...(options.quoted ? { contextInfo: { remoteJid: options.quoted.key.remoteJid, fromMe: options.quoted.key.fromMe, stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message } } : {}) } }, {});
    await sock.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });
    for (let i = 0; i < medias.length; i++) {
      const { type, data, caption } = medias[i];
      const mediaMsg = await generateWAMessage(album.key.remoteJid, { [type]: data, ...(caption ? { caption } : {}) }, { upload: sock.waUploadToServer });
      mediaMsg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
      await sock.relayMessage(mediaMsg.key.remoteJid, mediaMsg.message, { messageId: mediaMsg.key.id });
      await delay(delayMs);
    }
    return album;
  };
  }
  
  if (!sock.sendCodeMessage) {
  sock.sendCodeMessage = async (jid, filename, code, quoted, tableData) => {
    const KEYWORDS = new Set(['break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','false','finally','for','function','if','import','in','instanceof','let','new','null','return','super','switch','this','throw','true','try','typeof','var','void','while','with','yield','async','await','static']);
    const METHOD_NAMES = new Set(['log','parse','stringify','from','toString','readFileSync','existsSync','statSync','resolve','join','randomUUID','randomBytes','startsWith','replace','trim','isFile','relayMessage','sendMessage']);
    function tokenize(src) {
      const tokens = [];
      let i = 0;
      const push = (content, type = 'DEFAULT') => { if (content) tokens.push({ content, type }); };
      while (i < src.length) {
        const ch = src[i];
        if (src.startsWith('//', i)) { let j = i + 2; while (j < src.length && src[j] !== '\n') j++; push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
        if (src.startsWith('/*', i)) { let j = i + 2; while (j < src.length - 1 && !(src[j] === '*' && src[j + 1] === '/')) j++; j = Math.min(j + 2, src.length); push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
        if (ch === "'" || ch === '"' || ch === '`') {
          const quote = ch; let j = i + 1, escaped = false;
          while (j < src.length) { const c = src[j]; if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) { j++; break; } j++; }
          push(src.slice(i, j), 'STR'); i = j; continue;
        }
        if (/[0-9]/.test(ch)) { let j = i + 1; while (j < src.length && /[0-9._]/.test(src[j])) j++; push(src.slice(i, j), 'NUMBER'); i = j; continue; }
        if (/[A-Za-z_$]/.test(ch)) {
          let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
          const word = src.slice(i, j); const next = src[j] || '', prev = src[i - 1] || '';
          if (KEYWORDS.has(word)) push(word, 'KEYWORD');
          else if ((METHOD_NAMES.has(word) || next === '(') && prev === '.') push(word, 'METHOD');
          else if (METHOD_NAMES.has(word) && next === '(') push(word, 'METHOD');
          else push(word, 'DEFAULT');
          i = j; continue;
        }
        push(ch, 'DEFAULT'); i++;
      }
      const merged = [];
      for (const token of tokens) { const last = merged[merged.length - 1]; if (last?.type === 'DEFAULT' && token.type === 'DEFAULT') last.content += token.content; else merged.push({ ...token }); }
      return merged;
    }
    const codeBlocks = Array.isArray(code) ? code : tokenize(String(code));
    const sections = [];
    const submessages = [];
    sections.push({ view_model: { primitive: { text: filename, __typename: 'GenAIMarkdownTextUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } });
    if (tableData) {
      const tableRows = [{ items: tableData.headers, isHeading: true }, ...tableData.rows.map(r => ({ items: r.map(String) }))];
      submessages.push({ messageType: 4, tableMetadata: { title: tableData.title, rows: tableRows } });
      sections.push({ view_model: { primitive: { title: tableData.title, rows: tableRows.map(row => ({ is_header: row.isHeading ?? false, cells: row.items, markdown_cells: [] })), __typename: 'GenATableUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } });
    }
    sections.push({ view_model: { primitive: { language: 'javascript', code_blocks: codeBlocks, __typename: 'GenAICodeUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' } });
    const payload = { response_id: crypto.randomUUID(), sections };
    const content = { messageContextInfo: { threadId: [], deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [], recipientKeyHash: '', recipientTimestamp: Math.floor(Date.now() / 1000) }, deviceListMetadataVersion: 2, messageSecret: crypto.randomBytes(32).toString('base64') }, botForwardedMessage: { message: { richResponseMessage: { submessages, messageType: 1, unifiedResponse: { data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64') }, contextInfo: { mentionedJid: [], groupMentions: [], statusAttributions: [], forwardingScore: 2, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '259786046210223@bot' }, forwardOrigin: 4, botMessageSharingInfo: { botEntryPointOrigin: 1, forwardScore: 2 } } } } } };
    return sock.relayMessage(jid, content, {});
  };
  }

  if (!sock.sendStatusMessage) {
  sock.sendStatusMessage = async (jid, options = {}) => {
    const { type = 'text', text, media, caption, mimetype, fileName, ptt, textArgb, backgroundArgb, font, audienceType, listName, listEmoji } = options;
    const contextInfo = { statusSourceType: 0, statusAttributions: [{ AttributionData: null, type: 10 }], isGroupStatus: true, statusAudienceMetadata: { audienceType, listName, listEmoji } };
    let innerMessage;
    if (type === 'text') {
      innerMessage = { extendedTextMessage: { text, textArgb, backgroundArgb, font, previewType: 0, contextInfo } };
    } else {
      const mediaContent = { [type]: typeof media === 'string' ? { url: media } : media };
      if (caption) mediaContent.caption = caption;
      if (mimetype) mediaContent.mimetype = mimetype;
      if (fileName) mediaContent.fileName = fileName;
      if (ptt) mediaContent.ptt = ptt;
      const content = await generateWAMessageContent(mediaContent, { upload: sock.waUploadToServer });
      const messageKey = `${type}Message`;
      content[messageKey].contextInfo = contextInfo;
      innerMessage = { [messageKey]: content[messageKey] };
    }
    const message = generateWAMessageFromContent(jid, { groupStatusMessageV2: { message: innerMessage } }, {});
    await sock.relayMessage(jid, message.message, { messageId: message.key.id });
    return message;
  };
  }
  
  if (!sock.reply) {
  sock.reply = async (jid, text = '', quoted, options) => {
    return Buffer.isBuffer(text) ? sock.sendFile(jid, text, 'file', '', quoted, false, options) : sock.sendMessage(jid, { ...options, text }, { quoted, ...options });
  };
  }
  
  return msg;
}