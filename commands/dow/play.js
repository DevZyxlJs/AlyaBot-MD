import { getBuffer } from '../../lib/message.js';
import fetch from 'node-fetch';

async function getVideoInfo(query) {
  try {
    const endpoint = `${global.api.url}/dl/youtubeplay?query=${encodeURIComponent(query)}&key=${global.api.key}`
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.status || !res.data) return null
    return res.data
  } catch (e) {
    return null
  }
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }
      const text = args.join(' ')
      const videoInfo = await getVideoInfo(text)
      if (!videoInfo) {
        return m.reply('《✧》 No se encontró información del video.')
      }

      const { title, author, duration, views, url, thumbnail, download } = videoInfo
      const vistas = (views || 0).toLocaleString()
      const canal = author || 'Desconocido'
      const thumbBuffer = await getBuffer(thumbnail)

      const caption = `➥ Descargando › ${title}

> ✿⃘࣪◌ ֪ Canal › ${canal}
> ✿⃘࣪◌ ֪ Duración › ${duration || 'Desconocido'}
> ✿⃘࣪◌ ֪ Vistas › ${vistas}
> ✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

      if (!download?.url) {
        return m.reply('《✧》 No se pudo descargar el *audio*, intenta más tarde.')
      }

      const audioBuffer = await getBuffer(download.url)
        mensaje = { audio: audioBuffer, fileName: `${title || 'audio'}.mp3`, mimetype: 'audio/mpeg' }
      await client.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}