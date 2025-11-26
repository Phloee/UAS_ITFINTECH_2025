const fs = require('fs').promises;
const path = require('path');

class JSONDatabase {
  constructor(dataDir = path.join(__dirname, '../data')) {
    this.dataDir = dataDir;
  }

  async ensureDir() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async read(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async write(filename, data) {
    await this.ensureDir();
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async findById(filename, id) {
    const data = await this.read(filename);
    return data.find(item => item.id === id);
  }

  async findOne(filename, query) {
    const data = await this.read(filename);
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async findAll(filename, query = {}) {
    const data = await this.read(filename);
    if (Object.keys(query).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async insert(filename, item) {
    const data = await this.read(filename);
    item.id = this.generateId();
    item.createdAt = new Date().toISOString();
    data.push(item);
    await this.write(filename, data);
    return item;
  }

  async update(filename, id, updates) {
    const data = await this.read(filename);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    await this.write(filename, data);
    return data[index];
  }

  async delete(filename, id) {
    const data = await this.read(filename);
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) {
      throw new Error('Item not found');
    }
    await this.write(filename, filtered);
    return true;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = new JSONDatabase();
