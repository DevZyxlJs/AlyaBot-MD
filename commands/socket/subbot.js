import { startSubBot } from '../../lib/subs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let commandFlags = {}

export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m, args, command) => {
    let time = global.db.data.users[m.sender].Subs + 120000 || ''
    if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
      return client.reply(
        m.chat,
        `❖ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`,
        m,
      )
    }

    const subsPath = path.join(dirname, '../../Sessions/Subs')
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    const maxSubs = 20
    if (subsCount >= maxSubs) {
     return client.reply(
        m.chat,
        '✎ No se han encontrado espacios disponibles para registrar un `Sub-Bot`.',
        m,
      )
    }

    commandFlags[m.sender] = true

    const rtx = '`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*'

    const isCode = /^(code)$/.test(command)
    const isCommand = isCode ? true : false
    const caption = rtx
    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]

   // m.reply(phone)
    await startSubBot(m, client, caption, isCode, phone, m.chat, commandFlags, isCommand)
    global.db.data.users[m.sender].Subs = new Date() * 1
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes > 0 ? minutes : ''
  seconds = seconds < 10 && minutes > 0 ? '0' + seconds : seconds
  if (minutes) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
  } else {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  }
}

/*export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m, args, command) => {

   const rtx = '`✤` Vincula un *sub-bot* a tu *cuenta*\n\nꕤ Importante\n> ₊·( 🜸 ) ➭ El código generado desde la web solo funciona en el mismo número que lo solicitó. No se puede usar en otro número.\n\n> ✥ Para convertirse en *sub-bot*, haz la solicitud únicamente desde la web oficial:\n› *Web* :: ' + `${global.bot.web}\n› Solo desde ahí se acepta la solicitud.\n\n> ✥ También puedes cambiar las configuraciones del *sub-bot* desde esa misma web.`;

   await m.reply(rtx)
  },
};*/