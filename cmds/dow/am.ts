import fetch from 'node-fetch'

export default {
  command: ['am', 'applemusic'],
  category: 'downloader',
  async run(sock, m, args) {
    try {
      if (!args[0]) {
        return m.reply('✎ Por favor, menciona el nombre de la canción que deseas descargar de Apple Music')
      }

      const query = args.join(' ')
      const res = await fetch(`${api.url}/dl/applemusic?query=${encodeURIComponent(query)}&key=${api.key}`)
      const result = await res.json()

      if (!result.status || !result.data) {
        return m.reply('❖ No se encontraron resultados en Apple Music')
      }

      const songInfo = result.data

      const caption = `➪ Descargando › ${songInfo.title}

> ✿⃘࣪◌ ֪ Artista › ${songInfo.artist || ""}
> ✿⃘࣪◌ ֪ Álbum › ${songInfo.album || ""}
> ✿⃘࣪◌ ֪ Enlace › ${songInfo.url || ""}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await sock.sendMessage(m.chat, { image: { url: songInfo.thumbnail }, caption }, { quoted: m })

      const audioRes = await fetch(songInfo.download)
      if (!audioRes.ok) {
        return m.reply('❖ Error al obtener el archivo de audio.')
      }
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${songInfo.title}.m4a`
      }

      await sock.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (e) {
      await m.reply('❖ Ocurrió un error inesperado, intenta nuevamente.')
    }
  }
}