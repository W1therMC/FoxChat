# FoxChat Production Deployment Guide

## 📦 Production Package Contents
- `index.js` - Optimized Express server (18KB)
- `public/` - Static assets (420KB total)
  - `index.html` - Main HTML file
  - `assets/index-LlFiRhVz.js` - React bundle (349KB, gzipped: 114KB)
  - `assets/index-V_rxg3cH.css` - Styles with VHS effects (65KB, gzipped: 12KB)

## 🚀 Quick Deploy

### Option 1: Replit Deploy
1. Upload production package to Replit
2. Click "Deploy" button
3. Ready! Your app will be live at `https://your-repl.replit.app`

### Option 2: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Option 3: Railway
```bash
npm install -g @railway/cli
railway deploy
```

### Option 4: Render
1. Connect GitHub repository
2. Build command: `npm run build`
3. Start command: `npm start`

## 🔧 Environment Setup

### Required Environment Variables
```bash
PORT=5000                    # Server port (optional, defaults to 5000)
NODE_ENV=production         # Production mode
```

### Optional Database (for persistence)
```bash
DATABASE_URL=postgresql://... # PostgreSQL connection string
```

## 📋 Installation Steps

1. **Extract package**
   ```bash
   tar -xzf foxchat-production.tar.gz
   cd foxchat-production
   ```

2. **Install dependencies**
   ```bash
   npm install --production
   ```

3. **Start server**
   ```bash
   npm start
   ```

4. **Access application**
   - Open browser: `http://localhost:5000`
   - Server serves both static files and WebSocket

## ✨ Features Included
- ✅ VHS retro filters with toggle
- ✅ Password-protected rooms with animations
- ✅ Multi-language support (5 languages)
- ✅ Real-time WebSocket chat
- ✅ ASCII fox terminal intro
- ✅ Responsive design
- ✅ Privacy-focused (RAM-only storage)

## 🛠 Technical Details
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + WebSocket (ws)
- **Build**: Vite (optimized production build)
- **Compatibility**: Node.js 18+
- **Bundle size**: 349KB JS (114KB gzipped)

## 🎮 Usage
1. Terminal intro with ASCII fox
2. Enter username and room code
3. For password-protected rooms, add 'p' suffix
4. Enjoy VHS-style retro chat experience
5. Toggle VHS effects with top-right button

## 📞 Support
- Production-ready build
- Optimized for deployment
- All dependencies included
- Cross-platform compatible

Ready to deploy! 🚀