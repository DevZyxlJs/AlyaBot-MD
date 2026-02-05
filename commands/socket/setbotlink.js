export default {
  command: ['setlink', 'setbotlink'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)

    const value = args.join(' ').trim()
    if (!value) {
      return m.reply(`✿ Ingresa un enlace válido que comience con http:// o https://`)
    }

    if (!/^https?:\/\//i.test(value)) {
      return m.reply('✿ El enlace debe comenzar con http:// o https://')
    }

    config.link = value

    return m.reply(`✎ Se cambió el enlace del Socket correctamente.`)
  },
};