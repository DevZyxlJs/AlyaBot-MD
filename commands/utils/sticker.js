import fs from 'fs'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['sticker', 's'],
  category: 'utils',
  run: async (client, m, args, command, text, prefix) => {
    try {
      const quoted = m.quoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''      
      let user = globalThis.db.data.users[m.sender] || {}
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      let pack = texto1
      let author = texto2

      if (/image/.test(mime) || /webp/.test(mime)) {
        let buffer = await quoted.download()
        const media = { mimetype: mime, data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        await client.sendMessage(m.chat, { sticker: { url: stickerPath }}, { quoted: m })
        await fs.unlinkSync(stickerPath)
      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 20) return m.reply('❖ El video no puede ser muy largo')
        let buffer = await quoted.download()
        const tmpFile = `./lib/system/tmp/video-${Date.now()}.mp4`
        await fs.writeFileSync(tmpFile, buffer)
        await client.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
        await fs.unlinkSync(tmpFile)
      } else {
        return client.reply(m.chat, `❀ Por favor, envía una imagen, video o sticker.`, m)
      }
    } catch (e) {
      return m.reply(msgglobal)
    }
  }
}