import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply('✎ Ingrese uno o varios enlaces de *Facebook*')
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
    if (!urls.length) {
      return msg.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const apiUrl = `${api.url}/dl/facebookv2?url=${url}&key=${api.key}`
            const res = await fetch(apiUrl)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const buffer = await res.buffer()

            medias.push({
              type: 'video',
              data: buffer
            })
          } catch (e) {
            continue
          }
        }
        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply(`✿ No se pudieron procesar los enlaces.`)
        }
      } else {
        const url = urls[0]
        const apiUrl = `${api.url}/dl/facebookv2?url=${url}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = await res.buffer()

        await sock.sendMessage(
          msg.chat,
          { video: buffer, mimetype: 'video/mp4', fileName: 'fb.mp4' },
          { quoted: msg }
        )
      }
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}