import { wiki } from 'cloudst'

export default {
  command: ['wiki', 'wikipedia'],
  category: 'search',
  run: async (client, m, args, command, text, prefix) => {
    if (!text) {
      return client.reply(m.chat, `✿ Por favor, ingresa lo que quieres buscar en Wikipedia.`, m)
    }
    try {
      const results = await wiki(text)

      if (!results || results.length < 4) {
        return client.reply(m.chat, '✿ No hay suficientes resultados en Wikipedia (mínimo 4).', m)
      }

      let replyText = `❑ *Wikipedia Search*\n\n> ✿ Búsqueda :: ${text}\n\n`
      for (const r of results) {
        replyText += `• ${r.title}\n${r.snippet}\n\n`
      }

      await client.reply(m.chat, replyText.trim(), m)
    } catch (e) {
      await m.reply('✿ Error al consultar Wikipedia.')
    }
  },
}