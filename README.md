# Territorial Dataviz

A React + Vite application for territorial data visualization.

## Prerequisites

- Node.js 20.19+ or 22.12+ (see `.nvmrc` for recommended version)
- npm or yarn

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment

### GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/territorial-dataviz.git
git push -u origin main
```

### Vercel

This project is configured for Vercel deployment. You can deploy in two ways:

#### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

#### Option 2: Via Vercel CLI
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

The `vercel.json` configuration file is already set up for optimal Vite deployment.

## Tech Stack

- React 19
- Vite 7
- Leaflet & React-Leaflet (maps)
- Recharts (charts)
- Lucide React (icons)
