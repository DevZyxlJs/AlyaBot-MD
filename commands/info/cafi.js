export default {
  command: ['cafi'],
  category: 'info',
  run: async (client, m) => {

    const caption = `☃️ *Cafirexos — Hosting*

.꒷🌳.𖦹˙ *Sitio Web:*  
https://cafirexos.com
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄
.꒷🎍.𖦹˙ *Área de Clientes:*  
https://cafirexos.com/clientarea.php
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄
.꒷🦦.𖦹˙ *Panel:*  
https://panel.cafirexos.com
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄
.꒷🌱.𖦹˙ *Estado de Servicios:*  
https://estado.cafirexos.com
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄
.꒷🌾.𖦹˙ *Canal de WhatsApp:*  
https://links.cafirexos.com/whatsapp/canal
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄
.꒷🦩.𖦹˙ *Soporte:*  
https://cafirexos.com/contactenos
 .  . ︵︵•✿•︵︵ .  ◌Ⳋ𝅄`;

        await client.sendContextInfoIndex(m.chat, caption, {}, m, true)

  }
};