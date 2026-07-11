import axios from 'axios';

module.exports = {
  command: ['imdb'],
  category: 'search',
  isSocket: true,
  run: async ({ msg, sock }) => {
    const args = msg.text.split(' ').slice(1);
    if (args.length < 1) {
      return sock.reply(msg.chat, 
        `✎ Ingresa el nombre de la *pelicula*.`, 
        msg);
    }

    const pelicula = args.join(' ');

    try {
      const searchRes = await axios.get(
        `https://www.omdbapi.com/?apikey=7035c60c&s=${encodeURIComponent(pelicula)}&type=movie`
      );

      if (searchRes.data.Response === 'False') {
        return sock.reply(msg.chat, 
          `✿ No se encontró "${pelicula}" en IMDb.`, 
          msg);
      }

      const movie = searchRes.data.Search[0];
      const detailRes = await axios.get(
        `https://www.omdbapi.com/?apikey=7035c60c&i=${movie.imdbID}&plot=full`
      );
      const d = detailRes.data;

      const streamURL = `https://streamimdb.ru/embed/movie/${d.imdbID}`;

      const ratingsText = d.Ratings?.length > 0
        ? d.Ratings.map(r => `▸ ${r.Source}: ${r.Value}`).join('\n')
        : '▸ No disponible';

      const mensaje =
        `【　✿　】 _\`୨୧  Titulo\` ───── *${d.Title}* (${d.Year})_

> _✰ \`CALIFICACIONES\`_
${ratingsText}

> _🜸 \`Género\` ── *${d.Genre}*_
> _ⴵ \`Duración\` ── *${d.Runtime}*_
> _✐ \`Calificación\` ── *${d.Rated}*_
> _☄︎ \`Estreno\` ── *${d.Released}*_
> _❀ \`Pais\` ── *${d.Country}*_
> _ꕤ \`Idiomas\` ── *${d.Language}*_
> _ꕥ \`Director\` ── *${d.Director}*_
> _✌︎ \`Guion\` ── *${d.Writer}*_
> _✎ \`Actores\` ── *${d.Actors}*_
> _✐ \`Premios\` ── *${d.Awards}*_
> _⚡︎ \`Taquilla\` ── *${d.BoxOffice ?? 'N/A'}*_

> _❒ \`SINOPSIS\`_
${d.Plot} 

> _✿ \`IMDB\` ── https://www.imdb.com/title/${d.imdbID}_
> _✿ \`VIDEO\` ── ${streamURL}_
> _✿ \`ID\` ── *${d.imdbID}*_

${dev}`;

      if (d.Poster && d.Poster !== 'N/A') {
        await sock.sendMessage(msg.chat, {
          image: { url: d.Poster },
          caption: mensaje
        }, { quoted: msg });
      } else {
        await sock.reply(msg.chat, mensaje, msg);
      }

    } catch (error) {
      sock.reply(msg.chat, msgglobal, msg);
    }
  }
};