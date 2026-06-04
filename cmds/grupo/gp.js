import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['gp', 'groupinfo'],
  category: 'grupo',
  run: async ({ msg, sock, args }) => {
    const from = msg.chat
    const groupMetadata = msg.isGroup ? await sock.groupMetadata(from).catch(() => {}) : ''
    if (!groupMetadata) return msg.reply("No se pudo obtener la información del grupo.")

    const groupName = groupMetadata.subject
    const groupCreator = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Desconocido'
    const totalParticipants = groupMetadata.participants.length

    const chat = await getChat(msg.chat)
    const chatUsers = await getChatUser(msg.chat)

    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = await getSettings(botId)

    const botname = botSettings.namebot2
    const monedas = botSettings.currency

    let totalCoins = 0
    let registeredUsersInGroup = 0
    let totalClaimedWaifus = 0

    for (const participant of groupMetadata.participants) {
      const fullId = participant.phoneNumber || participant.id || participant.jid
      const user = chatUsers.find(u => u.user_id === fullId)
      if (user) {
        registeredUsersInGroup++
        totalCoins += Number(user.coins) || 0
        const personagens = Array.isArray(user.characters) ? user.characters : []
        totalClaimedWaifus += personagens.length
      }
    }

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : ''
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net')
      ? `@${rawPrimary.split('@')[0]}`
      : 'Aleatorio'

    const settings = {
      bot: chat.bannedGrupo ? '✘ Desactivado' : '✓ Activado',
      antiLinks: chat.antilinks ? '✓ Activado' : '✘ Desactivado',
      antistatus: chat.antistatus ? '✓ Activado' : '✘ Desactivado',
      welcomes: chat.welcome ? '✓ Activado' : '✘ Desactivado',
      goodbye: chat.goodbye ? '✓ Activado' : '✘ Desactivado',
      alerts: chat.alerts ? '✓ Activado' : '✘ Desactivado',
      gacha: chat.gacha ? '✓ Activado' : '✘ Desactivado',
      rpg: chat.rpg ? '✓ Activado' : '✘ Desactivado',
      nsfw: chat.nsfw ? '✓ Activado' : '✘ Desactivado',
      adminMode: chat.adminonly ? '✓ Activado' : '✘ Desactivado',
      botprimary: botprimary
    }

    try {
      let message = `*「✿」Grupo ◢ ${groupName} ◤*\n\n`
      message += `➪ *Creador ›* ${groupCreator}\n`
      message += `❖ Bot Principal › *${settings.botprimary}*\n`
      message += `❒ Usuarios › *${totalParticipants}*\n`
      message += `ꕥ Registrados › *${registeredUsersInGroup}*\n`
      message += `✿ Claims › *${totalClaimedWaifus}*\n`
      message += `⛁ Dinero › *${totalCoins.toLocaleString()} ${monedas}*\n\n`
      message += `➪ *Configuraciones:*\n`
      message += `✐ ${botname} › *${settings.bot}*\n`
      message += `✐ AntiLinks › *${settings.antiLinks}*\n`
      message += `✐ AntiStatus › *${settings.antistatus}*\n`
      message += `✐ Bienvenidas › *${settings.welcomes}*\n`
      message += `✐ Despedidas › *${settings.goodbye}*\n`
      message += `✐ Alertas › *${settings.alerts}*\n`
      message += `✐ Gacha › *${settings.gacha}*\n`
      message += `✐ Economía › *${settings.rpg}*\n`
      message += `✐ Nsfw › *${settings.nsfw}*\n`
      message += `✐ ModoAdmin › *${settings.adminMode}*`

      const mentionOw = groupMetadata.owner ? groupMetadata.owner : ''
      const mentions = [rawPrimary, mentionOw].filter(Boolean)

      await sock.reply(msg.chat, message.trim(), msg, { mentions })
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}