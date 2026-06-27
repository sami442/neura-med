# 🏥 NeuraMed — Multimodal Medical AI Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Gemini](https://img.shields.io/badge/Gemini-2.5--flash-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)

## 🚀 Live Demo
👉 [**Try NeuraMed Live**](https://neura-med-one.vercel.app/)

## 📌 Overview
NeuraMed is a full-stack multimodal medical AI platform built with
Next.js and powered by Google Gemini 2.5 Flash. It combines five
AI-powered features into one unified, professional dashboard —
disease detection, medical chatbot, symptom checker, health metrics
analyzer, and automated report generation.

Unlike traditional single-feature AI projects, NeuraMed demonstrates
end-to-end full-stack AI development with a modern React frontend,
API routes, and real-time Gemini AI integration.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔬 Disease Detection | Upload medical images for AI-powered diagnosis across 4 disease types |
| 💬 Medical Chatbot | Multi-turn medical Q&A powered by Gemini AI |
| 🩺 Symptom Checker | Describe symptoms and get detailed AI analysis |
| 📊 Health Metrics | Analyze BP, glucose, cholesterol and BMI against WHO standards |
| 📋 Report Generator | Generate and download professional medical reports |

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| Google Gemini 2.5 Flash | AI language model for all features |
| Vercel | Production deployment |
| JavaScript/TypeScript | Core language |

## 📊 Disease Detection Models

| Disease | Dataset | Accuracy |
|---------|---------|----------|
| Pneumonia | Chest X-ray (Mooney, Kaggle) | 82.25% |
| Diabetic Retinopathy | APTOS-2019 | 92.77% |
| Skin Lesion | HAM10000 | 78.00% |
| COVID-19 | COVID-19 Radiography DB | 75.83% |

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/sami442/neura-med.git
cd neura-med
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment variables
Create `.env.local`:
### 4. Run the development server
```bash
npm run dev
```

### 5. Open in browser
http://localhost:3000
