import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'core', 'database.json');

let database = {
  users: {},
  chats: {},
  chat_users: {},
  settings: {},
  sticker_packs: {}
};

try {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    database = JSON.parse(data);
  }
} catch (error) {
  console.error('Error al cargar la base de datos:', error);
}

export const defUser = {
  name: '',
  exp: 0,
  sugCooldown: 0,
  level: 0,
  Subs: 0,
  usedcommands: 0,
  pasatiempo: '',
  description: '',
  marry: '',
  genre: '',
  birth: '',
  metadatos: null,
  metadatos2: null
};

export const defChat = {
  bannedGrupo: 0,
  welcomeMessage: '',
  byeMessage: '',
  welcome: 0,
  goodbye: 0,
  antinsfw: 0,
  nsfw: 0,
  alerts: 0,
  gacha: 1,
  rpg: 1,
  adminonly: 0,
  expulsar: 0,
  warnLimit: 0,
  primaryBot: null,
  antilinks: 1,
  antistatus: 0,
  personajesReservados: [],
  intercambios: [],
  timeTrade: 0,
  scheduledActions: [],
  groupOpenStatus: 0
};

export const defChatUser = {
  coins: 0,
  bank: 0,
  lastdungeon: 0,
  lasthunt: 0,
  lastfish: 0,
  lastslot: 0,
  dailyStreak: 0,
  characters: [],
  personajesEnVenta: [],
  crimeCooldown: 0,
  mineCooldown: 0,
  ritualCooldown: 0,
  workCooldown: 0,
  rtCooldown: 0,
  slutCooldown: 0,
  roboCooldown: 0,
  pptCooldown: 0,
  lastDaily: 0,
  voteCooldown: 0,
  rwCooldown: 0,
  buyCooldown: 0,
  stats: {},
  usedTime: null,
  warnings: []
};

export const defSets = {
  self: 0,
  prefijo: ['/', '#'],
  commandsejecut: 0,
  type: 'Sub',
  link: 'https://api.stellarwa.xyz',
  banner: 'https://cdn.nexylight.xyz/files/aouhio5v.jpeg',
  icon: 'https://cdn.nexylight.xyz/files/9yhtos.jpeg',
  currency: '¥enes',
  namebot: 'あ ┊⏤͟͟͞͞☆ Alya San ϟ',
  namebot2: 'Alya',
  owner: 'Oculto por privacidad'
};

export const defStickerPack = {
  packs: []
};

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al guardar la base de datos:', error);
  }
}

export function initDB() {
  saveDatabase();
}

export function getUser(id, opt = {}) {
  if (!id) {
    const { orderBy, desc = true } = opt;
    if (orderBy) {
      const allowedCols = ['exp', 'level', 'usedcommands', 'name'];
      if (!allowedCols.includes(orderBy)) throw new Error('Columna no permitida');
      
      const users = Object.values(database.users);
      users.sort((a, b) => {
        const aVal = a[orderBy] || 0;
        const bVal = b[orderBy] || 0;
        return desc ? bVal - aVal : aVal - bVal;
      });
      return users;
    }
    return Object.values(database.users);
  }
  
  if (!database.users[id]) {
    database.users[id] = { ...defUser, id };
    saveDatabase();
  }
  
  return database.users[id];
}

export function updateUser(id, field, val) {
  if (!database.users[id]) {
    getUser(id);
  }
  
  database.users[id][field] = val;
  saveDatabase();
  return true;
}

export function getChat(id) {
  if (!id) {
    return Object.values(database.chats);
  }
  
  if (!database.chats[id]) {
    database.chats[id] = { ...defChat, id };
    saveDatabase();
  }
  
  return database.chats[id];
}

export function updateChat(id, field, val) {
  if (!database.chats[id]) {
    getChat(id);
  }
  
  database.chats[id][field] = val;
  saveDatabase();
  return true;
}

export function getChatUser(chatId, userId, opt = {}) {
  if (!chatId) {
    return Object.values(database.chat_users);
  }
  
  if (!userId) {
    const { orderBy, desc = true } = opt;
    
    let users = Object.values(database.chat_users).filter(cu => cu.chat_id === chatId);
    
    if (orderBy) {
      const allowedCols = ['coins', 'bank', 'dailyStreak', 'lastDaily'];
      if (!allowedCols.includes(orderBy)) throw new Error('Columna no permitida para ordenamiento');
      
      users.sort((a, b) => {
        const aVal = a[orderBy] || 0;
        const bVal = b[orderBy] || 0;
        return desc ? bVal - aVal : aVal - bVal;
      });
    }
    
    return users;
  }
  
  const key = `${chatId}:${userId}`;
  if (!database.chat_users[key]) {
    database.chat_users[key] = { ...defChatUser, chat_id: chatId, user_id: userId };
    saveDatabase();
  }
  
  return database.chat_users[key];
}

