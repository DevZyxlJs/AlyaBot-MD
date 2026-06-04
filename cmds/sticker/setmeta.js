import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
export default {
  command: ['setstickermeta', 'setmeta'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    if (!args || args.length === 0) {
      return msg.reply('《✧》 Por favor, ingresa los metadatos que deseas asignar a tus stickers.');
    }
    try {
      const fullArgs = args.join(' ');
      const separatorIndex = fullArgs.search(/[|•\/]/);
      let metadatos01, metadatos02;
      if (separatorIndex === -1) {
        metadatos01 = fullArgs.trim();
        metadatos02 = '';
      } else {
        metadatos01 = fullArgs.slice(0, separatorIndex).trim();
        metadatos02 = fullArgs.slice(separatorIndex + 1).trim();
      }
      if (!metadatos01) {
        return msg.reply('《✧》 El nombre del pack no puede estar vacío.');
      }
      await updateUser(msg.sender, 'metadatos', metadatos01);
      await updateUser(msg.sender, 'metadatos2', metadatos02);
      await sock.sendMessage(msg.chat, { text: `✎ Los metadatos de tus stickers se han actualizado correctamente.` }, { quoted: msg });
    } catch (e) {
      await msg.reply(msgglobal);
    }
  },
};