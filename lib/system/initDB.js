let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefijo ??= ['/', '#']
  settings.commandsejecut ??= isNumber(settings.commandsejecut) ? settings.commandsejecut : 0
  settings.type ??= 'Sub'
  settings.link ??= 'https://api.stellarwa.xyz'
  settings.banner ??= 'https://cdn.nightlight.qzz.io/CAYcy.jpeg'
  settings.icon ??= 'https://cdn.nightlight.qzz.io/P3MBo.jpeg'
  settings.currency ??= 'Coins'
  settings.namebot ??= 'Bocchi Hitori'
  settings.namebot2 ??= 'Bocchi'
  settings.owner ??= 'Oculto por privacidad'

  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= ''
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.bannedGrupo ??= false
  chat.welcomeMessage ??= ''
  chat.byeMessage ??= ''
  chat.welcome ??= false
  chat.goodbye ??= false
  chat.nsfw ??= false
  chat.alerts ??= false
  chat.gacha ??= true
  chat.pokes ??= true
  chat.rpg ??= true
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= true
  chat.personajesReservados ||= []
  chat.intercambios ||= []

  chat.users[m.sender] ||= {}
  user.stats = user.stats || {}
  user.usedTime = user.usedTime || null
chat.users[m.sender].lastdungeon = isNumber(chat.users[m.sender].lastdungeon) ? chat.users[m.sender].lastdungeon : 0
chat.users[m.sender].lasthunt = isNumber(chat.users[m.sender].lasthunt) ? chat.users[m.sender].lasthunt : 0
chat.users[m.sender].coins = isNumber(chat.users[m.sender].coins) ? chat.users[m.sender].coins : 0
chat.users[m.sender].lastfish = isNumber(chat.users[m.sender].lastfish) ? chat.users[m.sender].lastfish : 0
chat.users[m.sender].lastslot = isNumber(chat.users[m.sender].lastslot) ? chat.users[m.sender].lastslot : 0
chat.users[m.sender].dailyStreak = isNumber(chat.users[m.sender].dailyStreak) ? chat.users[m.sender].dailyStreak : 0
chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
chat.users[m.sender].characters = Array.isArray(chat.users[m.sender].characters) ? chat.users[m.sender].characters : []
chat.users[m.sender].crimeCooldown = isNumber(chat.users[m.sender].crimeCooldown) ? chat.users[m.sender].crimeCooldown : 0
chat.users[m.sender].mineCooldown = isNumber(chat.users[m.sender].mineCooldown) ? chat.users[m.sender].mineCooldown : 0
chat.users[m.sender].ritualCooldown = isNumber(chat.users[m.sender].ritualCooldown) ? chat.users[m.sender].ritualCooldown : 0
chat.users[m.sender].workCooldown = isNumber(chat.users[m.sender].workCooldown) ? chat.users[m.sender].workCooldown : 0
chat.users[m.sender].rtCooldown = isNumber(chat.users[m.sender].rtCooldown) ? chat.users[m.sender].rtCooldown : 0
chat.users[m.sender].slutCooldown = isNumber(chat.users[m.sender].slutCooldown) ? chat.users[m.sender].slutCooldown : 0
chat.users[m.sender].roboCooldown = isNumber(chat.users[m.sender].roboCooldown) ? chat.users[m.sender].roboCooldown : 0
chat.users[m.sender].pptCooldown = isNumber(chat.users[m.sender].pptCooldown) ? chat.users[m.sender].pptCooldown : 0
chat.users[m.sender].lastDaily = isNumber(chat.users[m.sender].lastDaily) ? chat.users[m.sender].lastDaily : 0
chat.users[m.sender].voteCooldown = isNumber(chat.users[m.sender].voteCooldown) ? chat.users[m.sender].voteCooldown : 0
chat.users[m.sender].rwCooldown = isNumber(chat.users[m.sender].rwCooldown) ? chat.users[m.sender].rwCooldown : 0
chat.users[m.sender].buyCooldown = isNumber(chat.users[m.sender].buyCooldown) ? chat.users[m.sender].buyCooldown : 0
}

export default initDB;