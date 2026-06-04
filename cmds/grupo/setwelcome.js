import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setwelcome'],
  category: 'grupo',
  isAdmin: true,
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat;
    const chat = await getChat(msg.chat)

    if (!args.length) {
      return msg.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ Set Welcome ࣭𑁯ᰍ   ̊ ܃܃

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
        return msg.reply('✎ No tienes ningún mensaje de bienvenida definido.');
      }
      chat.welcomeMessage = '';

   await updateChat(msg.chat, 'welcomeMessage', chat.welcomeMessage)
      return msg.reply('✐ Mensaje de bienvenida eliminado.');
    }

    if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
      return msg.reply(`《✤》 Ya tienes un mensaje de bienvenida configurado:\n\n${chat.welcomeMessage}\n\nSi quieres reemplazarlo, primero bórralo con:\n${prefix + command} 0`);
    }

    const texto = args.join(' ');
    chat.welcomeMessage = texto;

   await updateChat(msg.chat, 'welcomeMessage', chat.welcomeMessage)
    msg.reply(`✐ Nuevo mensaje de bienvenida configurado correctamente.`);
  }
};