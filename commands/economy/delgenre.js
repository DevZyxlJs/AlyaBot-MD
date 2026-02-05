export default {
  command: ['delgenre'],
  category: 'rpg',
  run: async (client, m) => {
    const user = global.db.data.users[m.sender]
    if (!user.genre) return m.reply(`ꕥ No tienes un género asignado.`)

    user.genre = ''
    return m.reply(`✐ Tu género ha sido eliminado.`)
  },
};
