import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['hidetag', 'tag'],
  category: 'grupo',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const text = args.join(' ')
    const groupMetadata = msg.isGroup ? await sock.groupMetadata(msg.chat).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants || []

    const mentions = groupParticipants
      .map(p => p.jid || p.id || p.lid || p.phoneNumber)
      .filter(Boolean)
      .map(id => sock.decodeJid(id))

    if (!msg.quoted && !text) {
      return msg.reply(`《✤》 Ingresa un texto o responde a uno`)
    }

    const q = msg.quoted || msg
    let mime = q.mimetype || q.mediaType || ''

    if (!mime) {
      if (q.message?.imageMessage) mime = 'image'
      else if (q.message?.videoMessage) mime = 'video'
      else if (q.message?.stickerMessage) mime = 'sticker'
      else if (q.message?.audioMessage) mime = 'audio'
    }

    const isMedia = /image|video|sticker|audio/.test(mime)

const quotedText =
  q?.text ||
  q?.caption ||
  q?.body ||
  q?.message?.conversation ||
  q?.message?.extendedTextMessage?.text ||
  ''

const finalText = text || quotedText
const hasText = Boolean(finalText && finalText.trim())

try {
  if (isMedia) {
    const media = await q.download()
    const options = { quoted: null, mentions }

    if (/image/.test(mime)) {
      return sock.sendMessage(
        msg.chat,
        hasText
          ? { image: media, caption: text, ...options }
          : { image: media, ...options }
      )
    }

    if (/video/.test(mime)) {
      return sock.sendMessage(
        msg.chat,
        hasText
          ? { video: media, mimetype: 'video/mp4', caption: text, ...options }
          : { video: media, mimetype: 'video/mp4', ...options }
      )
    }

    if (/audio/.test(mime)) {
      return sock.sendMessage(
        msg.chat,
        { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', ...options }
      )
    }

    if (/sticker/.test(mime)) {
      return sock.sendMessage(
        msg.chat,
        { sticker: media, ...options }
      )
    }
  }
  if (!hasText) {
    return msg.reply('《✤》 Ingresa un texto o responde a un mensaje.')
  }

  return sock.sendMessage(
    msg.chat,
    { text: finalText, mentions },
    { quoted: null }
  )

} catch (e) {
  return msg.reply(msgglobal)
}
  }
}