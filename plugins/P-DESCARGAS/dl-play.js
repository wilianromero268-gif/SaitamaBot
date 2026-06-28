import axios from 'axios'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) {
return m.reply(
`*『 ✙ 』USO.*\n> Ingresa el nombre de una canción o video.\n\n> *Ejemplo:* ${usedPrefix}play Twice`
)
}

try {
await m.reply('🔍 Buscando información...')

const { data } = await axios.get(
  `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(text)}`
)

if (!data?.status || !data?.data?.length) {
  throw new Error('No se encontraron resultados')
}

const video = data.data[0]

const infoText =
  `*『 🎬 』YOUTUBE SEARCH*\n\n` +
  `> *Título:* ${video.title}\n` +
  `> *Autor:* ${video.author?.name || 'Desconocido'}\n` +
  `> *Duración:* ${video.duration}\n` +
  `> *Vistas:* ${video.views}\n` +
  `> *Publicado:* ${video.publishedAt}\n\n` +
  `> *Elige un formato:*`

const buttons = [
  {
    text: 'Elegir formato ⚙️',
    sections: [
      {
        title: '✧ Descargas ✧',
        rows: [
          {
            title: '🎧 Audio MP3',
            description: 'Descargar audio',
            id: `${usedPrefix}ytmp3 ${video.videoId}`
          },
          {
            title: '📁 Audio Documento',
            description: 'Descargar audio como documento',
            id: `${usedPrefix}ytmp3doc ${video.videoId}`
          },
          {
            title: '🎥 Video MP4',
            description: 'Descargar video',
            id: `${usedPrefix}ytmp4 ${video.url}`
          },
          {
            title: '📂 Video Documento',
            description: 'Descargar video como documento',
            id: `${usedPrefix}ytmp4doc ${video.url}`
          }
        ]
      }
    ]
  }
]

await conn.sendMessage(
  m.chat,
  {
    image: { url: video.thumbnail || video.image },
    caption: infoText,
    footer: global.botname || config.botName,
    buttons
  },
  { quoted: m }
)

} catch (e) {
console.error(e)

m.reply(
  '*『 ✙ 』ERROR.*\n> No se pudo obtener la información del video.'
)

}
}

handler.help = ['play <texto>']
handler.tags = ['descargas']
handler.command = ['play', 'play2', 'play3']

export default handler