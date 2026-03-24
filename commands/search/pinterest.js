import { pinterestSearch } from 'cloudst'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args) => {
    const text = args.join(' ')

    if (!text) {
      return m.reply('✿ Ingresa un *término* de búsqueda en Pinterest.')
    }

    try {
      const results = await pinterestSearch(text, 5)

      if (!results.status || !results.data || !results.data.length) {
        return m.reply(`✿ No se encontraron resultados para *${text}*\n\n> ${results}`)
      }

      const result = results.data[0]
      const message =
        `ꕥ Pinterest Search\n\n` +
        `${result.title ? `✿ Título › *${result.title}*\n` : ''}` +
        `${result.description ? `❀ Descripción › *${result.description}*\n` : ''}` +
        `${result.full_name ? `❑ Autor › *${result.full_name}*\n` : ''}` +
        `${result.likes ? `♡ Likes › *${result.likes}*\n` : ''}` +
        `${result.created ? `✤ Publicado › *${result.created}*` : ''}`

      await client.sendMessage(
        m.chat,
        { image: { url: result.hd || result.mini }, caption: message },
        { quoted: m }
      )
    } catch (e) {
      console.error('Error en Pinterest:', e)
      await client.reply(m.chat, '✿ Error al procesar la búsqueda en Pinterest.', m)
    }
  },
}