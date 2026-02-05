import axios from 'axios'

export default {
  command: ['wiki', 'wikipedia'],
  category: 'search',
  run: async (client, m, args, command, text, prefix) => {
    if (!text) return client.reply(m.chat, `✿ Por favor, ingresa lo que quieres buscar en Wikipedia.`, m)
    try {
    //  await m.react('🕒')
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&format=json`
      const searchRes = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const results = searchRes.data.query.search
      if (!results || results.length < 4) {
       // await m.react('✖️')
        return client.reply(m.chat, '✿ No hay suficientes resultados en Wikipedia (mínimo 4).', m)
      }
      const count = Math.floor(Math.random() * 3) + 3
      const shuffled = results.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, count)
      let replyText = `❑ *Wikipedia Search*\n\n> ✿ Búsqueda :: ${text}\n\n`
      for (const r of selected) {
        const snippet = r.snippet.replace(/<\/?span[^>]*>/g, '')
        replyText += `• ${r.title}\n${snippet}\n\n`
      }
      await client.reply(m.chat, replyText.trim(), m)
     // await m.react('✔️')
    } catch (e) {
     // await m.react('✖️')
      await m.reply(msgglobal)
    }
  },
}