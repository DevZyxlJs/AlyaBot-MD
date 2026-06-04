import fetch from 'node-fetch';

export default {
  command: ['translate'],
  category: 'utils',
  run: async ({ msg, sock, args }) => {
    const quoted = msg.quoted ? msg.quoted : msg
    const txt = args.slice(1).join(' ')
    const text = txt || quoted.text?.split(' ').join(' ')
    const language = args[0] || 'es'

    if (!args[0] && !msg.quoted)
      return msg.reply(
        '✐ Ingresa el idioma seguido del texto que quieras traducir.'
      )

    const translateAPI = `https://api.delirius.store/tools/translate?text=${encodeURIComponent(text)}&language=${language}`

    try {
      const res = await fetch(translateAPI)
      const json = await res.json()

      if (!json?.data) return msg.reply('✐ No se pudo traducir el texto.')

      await sock.sendMessage(msg.chat, { text: json.data }, { quoted: msg })
    } catch {
      await msg.reply(msgglobal)
    }
  },
};
