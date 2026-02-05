export default {
  command: ['setwelcome'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, command, text, prefix) => {
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId] || {};

    if (!args.length) {
      return m.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ Set Welcome ࣭𑁯ᰍ   ̊ ܃܃

*❒ Variables disponibles:*
𖣣ֶㅤ֯⌗ ✤ ⬭ @user    
> → Mención del usuario que sale

𖣣ֶㅤ֯⌗ ✤ ⬭ @group   
> → Nombre del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @desc    
> → Descripción del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @members 
> → Número de miembros actuales

𖣣ֶㅤ֯⌗ ✤ ⬭ @time    
> → Fecha y hora

✿ Si ya tienes un mensaje configurado y quieres borrarlo:
${prefix + command} 0`);
    }

    if (args[0] === '0') {
      if (!chat.welcomeMessage || chat.welcomeMessage.trim() === '') {
        return m.reply('✎ No tienes ningún mensaje de bienvenida definido.');
      }
      chat.welcomeMessage = '';
      return m.reply('✐ Mensaje de bienvenida eliminado.');
    }

    if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
      return m.reply(`《✤》 Ya tienes un mensaje de bienvenida configurado:\n\n${chat.welcomeMessage}\n\nSi quieres reemplazarlo, primero bórralo con:\n${prefix + command} 0`);
    }

    const texto = args.join(' ');
    chat.welcomeMessage = texto;

    m.reply(`✐ Nuevo mensaje de bienvenida configurado correctamente.`);
  }
};