import fetch from 'node-fetch'

export default {
  command: ['r34', 'r34vid', 'rule34', 'rule34vid', 'rule', 'rulevid'],
  category: 'nsfw',
  run: async (client, m, args, command) => {
    try {
      const chatId = m.chat
      const db = global.db

      if (!db.data.chats[chatId]?.nsfw)
        return m.reply('🌽 Los comandos de *NSFW* están desactivados en este grupo.')

      if (!args[0]) 
        return client.reply(m.chat, `🌵 Debes especificar tags para buscar.`, m)

      const tag = args[0].replace(/\s+/g, '_')
      let mediaList = []
      const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}&api_key=a4e807dd6d4c9e55768772996946e4074030ec02c49049d291e5edb8808a97b004190660b4b36c3d21699144c823ad93491d066e73682a632a38f9b6c3cf951b&user_id=5753302`

      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } 
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      let json = []
      try {
        json = JSON.parse(text)
      } catch {
        json = []
      }

      const data = Array.isArray(json) ? json : json?.post || json?.data || []
      const valid = data
        .map(i => i?.file_url || i?.sample_url || i?.preview_url)
        .filter(u => typeof u === 'string' && /\.(jpe?g|png|gif|mp4)$/i.test(u))

      if (valid.length) {
        mediaList = [...new Set(valid)].sort(() => Math.random() - 0.5)
      }

      if (!mediaList.length) 
        return client.reply(m.chat, `🍒 No se encontraron resultados para ${tag}`, m)

      let filtered = []
      if (command === 'r34' || command === 'rule34' || command === 'rule') {
        filtered = mediaList.filter(u => /\.(jpe?g|png|gif)$/i.test(u))
      } else if (command === 'r34vid' || command === 'rule34vid' || command === 'rulevid') {
        filtered = mediaList.filter(u => /\.mp4$/i.test(u))
      }

      if (!filtered.length) 
        return client.reply(m.chat, `🍒 No se encontraron ${command === 'r34' ? 'imágenes' : 'videos'} para ${tag}`, m)

      const media = filtered[0]
      const caption = `🌵 Resultados para » ${tag}`

      if (command === 'r34vid' || command === 'rule34vid' || command === 'rulevid') {
        await client.sendMessage(m.chat, { video: { url: media }, caption, mentions: [m.sender] }, { quoted: m })
      } else {
        await client.sendMessage(m.chat, { image: { url: media }, caption, mentions: [m.sender] }, { quoted: m })
      }

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}