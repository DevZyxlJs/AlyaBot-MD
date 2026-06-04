import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  run: async ({ msg, sock, args }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const banner = botSettings.icon

    if (!args || !args.length) {
      return sock.reply(
        msg.chat,
        `✿ Ingresa un término de búsqueda.`,
        msg,
      )
    }

    const query = args.join(' ')
    const url = `${api.url}/search/tiktok?query=${query}&key=${api.key}`

    try {
      const res = await fetch(url)
      const json = await res.json()

      if (!json || !json.data || !json.data.length) {
        return sock.reply(msg.chat, `✿ No se encontraron resultados para "${query}".`, msg)
      }

      let message = ``
      json.data.forEach((result, index) => {
        message += `➩ *Título ›* ${result.title}

𖹭  ׄ  ְ ✿ *Autor ›* ${result.author.nickname} (@${result.author.unique_id})
𖹭  ׄ  ְ ✤ *Reproducciones ›* ${result.stats.views}
𖹭  ׄ  ְ ✰ *Comentarios ›* ${result.stats.comments}
𖹭  ׄ  ְ ❖ *Compartidos ›* ${result.stats.shares}
𖹭  ׄ  ְ ꕥ *Me gusta ›* ${result.stats.likes}
𖹭  ׄ  ְ ☄︎ *Descargas ›* ${result.stats.downloads}
𖹭  ׄ  ְ ⚡︎ *Duración ›* ${result.duration}
𖹭  ׄ  ְ ❑ *URL ›* https://www.tiktok.com/@${result.author.unique_id}/video/${result.id}

${index < json.data.length - 1 ? '╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼' : ''}
        `
      })
      await msg.reply(message)
    } catch (e) {
      await msg.reply(msgglobal)
    }
  },
};