import db from "#db"
import axios from "axios"

export default {
  command: ["tiktok", "tt"],
  category: "downloader",
  isSocket: true,
  run: async ({ msg, sock, args, command }) => {
    if (!args.length) {
      return msg.reply("✿ Ingresa un término o enlace de TikTok.")
    }

    const isMp3 = args.includes("--mp3")
    const urls = args.filter(arg => arg.includes("tiktok.com"))

    const buildCaption = (data) => {
      const {
        title = "Sin título",
        author = {},
        stats = {},
        music = {},
        music_info = {},
        duration,
        id
      } = data

      const tiktokLink = `https://www.tiktok.com/@${author.unique_id || "unknown"}/video/${id}`

      return (
        `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗸 🅓ownload　ᰙ\n\n` +
        `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
        `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || "Desconocido"}\n` +
        `𖣣ֶㅤ֯⌗ ❖ ⬭ Duración: ${duration || music_info?.duration || music?.duration || "N/A"}\n` +
        `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ꕥ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ❒ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ❍ ⬭ Enlace: ${tiktokLink}\n` +
        `𖣣ֶㅤ֯⌗ ❖ ⬭ Audio: ${(music?.title || music_info?.title) ? (music.title || music_info.title) + " -" : "Desconocido"} ${(music?.author || music_info?.author || "")}`
      )
    }

    if (urls.length) {
      const url = urls[0]
      try {
        const apiUrl = isMp3
          ? `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(url)}&key=${api.key}`
          : `${api.url}/dl/tiktok?url=${url}&key=${api.key}`

        const res = await axios.get(apiUrl)
        const json = res.data
        const data = json.data

        if (!data) return msg.reply(`✿ No se encontraron resultados para: ${url}`)

        const caption = buildCaption(data)

        if (isMp3) {
          await sock.sendMessage(msg.chat, { image: { url: data.thumbnail }, caption }, { quoted: msg })
          await sock.sendMessage(msg.chat, { 
            audio: { url: data.dl }, 
            mimetype: "audio/mpeg", 
            fileName: `${data.title || "audio"}.mp3`, 
            ptt: true 
          }, { quoted: msg })
        } else {
          await sock.sendMessage(msg.chat, { 
            [data.type || "video"]: { url: data.dl }, 
            caption 
          }, { quoted: msg })
        }
      } catch (e) {
        console.error(e)
        await msg.reply(msgglobal)
      }
      return
    }

    const query = args.filter(a => a !== "--mp3").join(" ")
    if (!query) return msg.reply("✿ Ingresa un término de búsqueda.")

    try {
      const searchUrl = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`
      const res = await axios.get(searchUrl)
      const json = res.data
      const results = json.result

      if (!results || results.length === 0) {
        return msg.reply(`❖ No se encontraron resultados para: ${query}`)
      }

      if (isMp3) {
        const chosen = results[0]
        const tiktokUrl = `https://www.tiktok.com/@${chosen.author.unique_id}/video/${chosen.id}`
        const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(tiktokUrl)}&key=${api.key}`

        const res2 = await axios.get(apiUrl)
        const json2 = res2.data
        const data = json2.data

        if (!data) return msg.reply("✿ No se pudo obtener el audio de este video.")

        const caption = buildCaption(data)

        await sock.sendMessage(msg.chat, { image: { url: data.thumbnail }, caption }, { quoted: msg })
        await sock.sendMessage(msg.chat, { 
          audio: { url: data.dl }, 
          mimetype: "audio/mpeg", 
          fileName: `${data.title || "audio"}.mp3` 
        }, { quoted: msg })

        return
      }

      const medias = []
      const resultsToSend = results.slice(0, 5)

      for (const item of resultsToSend) {
        const caption = buildCaption(item)
        medias.push({
          type: "video",
          data: { url: item.dl },
          caption
        })
      }

      if (medias.length) {
        await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
      } else {
        await msg.reply("✿ No se pudieron procesar los resultados.")
      }

    } catch (e) {
      console.error(e)
      await msg.reply(msgglobal)
    }
  },
}