import chalk from 'chalk'

const limpiarPersonajesReservados = () => {
  try {
    const chats = global.db.data.chats
    const now = Date.now()
    for (const chatId of Object.keys(chats)) {
      const chat = chats[chatId]
      if (!chat.personajesReservados || !Array.isArray(chat.personajesReservados)) {
       // chat.personajesReservados = []
        continue
      }      
      const nuevosPersonajesReservados = chat.personajesReservados.filter(personaje => {
        const expirado = personaje.expiresAt && now > personaje.expiresAt
        const yaReclamado = chat.users && Object.values(chat.users).some(u => u.characters && u.characters.some(c => c.name === personaje.name))        
        return !expirado && !yaReclamado
      })      
      if (chat.personajesReservados.length !== nuevosPersonajesReservados.length) {
        chat.personajesReservados = nuevosPersonajesReservados
      }
    }
  } catch (e) {
    console.log(chalk.gray('Error limpiando personajesReservados'))
  }
}

setInterval(limpiarPersonajesReservados, 1800000)
limpiarPersonajesReservados()