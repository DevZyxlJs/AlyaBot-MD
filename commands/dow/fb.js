import fetch from 'node-fetch'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args, command) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (!args.length) {
      return m.reply('✎ Ingrese uno o varios enlaces de *Facebook*')
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))
    if (!urls.length) {
      return m.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const apiUrl = `${api.url}/dl/facebookv3?url=${url}&key=${api.key}`
            const res = await fetch(apiUrl)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const buffer = await res.buffer()

            medias.push({
              type: 'video',
              data: buffer
            })
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
        const apiUrl = `${api.url}/dl/facebookv3?url=${url}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = await res.buffer()

        await client.sendMessage(
          m.chat,
          { video: buffer, mimetype: 'video/mp4', fileName: 'fb.mp4' },
          { quoted: m }
        )
      }
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}