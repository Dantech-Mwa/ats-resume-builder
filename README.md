# 🚀 ATS Resume Builder

<div align="center">

![ATS Resume Builder](public/logo.svg)

**World-class ATS-friendly Resume Builder with AI-Powered Optimization**

[![Deploy to GitHub Pages](https://github.com/Dantech-Mwa/ats-resume-builder/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/ats-resume-builder/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Overview

ATS Resume Builder is a complete, production-ready web application that helps users create professional, ATS-friendly resumes. It features AI-powered optimization, real-time ATS scoring, multiple professional templates, and seamless payment integration.

### ✨ Key Features

- 🤖 **AI-Powered Optimization** - Get intelligent suggestions to improve resume content
- 📊 **ATS Score Analysis** - Real-time scoring (0-100) with detailed breakdowns
- 🎨 **5 Professional Templates** - Modern, Executive, Creative, Minimal, and Corporate
- 📤 **Upload & Parse** - Upload existing resumes (PDF, DOCX, TXT) for analysis
- 📥 **Multiple Export Formats** - Download as PDF, DOCX, or TXT
- 💳 **Payment Integration** - PayPal and Stripe with 14-day trial
- 🔐 **Authentication** - Email/password and Google OAuth via Firebase
- 📱 **Responsive Design** - Works perfectly on all devices

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **State Management** | Zustand |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **AI** | OpenAI GPT-4 |
| **Payments** | PayPal, Stripe |
| **Deployment** | GitHub Pages |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- OpenAI API key
- PayPal Business account (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dantech-Mwa/ats-resume-builder.git
cd ats-resume-builder

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local

# Start development server
npm start