# TunnelXray

**TunnelXray** is an advanced Security Operations Center (SOC) platform designed for real-time IPsec tunnel telemetry, deep cryptographic inspection, and automated threat mitigation.

---

## ⚡ Features

- **IPsec Security Command Center**: Live telemetry, throughput monitors, fast threat simulations, and active mitigations.
- **Deep Packet Inspection (IKE & ESP)**: Real-time dissection of Phase 1 / Phase 2 negotiations, Security Parameter Indexes (SPI), and cipher suites.
- **Cryptographic Security Assessment**: Comprehensive scoring, MITRE ATT&CK mapping, weak algorithm detection, and automated policy hardening.
- **Distributed Gateway Operations & Mesh Topology**: Fixed interactive gateway canvas visualizing encrypted mesh channels across global nodes.
- **Raw Telemetry & Audit Logs**: High-frequency packet streams, forensic filtering, CSV/JSON exports, and security event logs.
- **Real OTP Email Authentication**: Zero-trust authentication system powered by cryptographic 6-digit one-time passcodes delivered via SMTP.
- **Universal SubTabs Direct Navigator**: Instant 1-click access across all 28 platform modules.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Three.js, Lucide Icons
- **Backend / API**: Node.js, Nodemailer (SMTP Authentication Engine)
- **Deployment**: Vercel Serverless Ready, Multi-stage Docker, Standalone Node.js

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/receptacle-pot/TunnelXray.git
   cd TunnelXray
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your SMTP credentials in `.env` for email OTP verification:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-google-app-password
   SMTP_FROM="TunnelXray Security Operations" <your-email@gmail.com>
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

---

## 📦 Production Deployment

### Option 1: Standalone Node.js Server
```bash
npm run build
npm start
```
The server will run on `http://0.0.0.0:3000` (or the port specified by `PORT`).

### Option 2: Vercel (One-Click)
Deploy directly on Vercel with zero config. Add your `SMTP_*` environment variables in the Vercel project dashboard.

### Option 3: Docker Container
```bash
docker build -t tunnelxray .
docker run -p 3000:3000 --env-file .env tunnelxray
```

---

## 🔒 Security & Privacy

- Sensitive environment variables (`.env`) are strictly excluded from version control.
- Rate-limiting and cryptographic session management are enforced on all authentication routes.

---

## 📄 License

MIT License. Developed by **HORCRUX**.
