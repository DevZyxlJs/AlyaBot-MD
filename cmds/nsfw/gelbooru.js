import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fetch from 'node-fetch';

export default {
  command: ['gelbooru', 'gbooru'],
  category: 'nsfw',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat;
    const chat = await getChat(msg.chat);

    if (!chat.nsfw)
      return msg.reply(mess.nsfw);

    if (!args[0]) return msg.reply('✿ Por favor, ingresa un *tag* para realizar la búsqueda.');

   // await msg.reply(mess.wait);

    const tag = args[0];
    const url = `${api.url}/nsfw/gelbooru?keyword=${tag}&key=${api.key}`;

    try {
      const res = await fetch(url);
      const buffer = await res.buffer();

      await sock.sendMessage(
        chatId,
        {
          image: buffer
        },
        { quoted: msg },
      );
    } catch (err) {
      console.error('[Gelbooru Error]', err);
      return msg.reply(msgglobal);
    }
  },
};