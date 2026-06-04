import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import cp from 'child_process'
import { promisify } from 'util'
const exec = promisify(cp.exec)

export default {
  command: ['r'],
  isOwner: true,
  run: async ({ msg, sock, args }) => {
    const cmd = args.join(' ').trim()
    if (!cmd) {
      return // sock.reply(msg.chat, '❌ Escribe un comando para ejecutar.\nEjemplo: .r ls', msg)
    }
    let result
    try {
      result = await exec(cmd)
    } catch (e) {
      result = e
    }
    const { stdout, stderr } = result
    if (stdout?.trim()) {
      sock.reply(msg.chat, stdout.trim(), msg)
    }
    if (stderr?.trim()) {
      sock.reply(msg.chat, stderr.trim(), msg)
    }
  }
}
