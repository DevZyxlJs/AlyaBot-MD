import yts from 'yt-search';
import {getBuffer} from '#serialize';

export default {
  command: ['ytsearch', 'search'],
  category: 'internet',
  run: async ({ msg, sock, args }) => {
    if (!args || !args[0]) {
      return msg.reply(
        '✿ Ingrese el *título* de un *vídeo*.',
      )
    }

    await msg.reply(mess.wait)

    const ress = await yts(`${args[0]}`)
    const armar = ress.all
    const Ibuff = await getBuffer(armar[0].image)
    let teks2 = armar
      .map((v) => {
        switch (v.type) {
          case 'video':
            return `➩ *Título ›* *${v.title}* 

> ✤ *Duración ›* ${v.timestamp}
> ✰ *Subido ›* ${v.ago}
> ꕥ *Vistas ›* ${v.views}
> ❑ *Url ›* ${v.url}
`.trim()
          case 'channel':
            return `
> ✩ Canal › *${v.name}*
> ❀ Url › ${v.url}
> ✣ Subscriptores › ${v.subCountLabel} (${v.subCount})
> ✧ Videos totales › ${v.videoCount}
`.trim()
        }
      })
      .filter((v) => v)
      .join('\n\n╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼\n\n')
    sock.sendMessage(msg.chat, { image: Ibuff, caption: teks2 }, { quoted: msg }).catch((err) => {
      msg.reply('Error')
    })
  },
};
