import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  async run(sock, m, args) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const banner = botSettings.icon

    if (!args || !args.length) {
      return sock.reply(
        m.chat,
        `✿ Ingresa un término de búsqueda.`,
        m,
      )
    }

    const query = args.join(' ')
    const url = `${api.url}/search/tiktok?query=${query}&key=${api.key}`

    // await m.reply(mess.wait)

    try {
      const res = await fetch(url)
      const json = await res.json()

      if (!json || !json.data || !json.data.length) {
        return sock.reply(m.chat, `✿ No se encontraron resultados para "${query}".`, m)
      }

      let message = ``
      json.data.forEach((result, index) => {
        message += `➩ *Título ›* ${result.title}

𖹭  ׄ  ְ ✿ *Autor ›* ${result.author.nickname} (@${result.author.unique_id})
𖹭  ׄ  ְ ✤ *Reproducciones ›* ${result.stats.views}
𖹭  ׄ  ְ ✰ *Comentarios ›* ${result.stats.comments}
𖹭  ׄ  ְ ❖ *Compartidos ›* ${result.stats.shares}
𖹭  ׄ  ְ ꕥ *Me gusta ›* ${result.stats.likes}
𖹭  ׄ  ְ ☄︎ *Descargas ›* ${result.downloads}
𖹭  ׄ  ְ ⚡︎ *Duración ›* ${result.duration}
𖹭  ׄ  ְ ❑ *URL ›* https://www.tiktok.com/@${result.author.unique_id}/video/${result.video_id}

${index < json.data.length - 1 ? '╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼' : ''}
        `
      })
    await sock.sendContextInfoIndex(m.chat, message, {}, m, true, {})
    } catch (e) {
      await m.reply(msgglobal)
    }
  },
};
