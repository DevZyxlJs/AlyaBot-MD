import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply(`✿ Ingresa un término o enlace de TikTok.`)
    }

    const isMp3 = args.includes('--mp3')
    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (urls.length) {
      const url = urls[0]
      try {
        const apiUrl = isMp3
          ? `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(url)}&key=${api.key}`
          : `${api.url}/dl/tiktok?url=${url}&key=${api.key}`

        const res = await fetch(apiUrl)
        const json = await res.json()
        const data = json.data
        if (!data) return msg.reply(`✿ No se encontraron resultados para: ${url}`)

        const {
          id,
          title = 'Sin título',
          dl,
          duration,
          thumbnail,
          author = {},
          stats = {},
          music_info = {},
          music = {},
          type
        } = data

        const tiktokLink = `https://www.tiktok.com/@${author.unique_id}/video/${id}`

        const caption =
          `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ᰙ\n\n` +
          `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
          `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
          `𖣣ֶㅤ֯⌗ ❖ ⬭ Duración: ${duration || music_info.duration || 'N/A'}\n` +
          `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ꕥ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ❒ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ❍ ⬭ Enlace: ${tiktokLink}\n` +
          `𖣣ֶㅤ֯⌗ ❖ ⬭ Audio: ${(music.title || music_info.title) ? (music.title || music_info.title) + ' -' : 'Desconocido'} ${(music.author || music_info.author || '')}`

        if (isMp3) {
          await sock.sendMessage(msg.chat, { image: { url: thumbnail }, caption }, { quoted: msg })
          await sock.sendMessage(msg.chat, { audio: { url: dl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: msg })
        } else {
          await sock.sendMessage(msg.chat, { [type || 'video']: { url: dl }, caption }, { quoted: msg })
        }
      } catch (e) {
        await msg.reply(msgglobal)
      }
    } else {
      const query = args.filter(a => a !== '--mp3').join(" ")
      try {
        const searchUrl = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`
        const res = await fetch(searchUrl)
        const json = await res.json()
        const results = json.data
        if (!results || results.length === 0) return msg.reply(`❖ No se encontraron resultados para: ${query}`)

        if (isMp3) {
          const chosen = results[0]
          const tiktokUrl = `https://www.tiktok.com/@${chosen.author.unique_id}/video/${chosen.id}`
          const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(tiktokUrl)}&key=${api.key}`

          const res2 = await fetch(apiUrl)
          const json2 = await res2.json()
          const data = json2.data

          const {
            id,
            title = 'Sin título',
            dl,
            duration,
            thumbnail,
            author = {},
            stats = {},
            music_info = {},
            music = {}
          } = data

          const tiktokLink = `https://www.tiktok.com/@${author.unique_id}/video/${id}`

          const caption =
            `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ᰙ\n\n` +
            `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
            `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
            `𖣣ֶㅤ֯⌗ ❖ ⬭ Duración: ${duration || music_info.duration || 'N/A'}\n` +
            `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ꕥ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ❒ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ❍ ⬭ Enlace: ${tiktokLink}\n` +
            `𖣣ֶㅤ֯⌗ ❖ ⬭ Audio: ${(music.title || music_info.title) ? (music.title || music_info.title) + ' -' : 'Desconocido'} ${(music.author || music_info.author || '')}`

          await sock.sendMessage(msg.chat, { image: { url: thumbnail }, caption }, { quoted: msg })
          await sock.sendMessage(msg.chat, { audio: { url: dl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: msg })
        } else {
          const medias = []
          for (const data of results.slice(0, 5)) {
            const {
              id,
              title = 'Sin título',
              dl,
              duration,
              author = {},
              stats = {},
              music = {}
            } = data

            const tiktokLink = `https://www.tiktok.com/@${author.unique_id}/video/${id}`

            const caption =
              `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ᰙ\n\n` +
              `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
              `𖣣ֶㅤ֯⌗ ❑ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
              `𖣣ֶㅤ֯⌗ ❀ ⬭ Duración: ${duration || 'N/A'}\n` +
              `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ★ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ❖ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ꕥ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ❍ ⬭ Enlace: ${tiktokLink}\n` +
              `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Audio: ${music.title ? music.title + ' -' : 'Desconocido'} ${music.author || ''}`

            medias.push({
              type: 'video',
              data: { url: dl },
              caption
            })
          }

          if (medias.length) {
            await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
          } else {
            await msg.reply('✿ No se pudieron procesar los resultados.')
          }
        }
      } catch (e) {
        msg.reply(msgglobal)
      }
    }
  },
};