import axios from 'axios'

export default {
  command: ['wiki', 'wikipedia'],
  category: 'search',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    if (!text) return sock.reply(msg.chat, `✿ Por favor, ingresa lo que quieres buscar en Wikipedia.`, msg)
    try {
    //  await msg.react('🕒')
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&format=json`
      const searchRes = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const results = searchRes.data.query.search
      if (!results || results.length < 4) {
       // await msg.react('✖️')
        return sock.reply(msg.chat, '✿ No hay suficientes resultados en Wikipedia (mínimo 4).', msg)
      }
      const count = Math.floor(Math.random() * 3) + 3
      const shuffled = results.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, count)
      let replyText = `❑ *Wikipedia Search*\n\n> ✿ Búsqueda :: ${text}\n\n`
      for (const r of selected) {
        const snippet = r.snippet.replace(/<\/?span[^>]*>/g, '')
        replyText += `• ${r.title}\n${snippet}\n\n`
      }
      await sock.reply(msg.chat, replyText.trim(), msg)
     // await msg.react('✔️')
    } catch (e) {
     // await msg.react('✖️')
      await msg.reply(msgglobal)
    }
  },
}