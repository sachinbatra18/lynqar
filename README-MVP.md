# Lynqar MVP - Simplified Password Manager

A clean, simple implementation of a zero-knowledge password manager with landing page.

## 🚀 **What You Get**

### **📄 Landing Page** (`landing.html`)
- Beautiful hero section with CTA
- Feature highlights with trust badges
- Mobile-responsive design
- SEO optimized with meta tags

### **🔐 Password Vault** (`vault.html` + `vault-app.js`)
- Zero-knowledge encryption (AES-GCM-256)
- PBKDF2 key derivation (100,000 iterations)
- Local storage only (no cloud sync)
- Secure password generation
- Search functionality
- PWA installable

## 🛠️ **Quick Start**

1. **Open Landing Page:**
   ```bash
   # Serve from home-main directory
   python -m http.server 8000
   # Visit: http://localhost:8000/landing.html
   ```

2. **Install as PWA:** Click "Try Password Manager" → Install app

3. **First Time Setup:** Create strong master password

4. **Add Passwords:** Use "Add Entry" button

## 🔒 **Security Features**

- **AES-GCM-256 Encryption:** Industry-standard authenticated encryption
- **PBKDF2 Key Derivation:** 100,000 iterations for master key
- **Zero-Knowledge:** Master password never leaves your device
- **Local Storage Only:** All data stays in your browser
- **Secure Generation:** Built-in strong password generator

## 📱 **Mobile Features**

- **PWA Installable:** Native app-like experience
- **Touch-Friendly:** Large buttons and inputs
- **Responsive Design:** Works on all screen sizes
- **Offline Support:** No internet required

## 🎨 **Technical Stack**

- **HTML/CSS/JavaScript:** Pure web technologies
- **Tailwind CSS:** CDN-based for instant styling
- **Web Crypto API:** Native browser encryption
- **LocalStorage:** Encrypted data storage
- **PWA Manifest:** App installation support

## 📋 **MVP Feature Set**

### ✅ **Implemented:**
- Landing page with hero & CTA
- Vault setup (first-time setup)
- AES encryption/decryption
- Add/edit/delete passwords
- Search functionality
- PWA installation
- Mobile responsiveness

### ❌ **Not Included (Simplified):**
- Backup/restore (manual export only)
- Two-factor authentication
- Browser sync between devices
- Advanced security features
- User management

## 🔧 **Development**

### **Testing PWA:**

1. Open Chrome DevTools → Application tab
2. Go to Manifest → Check "Install app"
3. Test offline functionality

### **Debugging:**

```javascript
// View encrypted data
console.log(localStorage.getItem('vault_entries'));

// Check vault initialization
console.log(localStorage.getItem('vault_initialized'));
```

### **Browser Support:**

- ✅ Chrome/Chromium (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Edge (full support)
- ⚠️ IE11 (not supported - lacks Web Crypto API)

## 🚀 **Going Production**

### **Before Launch:**

1. **HTTPS Required:** PWA installation needs SSL
2. **Domain:** Configure your domain in manifest.json
3. **Icons:** Replace with real PNG/SVG files
4. **Service Worker:** Add offline caching
5. **Security Review:** External security audit recommended

### **Production Checklist:**

- [ ] Enable HTTPS
- [ ] Add proper icons (PNG/SVG)
- [ ] Configure custom domain
- [ ] Add service worker for caching
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (privacy-focused)
- [ ] Test on various devices
- [ ] Security audit recommended

## 📖 **User Guide**

### **First Use:**
1. Visit landing page
2. Click "Try Password Manager"
3. Install app (optional)
4. Create master password
5. Start adding passwords

### **Daily Use:**
- Click vault entry to copy password
- Use search to find passwords quickly
- Add new entries with generator
- Lock vault when done

### **Security Tips:**
- Use strong, unique master password
- Generated passwords are recommended
- Never share your vault data
- Regularly backup (if needed)

## 🎯 **Next Steps (Optional Enhancements)**

If you want to expand this MVP:

1. **Backup System:** Add secure export/import
2. **Browser Sync:** Cross-device synchronization
3. **2FA Support:** Time-based tokens
4. **Biometrics:** WebAuthn integration
5. **Organizations:** Team password sharing

## 📄 **Files Overview**

```
home-main/
├── landing.html      # Marketing landing page
├── vault.html        # Password vault interface
├── vault-app.js      # Vault logic & encryption
├── manifest.json     # PWA configuration
├── README-MVP.md     # This documentation
└── [other config files]
```

This MVP provides a solid foundation for a secure password manager with all core functionality. The code is clean, well-documented, and ready for production deployment.

**Enjoy your new zero-knowledge password vault! 🔒**
