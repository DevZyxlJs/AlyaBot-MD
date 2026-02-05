export default {
  command: ['setdescription', 'setdesc'],
  category: 'rpg',
    run: async (client, m, args, command, text, prefix) => {
    const user = global.db.data.users[m.sender]
    const input = args.join(' ')

    if (user.description)
      return m.reply(
        `✐ Ya tienes una descripción. Usa › *${prefix}deldescription* para eliminarla.`,
      )

    if (!input)
      return m.reply(
        '《✧》 Debes especificar una descripción válida.',
      )

    user.description = input
    return m.reply(`✐ Se ha establecido tu descripción:\n> *${user.description}*`)
  },
};
