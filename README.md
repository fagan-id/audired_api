# 👁️‍🗨️ Audired API

<div align="center">
  <img src="Logo.png" alt="Audired Logo" width="120"/>
  <p><em>Helping visually impaired users identify and understand medication via voice and smart scanning</em></p>
</div>

## 📱 Deployed At  
URL : https://audired-820e0.et.r.appspot.com/ 

## 📱 Overview

Audired is a backend API built to support a mobile app that helps users with visual impairments understand medication labels through image scanning, AI interpretation, and voice assistance. It integrates Google Vision API for Optical Character Recognition (OCR) and Gemini API (Google GenAI) for interpreting scanned text. The app also provides a reminder feature for medications based on scanned results.

### ✨ Key Features

* **📷 Image Scanning with OCR**: Process medication label images using Google Vision API
* **🧠 AI Interpretation**: Use Gemini (Google GenAI) to analyze and explain medication details
* **🔔 Medication Reminders**: Create scheduled reminders for medications based on scan results
* **📄 History Management**: Store scanned results and reminders in Firestore
* **🔐 Firebase Authentication**: Authenticate and manage users securely with Firebase

## 🛠️ Tech Stack

* **Runtime**: Node.js + Express.js
* **Authentication**: Firebase Authentication
* **Database**: Firebase Firestore
* **Cloud AI**: Google Vision API & Gemini API
* **File Handling**: Multer for image uploads
* **Environment Management**: dotenv

## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* Firebase project (Firestore + Authentication)
* Google Cloud project with:
  * Vision API enabled
  * Gemini API enabled
* Service Account JSON for Firebase Admin SDK

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/fagan-id/audired_api.git
   cd audired_api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and configure your environment variables:

   ```env
   PORT=3000
   GOOGLE_APPLICATION_CREDENTIALS=./config/firebase-service-account.json
   GEMINI_API_KEY=your_google_genai_api_key
   ```

4. Place your Firebase Admin SDK JSON file at:

   ```
   ./config/firebase-service-account.json
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

6. The API will be running at [http://localhost:3000](http://localhost:3000)

## 📂 API Endpoints

### 🔐 Authentication

* **[Middleware] Firebase Auth**
  Every protected route requires a valid Firebase ID token passed via `Authorization: Bearer <token>`

### 📤 Upload & OCR

* `POST /process`
  * Accepts base64 image uploads (multipart/form-data)
  * Uses Google Vision API to extract text
  * Passes extracted text to Gemini API for interpretation
  * Saves result in Firestore under authenticated user


## 📁 Project Structure

```
audired_api/
├── config/
│   └── firebase-service-account.json  # Firebase Admin credentials
├── controllers/                       # Logic for scan, reminders, history
├── middlewares/                       # Firebase auth middleware
├── routes/                            # API route definitions
├── services/                          # Google Vision and Gemini integration
├── utils/                             # Helper utilities
├── .env                               # Environment variables
├── app.js                             # Express entry point
└── package.json
```

## 🔐 Authentication and Security

* Uses **Firebase Authentication** to verify user identity via bearer tokens.
* Ensures all user-specific data is securely stored in **Firestore**, scoped by user ID.
* **Google Application Credentials** are securely used for Vision API and Firestore Admin access.

## 💡 Application Use Case

1. User takes a photo of a medication label
2. Image is sent to the `/processImage` endpoint
3. Text is extracted with Google Vision API
4. Gemini interprets and summarizes the content
5. Scan history is saved and accessible via storage

## 🤝 Contributing

Feel free to contribute to this project:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit your work: `git commit -m 'Add new feature'`
5. Push your branch: `git push origin feature/your-feature-name`
6. Create a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 📊 System Flow Diagram

```
┌───────────────┐     ┌────────────────┐     ┌───────────────┐
│  Mobile App   │────▶│  Audired API   │────▶│  Vision API   │
└───────────────┘     └────────────────┘     └───────────────┘
                              │                      │
                              ▼                      ▼
                      ┌────────────────┐     ┌───────────────┐
                      │   Firebase     │◀────│   Gemini AI   │
                      │  Auth/Firestore│     │  Interpretation│
                      └────────────────┘     └───────────────┘
```