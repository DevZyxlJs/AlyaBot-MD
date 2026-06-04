export default {
  command: ['toimg', 'toimage'],
  category: 'utils',
  run: async ({ msg, sock }) => {
    if (!msg.quoted) return sock.reply(msg.chat, `✿ Debes citar un sticker para convertir a imagen.`, msg)
   // await msg.react('🕒')
    let xx = msg.quoted
    let imgBuffer = await xx.download()
    if (!imgBuffer) {
      // await msg.react('✖️')
      return sock.reply(msg.chat, `✿ No se pudo descargar el sticker.`, msg)
    }
    await sock.sendMessage(msg.chat, { image: imgBuffer }, { quoted: msg })
   // await msg.react('✔️')
  }
}