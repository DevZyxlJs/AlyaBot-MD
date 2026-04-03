import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async (sock, m, args, command) => {

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)

    const text = args.join(' ').toLowerCase()

    if (!text) {
      return m.reply(`✎ Escriba una *petición* para que *ChatGPT* le responda.`)
    }

    const apiUrl = `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`

    try {
     const txc = `✎ *ChatGPT* está procesando tu respuesta...`;
      const { key } = await sock.sendMessage(
        m.chat,
        { text: txc },
        { quoted: m },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return sock.reply(m.chat, '✎ No se pudo obtener una *respuesta* válida')
      }

      const response = `${json.result}`.trim()
      await sock.sendMessage(m.chat, { text: response, edit: key })
    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
};
