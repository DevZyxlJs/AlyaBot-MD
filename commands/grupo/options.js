export default {
  command: [
    'welcome', 'bienvenidas',
    'alerts', 'alertas',
    'nsfw',
    'antilink', 'antienlaces', 'antilinks',
    'rpg', 'economy', 'bye', 'despedidas', 'economia',
    'gacha',
    'adminonly', 'goodbye', 'onlyadmin', 'pokes'
  ],
  category: 'grupo',
  isAdmin: true,
    run: async (client, m, args, command, text, prefix) => {
    const chatData = global.db.data.chats[m.chat]
    const stateArg = args[0]?.toLowerCase()
    const validStates = ['on', 'off', 'enable', 'disable']

    const mapTerms = {
      antilinks: 'antilinks',
      antienlaces: 'antilinks',
      antilink: 'antilinks',
      welcome: 'welcome',
      goodbye: 'goodbye',
      despedidas: 'goodbye',
      bye: 'goodbye',
      bienvenidas: 'welcome',
      alerts: 'alerts',
      alertas: 'alerts',
      economy: 'rpg',
      rpg: 'rpg',
      economia: 'rpg',
      adminonly: 'adminonly',
      onlyadmin: 'adminonly',
      nsfw: 'nsfw',
      gacha: 'gacha',
      pokes: 'pokes'
    }

    const featureNames = {
      antilinks: 'el *AntiEnlace*',
      welcome: 'el mensaje de *Bienvenida*',
      goodbye: 'el mensaje de *Despedida*',
      alerts: 'las *Alertas*',
      rpg: 'los comandos de *Economía*',
      gacha: 'los comandos de *Gacha*',
      adminonly: 'el modo *Solo Admin*',
      nsfw: 'los comandos *NSFW*',
      pokes: 'los comandos *Pokemones*'
    }

    const featureTitles = {
      antilinks: 'AntiEnlace',
      welcome: 'Bienvenida',
      goodbye: 'Despedida',
      alerts: 'Alertas',
      rpg: 'Economía',
      gacha: 'Gacha',
      adminonly: 'AdminOnly',
      nsfw: 'NSFW',
      pokes: 'Pokemones'
    }

    const normalizedKey = mapTerms[command] || command
    const current = chatData[normalizedKey] === true
    const estado = current ? '✓ Activado' : '✗ Desactivado'
    const nombreBonito = featureNames[normalizedKey] || `la función *${normalizedKey}*`
    const titulo = featureTitles[normalizedKey] || normalizedKey

    if (!stateArg) {
      return client.reply(
        m.chat,
        `*✩ ${titulo} (✿❛◡❛)*\n` +
        `❒ *Estado ›* ${estado}\n\n` +
        `ꕥ Un administrador puede activar o desactivar ${nombreBonito} utilizando:\n\n` +
        `> ● _Habilitar ›_ *${prefix + normalizedKey} enable*\n` +
        `> ● _Deshabilitar ›_ *${prefix + normalizedKey} disable*\n\n${dev}`,
        m
      )
    }

    if (!validStates.includes(stateArg)) {
      return m.reply(
        `《✤》 Estado no válido. Usa *on*, *off*, *enable* o *disable*\n\nEjemplo:\n${prefix}${normalizedKey} enable`
      )
    }

    const enabled = ['on', 'enable'].includes(stateArg)

    if (chatData[normalizedKey] === enabled) {
      return m.reply(`《✤》 *${titulo}* ya estaba *${enabled ? 'activado' : 'desactivado'}*.`)
    }

    chatData[normalizedKey] = enabled
    return m.reply(`✎ Has *${enabled ? 'activado' : 'desactivado'}* ${nombreBonito}.`)
  }
};