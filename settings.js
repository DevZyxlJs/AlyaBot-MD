import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['5492916450307', '593939005387']
global.sessionName = 'Sessions/Owner'

// # NOTA: Debes registrarte en la API de Stellar y colocar tu API Key en global.api.key. Si quieres evitar que se agoten rápidamente tus solicitudes, puedes adquirir la versión Premium.
global.api = {
  url: 'https://api.stellarwa.xyz',
  key: '' // Saca tu apikey aquí: https://api.stellarwa.xyz
}

global.mods = [
  '5492916450307', // Creador
  '51910471065', // Llilmer
  '5216671548329', // Legna
  '573196588149', // Destroy
  '593939005387', // Jostin
  '5492324347631', // Akane
  '5492916439595', // Sebastian
  '5511998790420' // Tokito
]

global.msgglobal = '✿⸝꙳.˖ Ocurrió un problema, contacte al creador'
global.dev = `ʙᴜɪʟᴛ ᴀɴᴅ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪ'ᴍ ᴅɪᴇɢᴏ ッ`

global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  nsfw: '(•ૢ⚈͒⌄⚈͒•ૢ) Los comandos de *NSFW* están desactivados en este grupo.',
  comandooff: 'ღゝ◡╹ )ノ Estos comandos estan desactivados en este grupo.'
}

global.my = {
ch: "120363420992828502@newsletter", 
name: "Stellar",
ch2: "120363405689107729@newsletter", 
name2: "Api",
ch3: "120363401404146384@newsletter",
name3: "Yuki"
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})