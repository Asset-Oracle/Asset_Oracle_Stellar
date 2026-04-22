# **AssetOracle **

**Real-World Asset Tokenization Platform built for Africa, powered by Stellar**
Unlocking verified assets across Nigeria and emerging markets for global access, liquidity, and trust.

**Verified African Real-World Assets on Stellar**
Built for the **Stellar Ecosystem / Residency Program — RWA & Financial Infrastructure Track**

---

## **Problem Statement**

Across Nigeria and Africa, real estate and physical assets represent trillions in untapped value, yet remain largely inaccessible due to:

* Fragmented and paper-based land registries prone to fraud
* High barriers to entry, locking out everyday investors
* Illiquid assets that cannot be easily traded or leveraged
* Lack of trust and transparency in ownership verification
* Limited access to global capital markets

These challenges prevent asset owners from unlocking value and exclude millions from participating in wealth creation.

---

## **Solution**

AssetOracle leverages Stellar’s fast, low-cost financial infrastructure to provide:

**Verified Asset Registry**
Digitizing and anchoring property ownership and verification records on-chain for trust and transparency

**Fractional Tokenization**
Breaking high-value assets into affordable digital shares, enabling everyday Nigerians and Africans to invest

**AI-Powered Analysis**
Automated fraud detection, valuation insights, and risk scoring tailored to local market conditions

**Instant Settlement**
Near-instant (3–5 seconds) transactions, enabling seamless buying, selling, and transfers

**Global Accessibility**
Connecting African assets to global investors through seamless fiat-to-digital asset conversion

---

## **Architecture**

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│            Stellar Wallet Integration               │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              Backend API (Express.js)               │
│  • Asset Registration  • User Management            │
│  • Verification Workflow  • Portfolio Tracking      │
└─────────┬───────────────────────┬───────────────────┘
          │                       │
┌─────────▼──────────┐  ┌────────▼────────────────────┐
│   AI Service        │  │   Smart Contracts (Soroban) │
│   • Fraud Detection │  │   • Asset Tokenization      │
│   • Risk Scoring    │  │   • Ownership Registry      │
└─────────────────────┘  │   • Access Control Logic    │
                         └─────────────────────────────┘
```

---

## **Stellar Integration**

### **Why Stellar?**

* Fast settlement (≈3–5 seconds) ideal for real-time transactions
* Ultra-low transaction fees, making micro-investments viable
* Native asset issuance for seamless tokenization
* Built-in compliance and authorization controls
* Designed for cross-border financial inclusion

---

### **Core Components**

* **Stellar Assets** — Fractional ownership tokens for African real-world assets
* **Anchors (SEP-24 / SEP-31)** — Fiat ↔ on-chain conversion for local currencies (NGN, etc.)
* **Soroban Smart Contracts** — Ownership logic, escrow, and automation
* **Stellar SDKs** — Backend integration
* **Stellar Ledger** — Immutable verification and ownership records

---

## **Quick Start**

### **Prerequisites**

* Node.js 18+
* Stellar testnet account
* PostgreSQL database

---

### **Backend**

```bash
cd backend
npm install
cp .env.example .env
# Configure Stellar credentials
npm run dev
```

---

### **Frontend**

```bash
cd frontend
bun install
bun run dev
```

---

### **AI Service**

```bash
cd ai-service
pip install -r requirements.txt
python api.py
```

---

## **Features**

### **Completed**

* [x] Backend API (20+ endpoints)
* [x] AI-powered fraud detection
* [x] Property verification workflow
* [x] User portfolio management
* [x] File upload system
* [x] React frontend with wallet connection

---

### **Stellar Integration (In Progress)**

* [ ] Asset issuance for fractional ownership
* [ ] Soroban smart contract deployment
* [ ] Anchor integration for fiat on/off ramps
* [ ] Wallet integration (Freighter / Albedo)
* [ ] Stellar SDK integration in backend

---

## **Ecosystem Alignment**

AssetOracle demonstrates:

* Tokenized African real-world assets (properties → digital assets)
* Programmable ownership and compliance
* Global investment access into African markets
* Low-cost infrastructure enabling financial inclusion
* Composable financial systems built on Stellar

---

## **Repository Structure**

```
├── backend/          # Express.js API
├── frontend/         # React + TypeScript UI
├── contracts/        # Soroban smart contracts
├── ai-service/       # AI fraud detection
└── docs/             # Documentation
```

---

## **Links**

* Live Demo: Coming Soon
* API Docs: Coming Soon
* Video Demo: Coming Soon

---

## **Team**

Built by the AssetOracle team

---

## **Notes (Editable Section)**

* Add deployment links once live
* Replace “Coming Soon” sections
* Include wallet setup guide
* Add contract addresses after deployment

---

## **Closing**

AssetOracle is unlocking Africa’s real-world assets—starting with Nigeria—by transforming them into trusted, liquid, and globally accessible digital investments.

---

---

