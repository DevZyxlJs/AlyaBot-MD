export default async (sock, m) => {
  if (!m.isGroup) return

  const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return

  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin).map(p => p.id || p.jid)
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupAdmins.includes(botId)
  const isAdmin = groupAdmins.includes(m.sender)

  const botSettings = await getSettings(botId)
  const isSelf = botSettings.self ?? 0
  if (isSelf) return

  const chat = await getChat(m.chat)
  const primaryBotId = chat?.primaryBot
  const isPrimary = !primaryBotId || primaryBotId === botId

  const isEstado = m.quoted?.groupStatusMentionMessage || 
                   m.quoted?.type === 'groupStatusMentionMessage' || 
                   m.message?.groupStatusMentionMessage ||
                   (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage)

    if (!isEstado || !chat?.antistatus || isAdmin || !isBotAdmin || !isPrimary) return

  try {
    let deleteObj = null
    let participantToUse = null

    if (m.quoted && (m.quoted.groupStatusMentionMessage || m.quoted.type === 'groupStatusMentionMessage')) {
      const quotedKey = m.quoted.key
      
      participantToUse = quotedKey.participantAlt || 
                        quotedKey.participant.split(':')[0] + "@s.whatsapp.net"
      
      deleteObj = {
        remoteJid: m.chat,
        fromMe: false,
        id: quotedKey.id,
        participant: participantToUse
      }
      
    }
    else if (m.message?.groupStatusMentionMessage) {
      participantToUse = m.key.participantAlt || 
                        m.key.participant.split(':')[0] + "@s.whatsapp.net"
      
      deleteObj = {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: participantToUse
      }
      
    }
    else if (m.message?.extendedTextMessage?.contextInfo) {
      const contextInfo = m.message.extendedTextMessage.contextInfo
      
      if (contextInfo.quotedMessage?.groupStatusMentionMessage || contextInfo.stanzaId) {
        participantToUse = contextInfo.participant.split(':')[0] + "@s.whatsapp.net" ||
                          m.sender
        
        deleteObj = {
          remoteJid: m.chat,
          fromMe: false,
          id: contextInfo.stanzaId,
          participant: participantToUse
        }
        
      }
    }

    if (deleteObj) {

      await sock.sendMessage(m.chat, {
        delete: deleteObj
      }).catch(err => {
        console.error('Error al borrar status (detalle):', err)
      })

      const currentParticipant = m.key.participantAlt || 
                                m.key.participant.split(':')[0] + "@s.whatsapp.net"
      
      const currentDeleteObj = {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: currentParticipant
      }
      
      if (currentDeleteObj.id !== deleteObj.id) {
        await sock.sendMessage(m.chat, {
          delete: currentDeleteObj
        }).catch(err => {
          console.error('Error al borrar comando actual:', err)
        })
      }
    } else {
      console.log('No se pudo construir deleteObj válido')
    }

    const ysr = await getUser(m.sender)
    const userName = ysr?.name || m.pushName || 'Usuario'

    setTimeout(async () => {
    await sock.reply(m.chat, `❖ *${userName}* eliminado por \`Anti-Status\``, null)
    await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }, 500)

  } catch (error) {
    console.error('Error general en Anti-Estado:', error)
    
    const ysr = await getUser(m.sender)
    const userName = ysr?.name || m.pushName || 'Usuario'
    
    await sock.reply(m.chat, `❖ *${userName}* el \`Anti-Status\` está activado, a la proxima serás expulsado del grupo.`, m)
  }
}
