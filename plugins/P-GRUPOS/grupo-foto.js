import { downloadContentFromMessage, jidNormalizedUser } from '@whiskeysockets/baileys'
import { Jimp } from 'jimp'

const S_WHATSAPP_NET = 's.whatsapp.net'

const handler = async (m, { conn }) => {
  const msg = m.quoted || m
  const mtype = msg.mtype

  if (!msg || mtype !== 'imageMessage') {
    return m.reply(`*⌬┤ ⚠️ ├⌬ IMAGEN REQUERIDA.*\n> Respondé una imagen para usarla como foto del grupo.`)
  }

  try {
    const imageMsg = msg.message?.imageMessage || msg.message?.[mtype]
    const stream = await downloadContentFromMessage(imageMsg, 'image')

    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    const img = await Jimp.read(buffer)

    const size = Math.min(img.bitmap.width, img.bitmap.height)

    img.crop({
      x: (img.bitmap.width - size) / 2,
      y: (img.bitmap.height - size) / 2,
      w: size,
      h: size
    })

    img.resize({ w: 640, h: 640 })
    img.quality(90)

    const finalBuffer = await img.getBuffer('image/jpeg')

    const targetJid = jidNormalizedUser(m.chat)

    await conn.query({
      tag: 'iq',
      attrs: {
        to: S_WHATSAPP_NET,
        type: 'set',
        xmlns: 'w:profile:picture',
        target: targetJid
      },
      content: [{
        tag: 'picture',
        attrs: { type: 'image' },
        content: finalBuffer
      }]
    })

    m.reply(`*⌬┤ ✅ ├⌬ FOTO ACTUALIZADA.*\n▢ La foto del grupo fue cambiada.`)
  } catch (e) {
    console.error(e)
    m.reply(`*⌬┤ ❌ ├⌬ ERROR.*\n> ${e.message}`)
  }
}

handler.help = ['fotog']
handler.tags = ['group']
handler.command = ['fotog', 'setfoto', 'groupfoto']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
