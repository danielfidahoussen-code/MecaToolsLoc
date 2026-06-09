const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || __dirname;
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

module.exports = new JsonDB();