export function updateChatUser(chatId, userId, field, val) {
  const key = `${chatId}:${userId}`;
  if (!database.chat_users[key]) {
    getChatUser(chatId, userId);
  }
  
  database.chat_users[key][field] = val;
  saveDatabase();
  return true;
}

export function getSettings(id) {
  if (!database.settings[id]) {
    database.settings[id] = { ...defSets, id };
    saveDatabase();
  }
  
  return database.settings[id];
}

export function updateSettings(id, field, val) {
  if (!database.settings[id]) {
    getSettings(id);
  }
  
  database.settings[id][field] = val;
  saveDatabase();
  return true;
}

export function getStickersPack(id) {
  if (!id) {
    return Object.values(database.sticker_packs);
  }
  
  if (!database.sticker_packs[id]) {
    database.sticker_packs[id] = { ...defStickerPack, id };
    saveDatabase();
  }
  
  return database.sticker_packs[id];
}

export function updateStickersPack(id, field, val) {
  if (!database.sticker_packs[id]) {
    getStickersPack(id);
  }
  
  database.sticker_packs[id][field] = val;
  saveDatabase();
  return true;
}

export function deletedb(type, ...ids) {
  if (!type || !ids || ids.length === 0) return false;
  
  switch (type) {
    case 'user':
      if (database.users[ids[0]]) {
        delete database.users[ids[0]];
        saveDatabase();
        return true;
      }
      return false;
      
    case 'chat':
      if (database.chats[ids[0]]) {
        delete database.chats[ids[0]];
        saveDatabase();
        return true;
      }
      return false;
      
    case 'chatuser':
      if (ids.length < 2) return false;
      const key = `${ids[0]}:${ids[1]}`;
      if (database.chat_users[key]) {
        delete database.chat_users[key];
        saveDatabase();
        return true;
      }
      return false;
      
    case 'settings':
      if (database.settings[ids[0]]) {
        delete database.settings[ids[0]];
        saveDatabase();
        return true;
      }
      return false;
      
    case 'stickerpack':
      if (database.sticker_packs[ids[0]]) {
        delete database.sticker_packs[ids[0]];
        saveDatabase();
        return true;
      }
      return false;
      
    default:
      return false;
  }
}

export function setCreate(table, identifier, field, value) {
  if (table === 'chat_users') {
    if (!Array.isArray(identifier) || identifier.length < 2) {
      throw new Error('chat_users requiere [chatId, userId]');
    }
    const [chatId, userId] = identifier;
    const key = `${chatId}:${userId}`;
    
    if (!database.chat_users[key]) {
      database.chat_users[key] = { ...defChatUser, chat_id: chatId, user_id: userId };
    }
    
    if (!database.chat_users[key].hasOwnProperty(field)) {
      database.chat_users[key][field] = value;
    }
    
    saveDatabase();
    return database.chat_users[key][field];
    
  } else if (table === 'users') {
    if (!database.users[identifier]) {
      database.users[identifier] = { ...defUser, id: identifier };
    }
    
    if (!database.users[identifier].hasOwnProperty(field)) {
      database.users[identifier][field] = value;
    }
    
    saveDatabase();
    return database.users[identifier][field];
    
  } else if (table === 'chats') {
    if (!database.chats[identifier]) {
      database.chats[identifier] = { ...defChat, id: identifier };
    }
    
    if (!database.chats[identifier].hasOwnProperty(field)) {
      database.chats[identifier][field] = value;
    }
    
    saveDatabase();
    return database.chats[identifier][field];
    
  } else if (table === 'settings') {
    if (!database.settings[identifier]) {
      database.settings[identifier] = { ...defSets, id: identifier };
    }
    
    if (!database.settings[identifier].hasOwnProperty(field)) {
      database.settings[identifier][field] = value;
    }
    
    saveDatabase();
    return database.settings[identifier][field];
  }
  
  return value;
}

export function clearCache() {
  return true;
}

export default {
  initDB,
  getUser,
  updateUser,
  getChat,
  updateChat,
  getChatUser,
  updateChatUser,
  getSettings,
  updateSettings,
  getStickersPack,
  updateStickersPack,
  deletedb,
  setCreate,
  clearCache,
  db: database
};
