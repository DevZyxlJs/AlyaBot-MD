export default {
  command: ['invhistory','histinv'],
  category: 'rpg',

  run: async (client, m) => {
    const db = global.db.data
    const chatData = db.chats[m.chat]
    const senderId = m.sender
    const user = chatData.users[senderId]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = db.settings[botId].currency || 'Monedas'

    if (!user.tradeHistory || user.tradeHistory.length === 0)
      return m.reply('✎ No tienes historial de inversiones.')

    let txt = '《✧》 Historial de inversiones\n\n'

    user.tradeHistory.slice().reverse().forEach((inv, i) => {
      const estado = inv.multiplier >= 5 ? `ꕥ x${inv.multiplier}` : '✎ Perdida'
      txt += `${i + 1}. ¥${inv.amount.toLocaleString()} → ¥${inv.reward.toLocaleString()} ${currency} ${estado}\n`
    })

    m.reply(txt)
  }
}