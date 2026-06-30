import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const res = await axios.get(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
            const json = res.data
            if (!json.status || !json.data || !json.data.download) continue
            for (const media of json.data.download.slice(0, 10)) {
              if (media.type === "video") {
                medias.push({ type: "video", data: { url: media.url } })
              } else {
                medias.push({ type: "image", data: { url: media.url } })
              }
            }
          } catch {}
        }
        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply("✿ No se pudieron procesar los enlaces.")
        }
      } else {
        const url = urls[0]
        const res = await axios.get(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
        const json = res.data
        if (!json.status || !json.data || !json.data.download) {
          return sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
        }
        const downloads = json.data.download
        if (downloads.length === 1 && downloads[0].type === "video") {
          const media = downloads[0]
          await sock.sendMessage(
            msg.chat,
            { video: { url: media.url }, mimetype: "video/mp4", fileName: "instagram.mp4" },
            { quoted: msg }
          )
        } else {
          const medias = []
          for (const media of downloads.slice(0, 10)) {
            if (media.type === "video") {
              medias.push({ type: "video", data: { url: media.url } })
            } else {
              medias.push({ type: "image", data: { url: media.url } })
            }
          }
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        }
      }
    } catch (e) {
      await sock.reply(msg.chat, msgglobal, msg)
    }
  }
}