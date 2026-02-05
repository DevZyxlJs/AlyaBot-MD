import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloader',
  run: async (client, m, args, command) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (!args.length) {
      return m.reply('✎ Ingrese uno o varios enlaces de *Instagram*.')
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return m.reply('✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
            const json = await res.json()
            if (!json.status || !json.data) continue

            if (json.data.length === 1) {
              const media = json.data[0]
              medias.push({ type: 'video', data: { url: media.url } })
            } else {
              for (const media of json.data.slice(0, 10)) {
                medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
              }
            }
          } catch (e) {
            continue
          }
        }
        if (medias.length) {
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply(`✿ No se pudieron procesar los enlaces.`)
        }
      } else {
        const url = urls[0]
        const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.data) {
          return client.reply(m.chat, '✿ No se pudo *obtener* el contenido', m)
        }

        if (json.data.length === 1) {
          const media = json.data[0]
          await client.sendMessage(
            m.chat,
            { video: { url: media.url }, mimetype: 'video/mp4', fileName: 'instagram.mp4' },
            { quoted: m }
          )
        } else {
          const medias = []
          for (const media of json.data.slice(0, 10)) {
            medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
          }
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        }
      }
    } catch (e) {
      await client.reply(m.chat, msgglobal, m)
    }
  }
}