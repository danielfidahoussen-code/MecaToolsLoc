const fs = require('fs');
const path = require('path');

// Sur Railway, on utilise /app/data (volume persistant)
// En local, on utilise le dossier server/
const DATA_DIR = process.env.DATA_DIR
  || (process.env.RAILWAY_ENVIRONMENT ? '/app/data' : __dirname);
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'data.json');
console.log('[DB] Using data file:', DB_PATH);

function load() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {}
  return {};
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Dossier de sauvegardes rotatives dans le volume
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 14;

// Crée une sauvegarde horodatée et purge les plus anciennes.
// stamp doit être fourni par l'appelant (Date.now() interdit ici).
function makeBackup(stamp) {
  try {
    if (!fs.existsSync(DB_PATH)) return null;
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dest = path.join(BACKUP_DIR, `data-${stamp}.json`);
    fs.copyFileSync(DB_PATH, dest);
    // Purge : ne garder que les MAX_BACKUPS plus récentes
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('data-') && f.endsWith('.json'))
      .sort();
    while (files.length > MAX_BACKUPS) {
      const old = files.shift();
      try { fs.unlinkSync(path.join(BACKUP_DIR, old)); } catch {}
    }
    return dest;
  } catch (err) {
    console.error('[DB] Backup error:', err.message);
    return null;
  }
}

function getDbPath() { return DB_PATH; }

class Table {
  constructor(store, name) {
    this.store = store;
    this.name = name;
    if (!store.data[name]) { store.data[name] = []; save(store.data); }
  }

  _rows() { return this.store.data[this.name]; }

  _next_id() {
    const rows = this._rows();
    return rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  }

  insert(obj) {
    const rows = this._rows();
    const id = this._next_id();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const row = { id, ...obj, created_at: obj.created_at || now, updated_at: now };
    rows.push(row);
    save(this.store.data);
    return { lastInsertRowid: id };
  }

  update(id, obj) {
    const rows = this._rows();
    const i = rows.findIndex(r => r.id === id);
    if (i !== -1) {
      rows[i] = { ...rows[i], ...obj, updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19) };
      save(this.store.data);
    }
    return { changes: i !== -1 ? 1 : 0 };
  }

  delete(id) {
    const rows = this._rows();
    const i = rows.findIndex(r => r.id === id);
    if (i !== -1) rows.splice(i, 1);
    save(this.store.data);
    return { changes: i !== -1 ? 1 : 0 };
  }

  getById(id) { return this._rows().find(r => r.id === Number(id)) || null; }

  all(filterFn) {
    const rows = this._rows();
    return filterFn ? rows.filter(filterFn) : [...rows];
  }

  count(filterFn) { return this.all(filterFn).length; }
}

class JsonDB {
  constructor() {
    this.data = load();
  }

  table(name) { return new Table(this, name); }
}

const db = new JsonDB();
db.makeBackup = makeBackup;
db.getDbPath = getDbPath;

module.exports = db;
