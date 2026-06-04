import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fs from 'fs'
import fetch from 'node-fetch'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      const quoted = msg.quoted ? msg.quoted : msg
      const mime = (quoted.msg || quoted).mimetype || ''
      let user = await getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      let marca = args.join(' ').trim().split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2

      if (/image/.test(mime) || /webp/.test(mime)) {
        let buffer = await quoted.download()
        const media = { mimetype: mime, data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        await sock.sendMessage(msg.chat, { sticker: { url: stickerPath }}, { quoted: msg })
        fs.unlinkSync(stickerPath)
      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 20) return msg.reply('❖ El video no puede ser muy largo')
        let buffer = await quoted.download()
        const tmpFile = `./lib/system/tmp/video-${Date.now()}.mp4`
        fs.writeFileSync(tmpFile, buffer)
        await sock.sendVideoAsSticker(msg.chat, tmpFile, msg, { packname: pack, author: author })
        fs.unlinkSync(tmpFile)
      } else if (args[0] && isUrl(args[0])) {
        const url = args[0]
        const res = await fetch(url)
        if (!res.ok) return msg.reply('❖ No pude descargar ese archivo desde la URL.')
        const buffer = Buffer.from(await res.arrayBuffer())
        const media = { mimetype: 'image/webp', data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        await sock.sendMessage(msg.chat, { sticker: { url: stickerPath }}, { quoted: msg })
        fs.unlinkSync(stickerPath)
      } else {
        return sock.reply(msg.chat, `❀ Por favor, envía una imagen, video o URL para hacer un sticker.`, msg)
      }
    } catch (e) {
      return msg.reply(msgglobal)
    }
  }
}

const isUrl = (text) => {
  return /^https?:\/\/.+/i.test(text)
}