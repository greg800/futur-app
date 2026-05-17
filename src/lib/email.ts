import nodemailer from 'nodemailer'

function getTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM = process.env.SMTP_FROM || 'noreply@f-futur.fr'

export async function sendMail(to: string, subject: string, html: string) {
  const transport = getTransport()

  if (!transport) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[EMAIL] HTML:\n${html.replace(/<[^>]+>/g, '')}`)
    return
  }

  await transport.sendMail({ from: FROM, to, subject, html })
}

export function forgotPasswordEmail(link: string) {
  return {
    subject: 'Réinitialisation de votre mot de passe — FUTUR',
    html: `
<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <span style="font-size:28px;font-weight:800;color:#2D6A4F">FUTUR</span>
  </div>
  <h2 style="font-size:22px;font-weight:700;margin-bottom:12px">Mot de passe oublié ?</h2>
  <p style="color:#5A7060;margin-bottom:24px">
    Pas de panique, ça arrive aux meilleurs. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    Ce lien est valable 1 heure.
  </p>
  <a href="${link}" style="display:inline-block;background:#2D6A4F;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">
    Réinitialiser mon mot de passe →
  </a>
  <p style="color:#5A7060;font-size:13px;margin-top:32px">
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
    Votre mot de passe reste inchangé.
  </p>
</div>
    `,
  }
}

export function completionEmail(firstName: string) {
  const jokes = [
    "Vous avez répondu à 17 questions sur les ENR. Félicitations, vous êtes officiellement plus investi(e) que 90% des élus français. 🌱",
    "Mission accomplie ! Vos réponses ont été enregistrées avec le soin d'un panneau solaire bien orienté plein sud. ☀️",
    "17 questions, 0 abandon. Vous avez la ténacité d'une éolienne par grand vent. 💨",
    "Formulaire complété ! La transition énergétique est entre de bonnes mains. Enfin... surtout entre les vôtres. 🔋",
  ]
  const joke = jokes[Math.floor(Math.random() * jokes.length)]

  return {
    subject: '✅ Vos réponses ont été enregistrées — Merci !',
    html: `
<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <span style="font-size:28px;font-weight:800;color:#2D6A4F">FUTUR</span>
  </div>
  <h2 style="font-size:22px;font-weight:700;margin-bottom:12px">Merci ${firstName} ! 🎉</h2>
  <p style="color:#5A7060;margin-bottom:20px">
    Vos réponses au questionnaire sur les énergies renouvelables ont bien été enregistrées.
  </p>
  <div style="background:#D8F3DC;border-radius:12px;padding:20px 24px;margin-bottom:24px;color:#1B4332;font-style:italic">
    ${joke}
  </div>
  <p style="color:#5A7060;margin-bottom:24px">
    La Fédération FUTUR vous remercie pour votre participation. Vos réponses contribuent à dresser un panorama clair
    des positions politiques sur la transition énergétique renouvelable.
  </p>
  <p style="color:#5A7060;font-size:13px">
    Vous pouvez modifier vos réponses à tout moment en vous reconnectant.<br>
    — L'équipe Fédération FUTUR
  </p>
</div>
    `,
  }
}
