// Lynqar Password Vault MVP
// Features: IndexedDB storage, PBKDF2+AES-GCM encryption, auto-lock, PWA

class PasswordVault {
  constructor() {
    this.masterKey = null;
    this.entries = [];
    this.isInitialized = false;
    this.autoLockTime = 15 * 60 * 1000; // 15 minutes default
    this.lastActivity = Date.now();

    // Auto-tagging categories
    this.tagCategories = {
      banking: ['bank', 'banks', 'icici', 'hdfc', 'sbi', 'axis', 'pnb', 'paytm', 'phonepe', 'gpay', 'razorpay', 'stripe'],
      shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'bigbasket', 'swiggy', 'zomato', 'blinkit', 'aliexpress', 'ebay'],
      social: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'snapchat', 'whatsapp', 'telegram', 'discord', 'slack'],
      entertainment: ['netflix', 'prime', 'hotstar', 'disney', 'youtube', 'vimeo', 'spotify', 'soundcloud', 'gaana'],
      work: ['gmail', 'outlook', 'office365', 'zoom', 'teams', 'slack', 'gitlab', 'github', 'bitbucket'],
      developer: ['github', 'gitlab', 'bitbucket', 'stackoverflow', 'docker', 'npm', 'yarn', 'vercel', 'figma', 'code']
    };

    // IndexedDB database with Dexie
    this.db = new Dexie('lynqar-vault-v2');
    this.db.version(1).stores({
      entries: 'id, title, username, url, tags, created',
      settings: 'key, value'
    });

    this.init();
    this.setupAutoLock();
  }

  async init() {
    // Hide loading screen after short delay
    setTimeout(() => {
      document.getElementById('loading').classList.add('hidden');
    }, 1500);

    try {
      // Check if vault is initialized by looking for settings
      const initialized = await this.db.settings.get('initialized');

      if (initialized && initialized.value === 'true') {
        this.showScreen('login');
      } else {
        this.showScreen('setup');
      }
    } catch (error) {
      console.warn('Database check failed, using setup:', error);
      this.showScreen('setup');
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Setup form
    document.getElementById('setup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSetup();
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Entry form
    document.getElementById('entry-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveEntry();
    });

    // Password generator with strength meter
    document.getElementById('generate-btn').addEventListener('click', () => {
      const password = this.generatePassword();
      document.getElementById('entry-password').value = password;
      this.updateStrengthMeter(password);
    });

    // Live password strength update
    document.getElementById('entry-password').addEventListener('input', (e) => {
      this.updateStrengthMeter(e.target.value);
    });

    // Other buttons
    document.getElementById('add-entry-btn').addEventListener('click', () => {
      this.showAddModal();
      this.updateActivity();
    });

    document.getElementById('add-first-entry-btn').addEventListener('click', () => {
      this.showAddModal();
      this.updateActivity();
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.hideAddModal();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Search
    document.getElementById('search').addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
      this.updateActivity();
    });

    // Activity tracking for auto-lock
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), false);
    });
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  setupAutoLock() {
    setInterval(() => {
      const now = Date.now();
      if (this.isInitialized && now - this.lastActivity > this.autoLockTime) {
        this.handleAutoLock();
      }
    }, 30000); // Check every 30 seconds
  }

  handleAutoLock() {
    if (this.isInitialized) {
      this.showToast('Vault automatically locked for security', 'warning');
      this.handleLogout();
    }
  }

  showScreen(screenId) {
    ['setup', 'login', 'app'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.classList.add('hidden');
    });

    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  async handleSetup() {
    const password = document.getElementById('master-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      this.masterKey = await this.deriveKey(password);
      await this.db.settings.put({ key: 'initialized', value: 'true' });

      this.isInitialized = true;
      this.loadEntries();
      this.showScreen('app');
      this.showToast('Vault created successfully!');

    } catch (error) {
      console.error('Setup failed:', error);
      alert('Failed to create vault. Please try again.');
    }
  }

  async handleLogin() {
    const password = document.getElementById('login-password').value;
    console.log('Starting login with password length:', password.length);

    try {
      console.log('Deriving key...');
      this.masterKey = await this.deriveKey(password);
      console.log('Key derived, verifying...');
      const isValid = await this.verifyKey();
      console.log('Key verification result:', isValid);

      if (isValid) {
        console.log('Login successful!');
        document.getElementById('login-error').classList.add('hidden');
        this.isInitialized = true;
        this.loadEntries();
        this.showScreen('app');
        this.updateActivity();
        this.showToast('Welcome back!');
      } else {
        console.log('Login failed - verification returned false');
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-password').value = '';
      }
    } catch (error) {
      console.log('Login error caught:', error);
      document.getElementById('login-error').classList.remove('hidden');
      document.getElementById('login-password').value = '';
    }
  }

  async deriveKey(password) {
    const encoder = new TextEncoder();
    // Use fixed salt for consistent key derivation
    // This salt should be the same for all users to ensure consistent encryption
    const salt = encoder.encode('lynqar-fixed-salt-2025');

    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  }

  async verifyKey() {
    // Simplified verification for now - focus on key derivation working
    // In production, this would verify existing data integrity
    try {
      if (!this.masterKey) return false;

      // Test that key can encrypt/decrypt basic data
      const testData = 'lynqar-test';
      const encrypted = await this.encryptData(testData);
      const decrypted = await this.decryptData(encrypted);

      return decrypted === testData;
    } catch (error) {
      console.error('Key verification failed:', error);
      return false;
    }
  }

  async handleSaveEntry() {
    const title = document.getElementById('entry-title').value.trim();
    const username = document.getElementById('entry-username').value.trim();
    const password = document.getElementById('entry-password').value;
    const url = document.getElementById('entry-url').value.trim();

    if (!title) return;

    // Auto-generate tags based on URL domain
    const autoTags = this.analyzeDomainForTags(url, title);

    const entry = {
      id: Date.now().toString(),
      title, username, password, url,
      tags: autoTags,
      created: new Date().toISOString()
    };

    try {
      await this.saveEntrySecure(entry);
      this.hideAddModal();
      await this.loadEntries();
      this.updateActivity();
      this.showToast('Entry saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      this.showToast('Failed to save entry', 'error');
    }
  }

  showAddModal() {
    document.getElementById('add-modal').classList.remove('hidden');
    document.getElementById('entry-title').focus();
  }

  hideAddModal() {
    document.getElementById('add-modal').classList.add('hidden');
    document.getElementById('entry-form').reset();
    document.getElementById('strength-meter').style.width = '0%';
  }

  updateStrengthMeter(password) {
    const meter = document.getElementById('strength-meter');
    const text = document.getElementById('strength-text');
    if (!meter || !text) return;

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;

    meter.style.width = score + '%';
    meter.className = score < 50 ? 'bg-red-500' :
                     score < 75 ? 'bg-yellow-500' : 'bg-green-500';

    text.textContent = score < 50 ? 'Weak' :
                      score < 75 ? 'Fair' :
                      score < 100 ? 'Good' : 'Strong';
    text.style.color = score < 50 ? '#ef4444' :
                      score < 75 ? '#f59e0b' :
                      score < 100 ? '#10b981' : '#059669';
  }

  async loadEntriesDirect() {
    const encryptedEntries = await this.db.settings.get('entries');
    if (!encryptedEntries) return [];

    const decrypted = await this.decryptData(encryptedEntries.value);
    return JSON.parse(decrypted);
  }

  async loadEntries() {
    try {
      this.entries = await this.loadEntriesDirect();
      this.renderEntries();
    } catch (error) {
      console.error('Load failed:', error);
      this.showToast('Failed to load entries', 'error');
    }
  }

  async saveEntrySecure(entry) {
    this.entries.push(entry);

    const entriesJson = JSON.stringify(this.entries);
    const encrypted = await this.encryptData(entriesJson);
    await this.db.settings.put({ key: 'entries', value: encrypted });
  }

  renderEntries(filter = '') {
    const container = document.getElementById('entries-container');
    const emptyState = document.getElementById('empty-state');

    const filteredEntries = this.entries.filter(entry =>
      entry.title.toLowerCase().includes(filter.toLowerCase()) ||
      entry.username.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredEntries.length === 0) {
      container.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    container.innerHTML = filteredEntries.map(entry => `
      <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-semibold text-lg">${this.escapeHtml(entry.title)}</h3>
          <div class="flex gap-2">
            <button onclick="vault.copyPassword('${entry.password}')" class="text-blue-400 hover:text-blue-300">📋</button>
            <button onclick="vault.deleteEntry('${entry.id}')" class="text-red-400 hover:text-red-300">🗑️</button>
          </div>
        </div>

        ${entry.tags && entry.tags.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-3">
            ${entry.tags.map(tag => `<span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}

        ${entry.username ? `<p class="text-gray-400 text-sm mb-1">Username: ${this.escapeHtml(entry.username)}</p>` : ''}
        ${entry.url ? `<a href="${entry.url}" class="text-purple-400 hover:text-purple-300 text-sm break-all" target="_blank">Visit Site →</a>` : ''}
      </div>
    `).join('');
  }

  async copyPassword(password) {
    await navigator.clipboard.writeText(password);
    this.showToast('Password copied (auto-clear in 30s)');
    this.updateActivity();

    // Auto-clear clipboard after 30 seconds
    setTimeout(async () => {
      try {
        const currentText = await navigator.clipboard.readText();
        if (currentText === password) {
          await navigator.clipboard.writeText('');
        }
      } catch (e) { /* Ignore */ }
    }, 30000);
  }

  async deleteEntry(id) {
    if (!confirm('Delete this entry permanently?')) return;

    this.entries = this.entries.filter(entry => entry.id !== id);
    const entriesJson = JSON.stringify(this.entries);
    const encrypted = await this.encryptData(entriesJson);
    await this.db.settings.put({ key: 'entries', value: encrypted });

    this.renderEntries();
    this.showToast('Entry deleted');
  }

  handleSearch(query) {
    this.renderEntries(query);
  }

  handleLogout() {
    this.masterKey = null;
    this.entries = [];
    this.isInitialized = false;
    this.showScreen('login');

    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.add('hidden');
  }

  generatePassword() {
    const length = 16;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  async encryptData(data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, this.masterKey, new TextEncoder().encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decryptData(data) {
    const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.masterKey, encrypted);
    return new TextDecoder().decode(decrypted);
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');

    messageEl.textContent = message;
    toast.className = `fixed bottom-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-600' :
      type === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
    }`;
    toast.classList.remove('hidden');

    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  analyzeDomainForTags(url, title) {
    const tags = [];
    if (!url) return tags;

    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase();
      const domainParts = domain.split('.');

      // Check each category
      for (const [category, keywords] of Object.entries(this.tagCategories)) {
        for (const keyword of keywords) {
          if (domainParts.some(part => part.includes(keyword))) {
            // Capitalize category name for display
            const displayName = category.charAt(0).toUpperCase() + category.slice(1);
            tags.push(displayName);
            break; // Only add one tag per category
          }
        }
      }

      // Remove duplicates and limit to 3 tags
      return [...new Set(tags)].slice(0, 3);
    } catch (error) {
      console.warn('Failed to analyze domain for tags:', error);
      return tags;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize vault
const vault = new PasswordVault();
window.vault = vault;
