import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { getBuffer } from '#serialize'
import sharp from 'sharp'
import fetch from "node-fetch"

export default {
  command: ["xvideos"],
  run: async ({ msg, sock, args }) => {

    const chat = await getChat(msg.chat)
    if (!chat.nsfw) return msg.reply(mess.nsfw)

    try {
      const query = args.join(" ")
      if (!query) return msg.reply("✿ Ingresa el nombre de un video o una URL de XVideos.")

      let videoUrl, videoInfo

      if (query.startsWith("http") && query.includes("xvideos.com")) {
        videoUrl = query
      } else {
        const apiUrl = `${api.url}/nsfw/search/xvideos?query=${query}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) return msg.reply("Error al conectar con XVideos API")

        const json = await res.json()
        if (!json.status || !json.resultados || json.resultados.length === 0) throw new Error("No se encontró el video")

        const randomIndex = Math.floor(Math.random() * json.resultados.length)
        videoInfo = json.resultados[randomIndex]
        videoUrl = videoInfo.url

        const caption = `- ׄ　ꕤ　ׅ　✤ ໌　۟　🅧videos　ׅ　팅화　ׄ

𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Titulo ::* ${videoInfo.title}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Artista ::* ${videoInfo.artist || "Desconocido"}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Resolución ::* ${videoInfo.resolution}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Duración ::* ${videoInfo.duration}
𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ *Ver en ::* ${videoInfo.url}`

        await msg.reply(caption)
      }

      const downloadUrl = `${api.url}/nsfw/dl/xvideos?url=${videoUrl}&key=${api.key}`
      const downloadRes = await fetch(downloadUrl)
      if (!downloadRes.ok) return msg.reply("Error al descargar el video")

      const downloadJson = await downloadRes.json()
      if (!downloadJson.status || !downloadJson.resultado || !downloadJson.resultado.result) {
        return msg.reply("No se pudo obtener el video para descargar.")
      }

      const result = downloadJson.resultado.result
      const videoDownloadLink = result.url

      await sock.sendMessage(msg.chat, {
        video: { url: videoDownloadLink },
        mimetype: "video/mp4"
      }, { quoted: msg })

    } catch (err) {
      return msg.reply(msgglobal)
    }
  },
}