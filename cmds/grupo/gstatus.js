import { generateWAMessageContent, generateWAMessageFromContent } from 'baileys'

const sendGroupStatus = async (sock, jid, options = {}) => {
  const {
    text,
    media,
    type = 'text',
    caption = '',
    mimetype,
    fileName,
    ptt = false,
    textArgb = 4292401368,
    backgroundArgb = 4283453520,
    font = 5,
    audienceType = 2,
    listName = 'Mejores Amigos',
    listEmoji = '🔥'
  } = options

  if (!sock?.relayMessage) throw new Error('sock inválido')
  if (!jid || typeof jid !== 'string') throw new Error('jid requerido')

  const contextInfo = {
    statusSourceType: 0,
    statusAttributions: [{ AttributionData: null, type: 10 }],
    isGroupStatus: true,
    statusAudienceMetadata: { audienceType, listName, listEmoji }
  }

  let innerMessage

  if (type === 'text') {
    if (!text || typeof text !== 'string') throw new Error('text requerido')
    innerMessage = {
      extendedTextMessage: {
        text,
        textArgb,
        backgroundArgb,
        font,
        previewType: 0,
        contextInfo
      }
    }
  } else {
    if (!sock?.waUploadToServer) throw new Error('waUploadToServer no disponible')
    if (!media) throw new Error('media requerida')

    const allowed = ['image', 'video', 'audio', 'document']
    if (!allowed.includes(type)) throw new Error(`type inválido: ${type}`)

    const mediaContent = {
      [type]: typeof media === 'string' ? { url: media } : media
    }

    if (caption && ['image', 'video'].includes(type)) mediaContent.caption = caption
    if (mimetype) mediaContent.mimetype = mimetype
    if (fileName && type === 'document') mediaContent.fileName = fileName
    if (type === 'audio') mediaContent.ptt = ptt

    const content = await generateWAMessageContent(mediaContent, {
      upload: sock.waUploadToServer
    })

    const messageKey = `${type}Message`
    if (!content?.[messageKey]) throw new Error(`No se pudo generar ${messageKey}`)

    content[messageKey].contextInfo = contextInfo
    innerMessage = { [messageKey]: content[messageKey] }
  }

  const message = generateWAMessageFromContent(jid, {
    groupStatusMessageV2: { message: innerMessage }
  }, { userJid: sock.user?.id })

  await sock.relayMessage(jid, message.message, { messageId: message.key.id })
  return message
}

export default {
  command: ['gstatus'],
  category: 'group',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || ""
    let text = args.join(' ')

    try {
      if (/image|video|audio|document/.test(mime)) {
        const buffer = await q.download()
        const type = mime.split('/')[0] // image, video, audio, application (document)
        await sendGroupStatus(sock, msg.chat, {
          type: type === 'application' ? 'document' : type,
          media: buffer,
          caption: text || q.text || '',
          mimetype: mime,
          fileName: q.fileName || undefined
        })
      } else {
        const statusText = text || q?.text || ''
        if (!statusText) return sock.reply(msg.chat, '❀ Escribe un texto o cita un archivo multimedia para subir como estado del grupo.', msg)
        await sendGroupStatus(sock, msg.chat, { type: 'text', text: statusText })
      }

      sock.reply(msg.chat, '> ✎ Estado del grupo enviado.', msg)
    } catch (e) {
      sock.reply(msg.chat, msgglobal, msg)
    }
  }
}