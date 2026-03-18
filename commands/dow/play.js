import ytsearch from 'yt-search'
import { getBuffer } from '../../lib/message.js'
import fetch from 'node-fetch'

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const text = args.join(' ')
      const searchResult = await ytsearch(text)
      if (!searchResult.videos || !searchResult.videos.length) {
        return m.reply('《✧》 No se encontró información del video.')
      }

      // const randomIndex = Math.floor(Math.random() * searchResult.videos.length)
      const video = searchResult.videos[0]

      const { title, author, timestamp: duration, views, url, image } = video
      const vistas = (views || 0).toLocaleString()
      const canal = author?.name || author || 'Desconocido'
      const thumbBuffer = await getBuffer(image)

      const caption = `➥ Descargando › ${title}

> ✿⃘࣪◌ ֪ Canal › ${canal}
> ✿⃘࣪◌ ֪ Duración › ${duration || 'Desconocido'}
> ✿⃘࣪◌ ֪ Vistas › ${vistas}
> ✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

      const dlEndpoint = `${global.api.url}/dl/ytmp3v2?url=${encodeURIComponent(url)}&key=${global.api.key}`
      const resDl = await fetch(dlEndpoint).then(r => r.json())
      if (!resDl?.status || !resDl.data?.dl) {
        return m.reply('《✧》 No se pudo descargar el *audio*, intenta más tarde.')
      }

      const audioBuffer = await getBuffer(resDl.data.dl)
      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: resDl.data.fileName || `${title}.mp3`
      }

      await client.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}