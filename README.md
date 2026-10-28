# CampusLoop 🎓🔄

> **"Your campus. Your stuff. Your loop."**  
> A campus-only circular marketplace where college students buy, sell, exchange, and lend second-hand textbooks, calculators, stationery, electronics, and student essentials. Built as a business-idea demonstration prototype for a first-year BCA Management assignment.

---

## 🌟 Overview

Every academic semester, college students face steep retail costs for single-use textbooks, lab gear, and accessories. At the same time, seniors finish courses with piles of high-utility items left sitting unused in hostel rooms. 

**CampusLoop** solves this friction through a hyper-local, zero-commission circular campus economy:
- **Affordable Essentials**: Juniors save up to 70% compared to brand new retail prices.
- **Value Recovery**: Seniors recoup cash for items they no longer need.
- **Campus-Only Trust**: Face-to-face inspection at familiar university landmarks (Library, Canteen, Department Labs).
- **Zero Carbon & Packaging Waste**: Direct peer exchanges with zero shipping delays or courier fuel.

---

## 🚀 Key Features

- **Responsive Marketplace Feed**: 14 realistic seed listings across Textbooks, Electronics, Stationery, Study essentials, and Hostel gear.
- **Multi-Field Instant Search & Filters**: Live filtering by keyword, category, condition (*Like New*, *Good condition*, *Well used*), and sorting (*Newest*, *Price: Low to High*, *Price: High to Low*, *Highest Savings*).
- **Interactive Product Detail View**: Full item specs, campus pickup zones, seller department, and original retail savings comparison.
- **Simulated In-Campus Peer Chat**: Interactive conversation simulator demonstrating peer exchange negotiation without real SMS/email spam.
- **Listing Creation Form**: 30-second listing flow with input validation, positive-pricing checks, and 6 instant image presets.
- **Local Storage Persistence**: Saved bookmark items and user-created listings persist across browser reloads via `localStorage`.
- **Trust & Campus Safety Protocol**: Guidelines for safe daylight exchanges, red flag warnings, and a simulated report listing mechanism.
- **BCA Presentation Mode**: An interactive 5-step guided walkthrough dock designed specifically for presentation in front of professors and classmates.
- **4-Stage Business Roadmap**: Disciplined monetization strategy covering Free Adoption, Featured Listing Boosts, Campus Bookstore Partnerships, and Long-Term Escrow Protection.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Typography**: Newsreader (Editorial Serif) & Plus Jakarta Sans
- **State & Storage**: React Context + Browser `localStorage`

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Run

1. Clone or download the repository:
   ```bash
   git clone <REPO_URL>
   cd "Campus Loop Demo"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. Build for production:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📋 Coursework & Prototype Disclaimer

*This project is an interactive business concept prototype created for academic evaluation in a 1st Year BCA Management course. All product listings, chat messages, and reports are simulated locally in the user's browser. No real financial payments, user tracking, or third-party servers are utilized in this demonstration.*
