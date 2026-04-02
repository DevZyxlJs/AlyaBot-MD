const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

const joinCommands = [
  '/invite', '#invite', '-invite',
  '!invite', '.invite', '+invite'
]

export default async (client, m) => {
  if (!m.isGroup || !m.text) return

  const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return

  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin).map(p => p.phoneNumber || p.jid)
  const isAdmin = groupAdmins.includes(m.sender)
  const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupAdmins.includes(botId)

  const botSettings = await getSettings(botId)
  const isSelf = botSettings.self ?? 0
   if (isSelf) return
   if (m.isBot) return;

  const chat = await getChat(m.chat)
  const primaryBotId = chat?.primaryBot
  const isPrimary = !primaryBotId || primaryBotId === botId

  const isGroupLink = linkRegex.test(m.text)
  const command = m.text.trim().split(/\s+/)[0].toLowerCase()

  if (!isGroupLink || !chat?.antilinks || isAdmin || !isBotAdmin || !isPrimary) return

  await client.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  }).catch(() => {})

if (!joinCommands.includes(command)) {
  await client.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  }).catch(() => {})

  if (m.quoted?.key?.id) {
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.key.id,
        participant: m.quoted.key.participant
      }
    }).catch(() => {})
  }

    const ysr = await getUser(m.sender)
    const userName = ysr?.name || m.pushName || 'Usuario'

  setTimeout(async () => {
    await client.reply(m.chat, `❖ *${userName}* eliminado por \`Anti-Link\``, null)
    await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(err => {
      m.reply('Error al expulsar' + err)
    })
  }, 500)
  }
};