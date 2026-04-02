import fetch from "node-fetch"
import { getBuffer } from '../../lib/message.ts'

export default {
  command: ["xvideos"],
  run: async (client, m, args) => {

     const chat = await getChat(m.chat)

    if (!chat.nsfw)
      return m.reply(
        mess.nsfw,
      )

    try {
      const query = args.join(" ")
      if (!query) return m.reply("✿ Ingresa el nombre de un video o una URL de XVideos.")

      let videoUrl, videoInfo

      if (query.startsWith("http") && query.includes("xvideos.com")) {
        videoUrl = query
      } else {
        const apiUrl = `${api.url}/nsfw/search/xvideos?query=${query}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) {
       return m.reply("Error al conectar con XVideos API")
       }

        const json = await res.json()
        if (!json.status || !json.resultados || json.resultados.length === 0) throw new Error("No se encontró el video")

        const randomIndex = Math.floor(Math.random() * json.resultados.length)
        videoInfo = json.resultados[randomIndex]
        videoUrl = videoInfo.url

        const caption = `- ׄ　ꕤ　ׅ　✤ ໌　۟　🅧videos　ׅ　팅화　ׄ

𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Titulo :: ${videoInfo.title}*
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Artista ::* ${videoInfo.artist || "Desconocido"}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Resolución ::* ${videoInfo.resolution}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Duración ::* ${videoInfo.duration}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Ver en ::* ${videoInfo.url}`

    await client.sendContextInfoIndex(m.chat, caption, {}, m, true, {})
      }

      const downloadUrl = `${api.url}/nsfw/dl/xvideos?url=${videoUrl}&key=${api.key}`
      const downloadRes = await fetch(downloadUrl)
      if (!downloadRes.ok) {
    return m.reply("Error al descargar el video")
     }

      const downloadJson = await downloadRes.json()
      if (!downloadJson.status || !downloadJson.resultado) {
    return m.reply("No se pudo obtener el video para descargar.")
     }

      const videoDownloadLink = downloadJson.resultado.videos.low

      await client.sendMessage(m.chat, {
        video: { url: videoDownloadLink },
        mimetype: "video/mp4"
      }, { quoted: m })

    } catch (err) {
      return m.reply(msgglobal)
    }
  },
}