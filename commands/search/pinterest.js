import { pinterestSearch } from 'cloudst'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return m.reply('✿ Ingresa un *término* de búsqueda o un enlace de *Pinterest*.')
    }

    try {
      if (isPinterestUrl) {
        const results = await pinterestSearch(text, 1)
        if (!results.status || !results.data.length) {
          return m.reply('✿ No se pudo procesar el enlace de Pinterest.')
        }

        const result = results.data[0]
        const mediaUrl = result.hd || result.mini
        if (!mediaUrl) {
          return m.reply('✿ No se encontró un recurso válido en el enlace.')
        }

        await client.sendMessage(
          m.chat,
          { image: { url: mediaUrl }, caption: result.title || null },
          { quoted: m }
        )
      } else {
        const results = await pinterestSearch(text, 15)
        if (!results.status || !results.data.length) {
          return m.reply(`✿ No se encontraron resultados para *${text}*`)
        }

        const result = results.data[Math.floor(Math.random() * results.data.length)]
        const message =
          `ꕥ ꨩᰰ𑪐𑂺 ˳ ׄ 𝖯𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 𝖲𝖾𝖺𝗋𝖼𝗁 ࣭𑁯ᰍ   ̊ ܃܃\n\n` +
          `${result.title ? `𖣣ֶㅤ֯⌗ ✿ ⬭ Título › *${result.title}*\n` : ''}` +
          `${result.description ? `𖣣ֶㅤ֯⌗ ❀ ⬭ Descripción › *${result.description}*\n` : ''}` +
          `${result.full_name ? `𖣣ֶㅤ֯⌗ ❑ ⬭ Autor › *${result.full_name}*\n` : ''}` +
          `${result.likes ? `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes › *${result.likes}*\n` : ''}` +
          `${result.created ? `𖣣ֶㅤ֯⌗ ✤ ⬭ Publicado › *${result.created}*` : ''}`

        await client.sendMessage(
          m.chat,
          { image: { url: result.hd || result.mini }, caption: message },
          { quoted: m }
        )
      }
    } catch (e) {
      await client.reply(m.chat, '✿ Error al procesar la búsqueda en Pinterest.', m)
    }
  },
}