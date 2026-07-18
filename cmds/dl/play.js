import ytsearch from "yt-search"
import { getBuffer } from "#serialize"
import fetch from "node-fetch"

export default {
  command: ["play", "mp3", "ytmp3", "ytaudio", "playaudio"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {

    try {
      if (!args[0]) {
        return msg.reply("《✧》Por favor, menciona el nombre o URL del video que deseas descargar")
      }

      const text = args.join(" ")
      const searchResult = await ytsearch(text)
      if (!searchResult.videos || !searchResult.videos.length) {
        return msg.reply("《✧》 No se encontró información del video.")
      }

      const video = searchResult.videos[0]
      const { title, author, timestamp: duration, views, url, image } = video
      const vistas = (views || 0).toLocaleString()
      const canal = author?.name || author || "Desconocido"
      const thumbBuffer = await getBuffer(image)

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando audio, por favor espera!*_`

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      const dlEndpoint = `${api.url}/dl/ytmp3v2?url=${encodeURIComponent(url)}&key=${api.key}`
      const resDl = await fetch(dlEndpoint).then(r => r.json())
      if (!resDl?.status || !resDl.data?.dl) {
        return msg.reply("《✧》 No se pudo descargar el *audio*, intenta más tarde.")
      }

      const audioBuffer = await getBuffer(resDl.data.dl)

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: resDl.data.fileName || `${title}.mp3`,
        ptt: true
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}