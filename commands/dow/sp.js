import fetch from 'node-fetch';
import { getBuffer } from '../../lib/message.js';

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify')
      }

      const query = args.join(' ')
      let url, title, artist, thumbBuffer, result

      if (/open\.spotify\.com\/track\//i.test(query)) {
        url = query
      } else {
        const search = await fetch(`${api.url}/search/spotify?query=${encodeURIComponent(query)}&key=${api.key}`)
        const data = await search.json()
        if (!data.status || !data.result.length) {
          return m.reply('❖ No se encontraron resultados en Spotify')
        }
        url = data.result[0].link
      }

      const res = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
      result = await res.json()
      if (!result.status) return m.reply('❖ No se pudo procesar el enlace de Spotify.')

      const song = result.song
      title = song.title
      artist = song.artist
      thumbBuffer = await getBuffer(song.thumbnail)

      const infoMessage = `➪ Descargando › ${title}

> ✿⃘࣪◌ ֪ Artista › ${artist}
> ✿⃘࣪◌ ֪ Duración › ${song.duration}
> ✿⃘࣪◌ ֪ Enlace › ${song.spotifyUrl}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await client.sendContextInfoIndex(m.chat, infoMessage, {}, m, true, null, {
        banner: song.thumbnail,
        title: '仚 🎧 Spotify',
        body: title
      })

      const audioBuffer = await getBuffer(result.downloadUrl)
      let mensaje;

        mensaje = {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        };

      await client.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (e) {
      // console.log(e)
      await m.reply(msgglobal)
    }
  }
};