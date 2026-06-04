import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"

export default {
  command: ['count', 'mensajes', 'messages', 'msgcount'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const chatData = await getChat(msg.chat)

    const mentioned = msg.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender)

   const user = await getChatUser(msg.chat, who)
    if (!user)
      return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`)

    const userStats = user.stats || {}
    const now = new Date()
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const days = Object.entries(userStats)
      .filter(([date]) => new Date(date) >= cutoff)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))

    const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
    const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

    let report = `❀ Contador de mensajes de @${who.split('@')[0]}\n`
    report += `> Total en los últimos *30* días: \`${totalMsgs}\` mensajes\n\n`

    for (const [date, d] of days) {
      const fecha = new Date(date).toLocaleDateString('es-CO', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        timeZone: 'America/Bogota' 
      })
      report += `*❏ ${fecha}*\n`
      report += `\t» Mensajes: \`${d.msgs || 0}\`, Comandos: \`${d.cmds || 0}\`\n`
    }

await sock.reply(
  chatId,
  report,
  msg,
  { mentions: [who] }
)
  }
}