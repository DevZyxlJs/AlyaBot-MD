import { getUser, updateUser, getChat, updateChat, getChatUser, updateChatUser, getSettings, updateSettings, getStickersPack, updateStickersPack, deletedb, setCreate } from "#database"
import syntaxerror from 'syntax-error'
import { format } from 'util'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__dirname)

export default {
  command: ['eval', 'e'],
  isOwner: true,
  run: async ({ msg, sock, args, command, text }) => {

    let code = text
    let _return
    let _syntax = ''
    if (command === 'e' || command === 'eval') {
      code = 'return ' + code
    }

    try {
      let f = { exports: {} }
      let exec = new (async () => { }).constructor(
        'sock',
        'msg',
        'require',
        'args',
        'module',
        'exports',
        code
      )

      _return = await exec.call(
        sock,
        sock,
        msg,
        require,
        args,
        f,
        f.exports
      )

    } catch (e) {
      let err = syntaxerror(code, 'Eval Error', {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        sourceType: 'module'
      })

      if (err) {
        _syntax = '```' + err + '```\n\n'
      }

      _return = e
    }
    return sock.reply(
      msg.chat,
      _syntax + format(_return),
      msg
    )
  }
}