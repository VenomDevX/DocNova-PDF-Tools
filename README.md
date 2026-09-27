<div align="center">

<img src="public/logo.svg" width="88" alt="DocNova logo" />

# DocNova

**Your documents, finally understood.**

52 free PDF tools and an AI assistant that summarizes, explains and chats with your documents.<br>
No sign-up. No watermarks. No limits.

<br>

<a href="https://www.docnova.in"><img src="https://img.shields.io/badge/Try_it_live-docnova.in-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Try it live" /></a>
<a href="https://github.com/VenomDevX/DocNova-PDF-Tools/stargazers"><img src="https://img.shields.io/github/stars/VenomDevX/DocNova-PDF-Tools?style=for-the-badge&logo=github&color=0d1117&labelColor=0d1117" alt="Stars" /></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-0d1117?style=for-the-badge" alt="MIT License" /></a>

<br>

<img src="https://img.shields.io/badge/React-0d1117?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-0d1117?style=flat-square&logo=vite&logoColor=A78BFA" alt="Vite" />
<img src="https://img.shields.io/badge/Tailwind-0d1117?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/Python-0d1117?style=flat-square&logo=python&logoColor=3776AB" alt="Python" />
<img src="https://img.shields.io/badge/Flask-0d1117?style=flat-square&logo=flask&logoColor=white" alt="Flask" />
<img src="https://img.shields.io/badge/Gemini-0d1117?style=flat-square&logo=googlegemini&logoColor=8E75B2" alt="Gemini" />

<br><br>

<a href="https://www.docnova.in"><img src="docs/home.png" width="100%" alt="DocNova home page" /></a>

</div>

<br>

## Why DocNova?

Most PDF sites cap your files, stamp watermarks or ask for an account. DocNova does not.

| | |
| :-- | :-- |
| 🧰 **52 tools, one place** | Convert, organize, edit, secure and OCR without switching sites |
| 🤖 **AI that reads for you** | Summaries, PDF chat, quizzes, flashcards, mind maps and contract review, powered by Gemini |
| 🔒 **Private by default** | No database. Uploads are temporary and wiped automatically after processing |
| ⚡ **Fast and free** | React + Vite frontend, lightweight Flask backend, $0 to use |

<br>

## Tools

<p align="center">
  <img src="docs/tools.png" width="100%" alt="DocNova tools page" />
</p>

<details>
<summary><b>🤖 AI Tools</b> · 14</summary>
<br>
Summarizer · PDF Chat · Email Writer · Smart Rewriter · OCR Extractor · Resume Analyzer · Quiz Generator · Flashcards · Translator · Table Extractor · Contract Review · Document Categorizer · Mind Maps · Study Assistant
</details>

<details>
<summary><b>🔄 Convert</b> · 11</summary>
<br>
PDF ⇄ Word · PDF ⇄ Excel · PDF ⇄ PowerPoint · PDF ⇄ JPG · PNG to PDF · PDF to Images · Image to PDF
</details>

<details>
<summary><b>🗂️ Organize</b> · 9</summary>
<br>
Merge · Split · Rotate · Delete Pages · Reorder Pages · Extract Pages · Insert Pages · Resize · Compress
</details>

<details>
<summary><b>✏️ Edit</b> · 10</summary>
<br>
Edit PDF · Annotate · Add Text · Add Image · Highlight · Draw · Crop · Redact · Watermark · Page Numbers
</details>

<details>
<summary><b>🔐 Secure</b> · 6</summary>
<br>
Lock · Unlock · Protect · Remove Password · Encrypt · Decrypt
</details>

<details>
<summary><b>🔍 OCR</b> · 2</summary>
<br>
PDF OCR · Image OCR
</details>

<br>

## Run it locally

**You need:** Node.js 18+, Python 3.8+ and a free [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/VenomDevX/DocNova-PDF-Tools.git
cd DocNova-PDF-Tools
```

**Backend** (terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
echo GEMINI_API_KEY=your_key_here > .env
python app.py
```

**Frontend** (terminal 2, project root)

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. For more detail see [`START_HERE.md`](START_HERE.md) and [`BACKEND_SETUP.md`](BACKEND_SETUP.md).

<br>

## Tech stack

| Layer | Built with |
| :-- | :-- |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · Lucide icons |
| Backend | Python · Flask · Gunicorn |
| Documents | PyMuPDF · PyPDF2 · pdf2image · python-docx · openpyxl · ReportLab |
| AI | Google Gemini (`google-genai`) |
| Hosting | Vercel (frontend) · Render (backend) |

<br>

## Security

- **Rate limiting** with Flask-Limiter against abuse and bot spam
- **Input validation** with Pydantic schemas and `bleach` sanitization
- **Upload hardening** with magic-byte checks (`python-magic`) to block spoofed files
- **Stateless processing** with no database; files use random UUIDs and are purged after use

<br>

## Contributing

Found a bug or want a new tool? [Open an issue](https://github.com/VenomDevX/DocNova-PDF-Tools/issues) or send a pull request. All contributions are welcome.

## License

[MIT](LICENSE) © Parth Sharma

<br>

<div align="center">

**If DocNova saved you time, please give it a ⭐. It helps other people find it.**

<a href="https://github.com/VenomDevX/DocNova-PDF-Tools/stargazers"><img src="https://img.shields.io/github/stars/VenomDevX/DocNova-PDF-Tools?style=social" alt="Star DocNova" /></a>

</div>
