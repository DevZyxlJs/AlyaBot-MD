import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async ({ msg, sock, args, command }) => {

    const text = args.join(' ').toLowerCase()
    if (!text) {
      return msg.reply(`✎ Escriba una *petición* para que *ChatGPT* le responda.`)
    }

    const apiUrl = `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`

    try {
      const { key } = await sock.sendMessage(
        msg.chat,
        { text: '✎ *ChatGPT* está procesando tu respuesta...' },
        { quoted: msg },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return sock.reply(msg.chat, '✎ No se pudo obtener una *respuesta* válida')
      }

      const response = `${json.result}`.trim()

      const userAskedCode = /(codigo|code|programa|script|actualiza|edita)/i.test(text)

      const looksLikeCode = /function|class|const|let|var|=>|\{|\}|console\.log/i.test(response)

      if (userAskedCode || looksLikeCode) {
        let language = 'javascript'
        if (/typescript/i.test(text) || /typescript/i.test(response)) language = 'typescript'
        else if (/python/i.test(text) || /def |import |print\(/i.test(response)) language = 'python'
        else if (/html/i.test(text) || /<html>|<div>|<span>/i.test(response)) language = 'html'
        else if (/css/i.test(text) || /\{.*\}/i.test(response) && /color|margin|padding|font/i.test(response)) language = 'css'

        await sock.sendCodeMessage(
          msg.chat,
          dev,
          language,
          response,
          msg
        )
      } else {
        await sock.sendMessage(msg.chat, { text: response, edit: key })
      }
    } catch (error) {
      console.error(error)
      await msg.reply(msgglobal)
    }
  },
};