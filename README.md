# 🚀 DocNova PDF Tools

<p align="center">
  <b>The ultimate, all-in-one PDF manipulation and AI-powered document suite.</b> <br/>
  Featuring 53+ powerful tools across 6 categories. No watermarks. No sign-ups. Free forever.
</p>

<p align="center">
  <a href="https://www.docnova.in"><img src="https://img.shields.io/badge/Try_it_live-docnova.in-8B5CF6?style=for-the-badge" alt="Live demo" /></a>
  <a href="https://github.com/VenomDevX/DocNova-PDF-Tools/stargazers"><img src="https://img.shields.io/github/stars/VenomDevX/DocNova-PDF-Tools?style=for-the-badge&color=yellow" alt="Stars" /></a>
  <img src="https://img.shields.io/badge/license-MIT-333?style=for-the-badge" alt="MIT License" />
</p>

<p align="center"><sub>⭐ If DocNova saves you time, star the repo — it helps others find it.</sub></p>

---

## ✨ Features

DocNova isn't just a basic PDF editor—it is a complete document command center powered by Google's cutting-edge Gemini AI.

*   **🤖 AI-Powered Document Analysis:** Extract key points, generate flashcards, summarize 100-page PDFs in seconds, and have interactive follow-up Q&A conversations with your documents.
*   **🛠️ 53+ Professional Tools:** Everything you need in one place. Split, merge, compress, protect, unlock, rotate, and convert PDFs.
*   **🔒 Complete Privacy & Security:** Your data is yours. Files are securely processed using cryptographically safe UUIDs, and automated cleanup scripts ensure your documents are permanently wiped from the server the moment you're done. We do not train models on your data.
*   **⚡ Blazing Fast:** Built with a highly optimized React/Vite frontend and a lightweight Python Flask backend, ensuring ultra-fast load times and instant conversions.
*   **📱 Responsive & Beautiful UI:** A premium, glassmorphic design that looks stunning and functions perfectly on desktops, tablets, and phones.

---

## 💻 Tech Stack

**Frontend:**
*   React 18 + TypeScript
*   Vite (for blazing fast build tooling)
*   Tailwind CSS (for fluid, responsive design)
*   Lucide React (for crisp, modern iconography)

**Backend:**
*   Python 3 + Flask
*   Google Gemini AI API (for LLM-powered document intelligence)
*   Flask-Limiter (for robust API rate limiting and DoS protection)
*   PyPDF2 / pdf2image (for low-level document manipulation)

---

## 🚀 Running Locally

Want to run DocNova on your own machine? It's incredibly simple.

### Prerequisites
*   Node.js (v18+)
*   Python (3.8+)
*   A free Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/VenomDevX/DocNova-PDF-Tools.git
cd DocNova-PDF-Tools
```

### 2. Setup the Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory and add your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Start the server:
```bash
python app.py
```

### 3. Setup the Frontend
Open a *new* terminal and stay in the root project folder:
```bash
npm install
npm run dev
```

Your app will now be running on `http://localhost:5173`!

---

## 🛡️ Security

DocNova has been professionally audited and hardened against common web vulnerabilities:
*   **Rate Limiting:** Protects against API abuse and bot-spamming.
*   **Input Sanitization:** Strict Pydantic schemas and `bleach` sanitization prevent XSS and injection attacks.
*   **File Upload Hardening:** Magic-byte validation (`python-magic`) blocks malicious file spoofing.
*   **Stateless Processing:** No databases. Uploads are strictly temporary and auto-purged from memory and disk.

---

## 📜 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this software, as long as the original copyright header is included. See the `LICENSE` file for details.

---
<p align="center">
  Built with ❤️ by <b>PARTH SHARMA</b>
</p>
