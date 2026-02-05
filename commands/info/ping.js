import moment from "moment";

export default {
  command: ["ping", "p"],
  category: "info",
  run: async (client, m, args, { prefix }) => {
    const start = Date.now();
    const txct = "ꕥ Cargando ping…"
    const tempMsg = await client.sendMessage(
      m.key.remoteJid,
      { text: txct },
      { quoted: m },
    );
    const latency = Date.now() - start;

    const up = process.uptime(),
      h = Math.floor(up / 3600),
      min = Math.floor((up % 3600) / 60),
      s = Math.floor(up % 60);
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const userTag = m.pushName || "Invitado";
    const sender = m.sender.replace(/@.+/, "");

    const msg = `
﹒⌗﹒ꕤ .˚₊‧  Hola, ${userTag}.

\`𓍯  .→﹒ Ping Status .  ◌Ⳋ𝅄\`

✿ \`Ping:\` ${latency} ms
✧ \`Uptime:\` [ ${h}h ${min}m ${s}s ]
✤ \`RAM usada:\` ${ram} MB
✾ \`Usuario ID:\` @${sender}`.trim(); 

    await client.sendMessage(
      m.key.remoteJid,
      { text: msg, mentions: [m.sender] },
      { quoted: tempMsg },
    );
  },
};