const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  // Init schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      pseudo TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      entity_id INTEGER REFERENCES entities(id),
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'invite' CHECK(role IN ('invite','lecteur','admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      preamble TEXT NOT NULL,
      text TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      question_id INTEGER NOT NULL REFERENCES questions(id),
      answer TEXT CHECK(answer IN ('oui','non','sans_position')),
      comment TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, question_id)
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Seed entities
  const entities = ['Fédération FUTUR', 'CATE', 'Comwatt']
  for (const e of entities) {
    await pool.query('INSERT INTO entities (name) VALUES ($1) ON CONFLICT DO NOTHING', [e])
  }

  // Get FUTUR entity id
  const futurRow = await pool.query('SELECT id FROM entities WHERE name = $1', ['Fédération FUTUR'])
  const futurEntityId = futurRow.rows[0].id

  // Seed admin user
  const passwordHash = bcrypt.hashSync('future', 10)
  await pool.query(`
    INSERT INTO users (first_name, last_name, pseudo, email, entity_id, password_hash, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
  `, ['Greg', 'Lamotte', 'greg', 'greg@starvolt.fr', futurEntityId, passwordHash, 'admin'])

  // Seed questions
  const questions = [
    "Instaurer et garantir le droit pour chacun de consommer et produire l'électricité qu'il souhaite",
    "Faire de la transition énergétique renouvelable une priorité de votre quinquennat, pour améliorer la sécurité énergétique, lutter contre le dérèglement climatique, créer des emplois, et garantir un prix faible de l'électricité",
    "Organiser des campagnes audiovisuelles régulières pour inciter les Français à privilégier la consommation des énergies renouvelables",
    "Favoriser le développement du stockage, notamment par batteries, afin de rendre les renouvelables plus pilotables",
    "Favoriser les outils de pilotage de la production et de la consommation d'électricité, combinant panneaux, stockage, véhicule électrique, appareils électroménagers, etc.",
    "Favoriser le raccordement rapide au réseau de la production renouvelable, en réduisant les besoins de puissance de raccordement quand le projet inclut du stockage et en le priorisant dans l'agenda des gestionnaires de réseaux",
    "Favoriser la constitution de communautés d'énergie pour faciliter le partage de la ressource renouvelable au niveau local",
    "Simplifier et accélérer le cadre réglementaire des énergies renouvelables, en s'inspirant des meilleures pratiques des pays voisins, pour réduire les coûts, accélérer les projets, et donc faire baisser le prix de l'électricité",
    "Rendre plus facile et attractive l'autoconsommation individuelle",
    "Faciliter l'autoconsommation collective",
    "Favoriser la consommation d'électricité lors des pics de production grâce à l'extension et au renforcement des dispositifs tarifaires de type heures pleines / heures creuses",
    "Favoriser la mise en place par les collectivités territoriales de projets énergétiques combinant production, consommation, stockage entre sites publics et acteurs territoriaux",
    "Favoriser la production et la consommation d'énergie renouvelable par le parc HLM",
    "Favoriser le développement de l'agrivoltaïsme, combinant production agricole et renouvelable, notamment en sécurisant les dispositifs pour les agriculteurs et les projets",
    "Renforcer les compétences attribuées aux territoires en matière énergétique, appuyés par les organismes nationaux (ADEME, CEREMA…) pour la mise en œuvre",
    "Accélérer le développement des petits véhicules électriques accessibles à toutes les bourses",
    "Permettre l'utilisation du chèque énergie pour acquérir du matériel électroménager de basse consommation",
  ]

  for (let i = 0; i < questions.length; i++) {
    await pool.query(
      'INSERT INTO questions (section, preamble, text, position) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['Pour un droit effectif à choisir son énergie', 'Vous engagez-vous à…', questions[i], i + 1]
    )
  }

  console.log('✓ Seed terminé — admin greg@starvolt.fr / future')
  await pool.end()
}

main().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
