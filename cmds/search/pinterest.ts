import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  async run(sock, m, args, from) {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return m.reply(
        `✿ Ingresa un *término* de búsqueda o un enlace de *Pinterest*.`,
      )
    }

    try {
      if (isPinterestUrl) {
        const pinterestUrl = `${api.url}/dl/pinterest?url=${text}&key=${api.key}`
        const ress = await fetch(pinterestUrl)
        if (!ress.ok) throw new Error(`La API devolvió un código de error: ${ress.status}`)

        const { data: result } = await ress.json()
        const mediaType = ['image', 'video'].includes(result.type) ? result.type : 'document'

        await sock.sendMessage(
          m.chat,
          { [mediaType]: { url: result.dl }, caption: null },
          { quoted: m },
        )
      } else {
        const pinterestAPI = `${api.url}/search/pinterest?query=${text}&key=${api.key}`
        const res = await fetch(pinterestAPI)
        if (!res.ok) throw new Error(`La API devolvió un código de error: ${res.status}`)

        const jsons = await res.json()
        const results = jsons.data

        if (!results || results.length === 0) {
          return m.reply(`✿ No se encontraron resultados para *${text}*`)
        }

        const medias = []
        for (const result of results.slice(0, 10)) {
          const caption =
            `ꕥ ꨩᰰ𑪐𑂺 ˳ ׄ 𝖯𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 𝖲𝖾𝖺𝗋𝖼𝗁 ࣭𑁯ᰍ   ̊ ܃܃\n\n` +
            `${result.title ? `𖣣ֶㅤ֯⌗ ✿ ⬭ Título › *${result.title}*\n` : ''}` +
            `${result.description ? `𖣣ֶㅤ֯⌗ ❀ ⬭ Descripción › *${result.description}*\n` : ''}` +
            `${result.full_name ? `𖣣ֶㅤ֯⌗ ❑ ⬭ Autor › *${result.full_name}*\n` : ''}` +
            `${result.likes ? `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes › *${result.likes}*\n` : ''}` +
            `${result.created ? `𖣣ֶㅤ֯⌗ ✤ ⬭ Publicado › *${result.created}*` : ''}`

          medias.push({
            type: 'image',
            data: { url: result.hd || result.url },
            caption
          })
        }

        if (medias.length) {
          await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply(`✿ No se pudieron procesar los resultados.`)
        }
      }
    } catch (e) {
      await sock.reply(
        m.chat,
        msgglobal,
        m
      )
    }
  },
}