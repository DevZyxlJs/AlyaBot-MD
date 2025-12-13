/*
   # Aviso :
            - Este Bot no usa una database "JSON", usa Sqlite para mejor rendimiento!
*/

import path from 'path'
import _ from 'lodash'
import yargs from 'yargs/yargs'
import Database from 'better-sqlite3'

global.opts = Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const dbPath = path.join(process.cwd(), 'lib', 'stellar.db')
const conn = new Database(dbPath, { fileMustExist: false, timeout: 10000 })

conn.pragma('journal_mode = WAL')
conn.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    key TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    contenido TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    clave TEXT PRIMARY KEY,
    valor TEXT
  );
`)

global.db = {
  conn,
  data: {
    users: {},
    chats: {},
    settings: {},
  },
  chain: null,
  READ: false,
  _snapshot: {
    users: '{}',
    chats: '{}',
    settings: '{}',
  },
}

global.DATABASE = global.db

global.loadDatabase = function loadDatabase() {
  if (global.db.READ) return global.db.data
  global.db.READ = true

  const usuarios = conn.prepare(`SELECT key, data FROM usuarios`).all()
  for (const row of usuarios) {
    try {
      global.db.data.users[row.key] = JSON.parse(row.data)
    } catch {}
  }

  const chats = conn.prepare(`SELECT id, contenido FROM chats`).all()
  for (const row of chats) {
    try {
      global.db.data.chats[row.id] = JSON.parse(row.contenido)
    } catch {}
  }

  const settings = conn.prepare(`SELECT clave, valor FROM settings`).all()
  for (const row of settings) {
    try {
      global.db.data.settings[row.clave] = JSON.parse(row.valor)
    } catch {}
  }

  global.db.chain = _.chain(global.db.data)
  global.db.READ = false

  global.db._snapshot.users = JSON.stringify(global.db.data.users)
  global.db._snapshot.chats = JSON.stringify(global.db.data.chats)
  global.db._snapshot.settings = JSON.stringify(global.db.data.settings)

  return global.db.data
}

function hasPendingChanges() {
  const { users, chats, settings } = global.db.data
  const snap = global.db._snapshot

  return (
    snap.users !== JSON.stringify(users) ||
    snap.chats !== JSON.stringify(chats) ||
    snap.settings !== JSON.stringify(settings)
  )
}

global.saveDatabase = function saveDatabase() {
  if (!hasPendingChanges()) return

  const { users, chats, settings } = global.db.data

  const insertUser = conn.prepare(`REPLACE INTO usuarios (key, data) VALUES (?, ?)`)
  for (const [key, data] of Object.entries(users)) {
    insertUser.run(key, JSON.stringify(data))
  }

  const insertChat = conn.prepare(`REPLACE INTO chats (id, contenido) VALUES (?, ?)`)
  for (const [id, contenido] of Object.entries(chats)) {
    insertChat.run(id, JSON.stringify(contenido))
  }

  const insertSetting = conn.prepare(`REPLACE INTO settings (clave, valor) VALUES (?, ?)`)
  for (const [clave, valor] of Object.entries(settings)) {
    insertSetting.run(clave, JSON.stringify(valor))
  }

  global.db._snapshot.users = JSON.stringify(users)
  global.db._snapshot.chats = JSON.stringify(chats)
  global.db._snapshot.settings = JSON.stringify(settings)
}

let lastSave = Date.now()

setInterval(() => {
  const now = Date.now()
  const elapsed = now - lastSave

  if (elapsed >= 1000 && hasPendingChanges()) {
    global.saveDatabase()
    lastSave = now
  }
}, 500)

export default global.db