const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join(__dirname, '..', 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'futur.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    pseudo TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    entity_id INTEGER REFERENCES entities(id),
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'invite' CHECK(role IN ('invite','lecteur','admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    preamble TEXT NOT NULL,
    text TEXT NOT NULL,
    position INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    question_id INTEGER NOT NULL REFERENCES questions(id),
    answer TEXT CHECK(answer IN ('oui','non','sans_position')),
    comment TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, question_id)
  );
`)

const entities = ['Fédération FUTUR', 'CATE', 'Comwatt']
const insertEntity = db.prepare('INSERT OR IGNORE INTO entities (name) VALUES (?)')
entities.forEach(e => insertEntity.run(e))

const futurEntity = db.prepare('SELECT id FROM entities WHERE name = ?').get('Fédération FUTUR')

const passwordHash = bcrypt.hashSync('future', 10)
db.prepare(`
  INSERT OR IGNORE INTO users (first_name, last_name, pseudo, email, entity_id, password_hash, role)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run('Greg', 'Lamotte', 'greg', 'greg@starvolt.fr', futurEntity.id, passwordHash, 'admin')

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

const insertQ = db.prepare('INSERT OR IGNORE INTO questions (section, preamble, text, position) VALUES (?, ?, ?, ?)')
questions.forEach((text, i) => {
  insertQ.run('Pour un droit effectif à choisir son énergie', 'Vous engagez-vous à…', text, i + 1)
})

console.log('✓ Seed terminé — admin greg@starvolt.fr / futur2024')
db.close()
