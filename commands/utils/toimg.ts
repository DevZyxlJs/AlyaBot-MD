export default {
  command: ['toimg', 'toimage'],
  category: 'utils',
  run: async (client, m) => {
    if (!m.quoted) return client.reply(m.chat, `✿ Debes citar un sticker para convertir a imagen.`, m)
   // await m.react('🕒')
    let xx = m.quoted
    let imgBuffer = await xx.download()
    if (!imgBuffer) {
      // await m.react('✖️')
      return client.reply(m.chat, `✿ No se pudo descargar el sticker.`, m)
    }
    await client.sendMessage(m.chat, { image: imgBuffer }, { quoted: m })
   // await m.react('✔️')
  }
}