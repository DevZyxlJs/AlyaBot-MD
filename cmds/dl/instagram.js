import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply('✎ Ingrese uno o varios enlaces de *Instagram*.')
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return msg.reply('✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
            const json = await res.json()
            if (!json.status || !json.data) continue

            if (json.data.length === 1) {
              const media = json.data[0]
              medias.push({ type: 'video', data: { url: media.url } })
            } else {
              for (const media of json.data.slice(0, 10)) {
                medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
              }
            }
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
        const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.data) {
          return sock.reply(msg.chat, '✿ No se pudo *obtener* el contenido', msg)
        }

        if (json.data.length === 1) {
          const media = json.data[0]
          await sock.sendMessage(
            msg.chat,
            { video: { url: media.url }, mimetype: 'video/mp4', fileName: 'instagram.mp4' },
            { quoted: msg }
          )
        } else {
          const medias = []
          for (const media of json.data.slice(0, 10)) {
            medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
          }
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        }
      }
    } catch (e) {
      await sock.reply(msg.chat, msgglobal, msg)
    }
  }
}