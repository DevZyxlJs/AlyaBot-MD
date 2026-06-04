import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
function parseTime(str) {
  const match = str.match(/^(\d+)(min|h|d|mes)$/i)
  if (!match) return null
  const num = parseInt(match[1])
  const unit = match[2].toLowerCase()
  switch (unit) {
    case 'min': return num * 60 * 1000
    case 'h': return num * 60 * 60 * 1000
    case 'd': return num * 24 * 60 * 60 * 1000
    case 'mes': return num * 30 * 24 * 60 * 60 * 1000
    default: return null
  }
}

async function ejecutarAccion(sock, chatId, action) {
  if (action === 'open') {
    await sock.groupSettingUpdate(chatId, 'not_announcement')
    await sock.reply(chatId, `✎ El grupo ha sido abierto automáticamente.`)
  }
  const chat = await getChat(chatId)
  let acciones = typeof chat.scheduledActions === 'string'
    ? JSON.parse(chat.scheduledActions)
    : chat.scheduledActions || []
  acciones = acciones.filter(t => !(t.action === action && t.expiresAt <= Date.now()))
  await updateChat(chatId, 'scheduledActions', acciones)
}

async function scheduleGroupAction(chatId, action, ms, sock) {
  const expiresAt = Date.now() + ms
  const task = { action, expiresAt }
  const chat = await getChat(chatId)
  const tasks = typeof chat.scheduledActions === 'string'
    ? JSON.parse(chat.scheduledActions)
    : chat.scheduledActions || []
  tasks.push(task)
  await updateChat(chatId, 'scheduledActions', tasks)
  setTimeout(() => ejecutarAccion(sock, chatId, action), ms)
}

export default {
  command: ['closet'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args }) => {
    const groupMetadata = await sock.groupMetadata(msg.chat)
    const groupAnnouncement = groupMetadata.announce
    if (!args.length) {
      await updateChat(msg.chat, 'scheduledActions', [])
      if (groupAnnouncement === true) {
        return sock.reply(msg.chat, `《✤》 El grupo ya está cerrado.`, msg)
      }
      await sock.groupSettingUpdate(msg.chat, 'announcement')
      return sock.reply(msg.chat, `✎ El grupo ha sido cerrado correctamente.`, msg)
    }
    const ms = parseTime(args[0])
    if (!ms) return sock.reply(msg.chat, `✎ Formato inválido. Usa ej: 1min, 6h, 2d, 1mes`, msg)
    await sock.groupSettingUpdate(msg.chat, 'announcement')
    await sock.reply(msg.chat, `✎ El grupo estará cerrado por ${args[0]}.`, msg)
    await scheduleGroupAction(msg.chat, 'open', ms, sock)
  }
}