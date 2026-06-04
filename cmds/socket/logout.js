import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import fs from 'fs';
import path from 'path';
import {jidDecode} from 'baileys';

export default {
  command: ['logout'],
  category: 'socket',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const rawId = sock.user?.id || ''
    const decoded = jidDecode(rawId)
    const cleanId = decoded?.user || rawId.split('@')[0]

    const sessionTypes = ['Subs']
    const basePath = 'Sessions'
    const sessionPath = sessionTypes
      .map((type) => path.join(basePath, type, cleanId))
      .find((p) => fs.existsSync(p))

    if (!sessionPath) {
      return msg.reply('✎ Este comando solo puede ser usado desde una instancia de Sub-Bot.')
    }

    try {
      await msg.reply('✐ Cerrando sesión del Socket...')
      await sock.logout()

      setTimeout(() => {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true })
        }
      }, 2000)

      setTimeout(() => {
      }, 3000)
    } catch (err) {
      await msg.reply(msgglobal)
    }
  },
};
