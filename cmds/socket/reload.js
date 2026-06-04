import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import { startSubBot } from '../../cmds/socket/subbot.js';
import fs from 'fs';
import path from 'path';
import {jidDecode} from 'baileys';

export default {
  command: ['reload'],
  category: 'socket',
  run: async ({ msg, sock, args }) => {
    const rawId = sock.user?.id || ''
    const decoded = jidDecode(rawId)
    const cleanId = decoded?.user || rawId.split('@')[0]

    const sessionTypes = ['Subs']
    const basePath = 'Sessions'
    const sessionPath = sessionTypes
      .map((type) => path.join(basePath, type, cleanId))
      .find((p) => fs.existsSync(p))

    if (!sessionPath) {
      return msg.reply('《✧》 Este comando solo puede ser usado desde una instancia de Sub-Bot.')
    }

    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = await getSettings(botId) || {}

    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botType = isOficialBot
      ? 'Principal/Owner'
          : 'Sub Bot'

    const caption = `✤ *Sesión del bot reiniciada correctamente!*.`

    const phone = args[0] ? args[0].replace(/\D/g, '') : msg.sender.split('@')[0]
    const chatId = msg.chat

   // setTimeout(() => {
      if (botType === 'Sub Bot') {
        startSubBot(msg, sock, caption, false, phone, chatId, {}, true)
      } else {
      }
   // }, 3000)

    await sock.reply(msg.chat, caption, msg)
  },
};