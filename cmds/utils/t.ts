export default {
  command: ['test'],
  category: 'utils',
  run: async (sock, m, args, command, text, prefix) => {
    try {
      if (m.mentionedJid?.length) {
        return m.reply(`📌 Usuarios mencionados: ${m.mentionedJid.join(', ')}`);
      }

      return m.reply('🌱 No se mencionó a ningún usuario.');
    } catch (err) {
      console.error(err);
      await m.reply('❌ Error al procesar el comando.');
    }
  },
};