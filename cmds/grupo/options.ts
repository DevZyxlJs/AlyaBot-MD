export default {
  command: [
    'welcome', 'bienvenidas',
    'alerts', 'alertas', 'antistatus', 'antiestados',
    'nsfw',
    'antilink', 'antienlaces', 'antilinks',
    'rpg', 'economy', 'bye', 'despedidas', 'economia',
    'gacha',
    'adminonly', 'goodbye', 'onlyadmin'
  ],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, command, text, prefix) => {
    const chatData = await getChat(m.chat)
    const stateArg = args[0]?.toLowerCase()
    const validStates = ['on', 'off', 'enable', 'disable']

    const mapTerms = {
      antilinks: 'antilinks',
      antienlaces: 'antilinks',
      antistatus: 'antistatus',
      antiestados: 'antistatus',
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
      gacha: 'gacha'
    }

    const featureNames = {
      antilinks: 'el *AntiEnlace*',
      antistatus: 'el *AntiEstado*',
      welcome: 'el mensaje de *Bienvenida*',
      goodbye: 'el mensaje de *Despedida*',
      alerts: 'las *Alertas*',
      rpg: 'los comandos de *Economía*',
      gacha: 'los comandos de *Gacha*',
      adminonly: 'el modo *Solo Admin*',
      nsfw: 'los comandos *NSFW*'
    }

    const featureTitles = {
      antilinks: 'AntiEnlace',
      antistatus: 'AntiEstado',
      welcome: 'Bienvenida',
      goodbye: 'Despedida',
      alerts: 'Alertas',
      rpg: 'Economía',
      gacha: 'Gacha',
      adminonly: 'AdminOnly',
      nsfw: 'NSFW'
    }

    const normalizedKey = mapTerms[command] || command
    const current = chatData[normalizedKey] === 1
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

    if (chatData[normalizedKey] === (enabled ? 1 : 0)) {
      return m.reply(`《✤》 *${titulo}* ya estaba *${enabled ? 'activado' : 'desactivado'}*.`)
    }

    await updateChat(m.chat, normalizedKey, enabled ? 1 : 0)

    return m.reply(`✎ Has *${enabled ? 'activado' : 'desactivado'}* ${nombreBonito}.`)
  }
};
