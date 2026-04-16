# ☁️ CloudVault - Secure Intelligent Cloud Storage

**CloudVault** is a next-generation cloud storage simulator designed to demonstrate **secure file isolation**, **real-time cost analytics**, and **AI-powered OCR tools**.

Built with a **Microservices-ready architecture**, it simulates a multi-tenant SaaS environment where every user gets an isolated storage bucket (folder), ensuring data privacy and security.

---

## 🚀 Key Features

### 🔐 1. Security & Authentication
* **Simulated OTP Login:** Passwordless authentication flow (OTP prints to server terminal for security demo).
* **Data Isolation:** Implements "Folder-Based Multi-Tenancy" (`user_1/`, `user_2/`) on MinIO/S3.
* **Secure Headers:** All API requests are protected via `x-user-id` validation.

### 📂 2. Advanced File Management
* **Smart Uploads:** Drag-and-drop interface with progress indicators.
* **Encrypted Storage:** Files are renamed with UUIDs to prevent overwriting and enumeration attacks.
* **Sharing Logic:** Generate temporary "Time-Bound" links (1 Hour, 1 Day) for secure sharing.

### 📊 3. Cost Intelligence (FinOps)
* **Real-Time Dashboard:** Visualizes storage costs dynamically ($0.10/MB simulation).
* **Interactive Charts:** Uses `Recharts` to track cost history over time.
* **Mobile Responsive:** Fully adaptive UI for phones and tablets.

### 🧠 4. AI-OCR Tools
* **Contact Extraction:** Upload a business card or document to auto-extract **Emails**, **Phones**, and **URLs**.
* **Actionable Links:** One-click redirection to **WhatsApp**, **Gmail**, or **Dialer** directly from the scan results.
* **Camera Integration:** Captures documents directly from the device camera.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide Icons, Recharts
* **Backend:** Python FastAPI (Modular Router Architecture)
* **Database:** PostgreSQL / SQLite (via SQLAlchemy)
* **Storage:** MinIO (S3 Compatible Object Storage)
* **OCR Engine:** Tesseract OCR (Python `pytesseract`)

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js & npm
* Python 3.9+
* MinIO Server (Running locally or via Docker)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary boto3 pytesseract python-multipart pillow

# Run the Server
uvicorn app.main:app --reload

Server will start at: http://127.0.0.1:8000


Here is the professional README.md file for your project.

You can save this as README.md in the root folder of your project. It includes everything an examiner needs to run and understand your work.

Markdown
# ☁️ CloudVault - Secure Intelligent Cloud Storage

**CloudVault** is a next-generation cloud storage simulator designed to demonstrate **secure file isolation**, **real-time cost analytics**, and **AI-powered OCR tools**.

Built with a **Microservices-ready architecture**, it simulates a multi-tenant SaaS environment where every user gets an isolated storage bucket (folder), ensuring data privacy and security.

---

## 🚀 Key Features

### 🔐 1. Security & Authentication
* **Simulated OTP Login:** Passwordless authentication flow (OTP prints to server terminal for security demo).
* **Data Isolation:** Implements "Folder-Based Multi-Tenancy" (`user_1/`, `user_2/`) on MinIO/S3.
* **Secure Headers:** All API requests are protected via `x-user-id` validation.

### 📂 2. Advanced File Management
* **Smart Uploads:** Drag-and-drop interface with progress indicators.
* **Encrypted Storage:** Files are renamed with UUIDs to prevent overwriting and enumeration attacks.
* **Sharing Logic:** Generate temporary "Time-Bound" links (1 Hour, 1 Day) for secure sharing.

### 📊 3. Cost Intelligence (FinOps)
* **Real-Time Dashboard:** Visualizes storage costs dynamically ($0.10/MB simulation).
* **Interactive Charts:** Uses `Recharts` to track cost history over time.
* **Mobile Responsive:** Fully adaptive UI for phones and tablets.

### 🧠 4. AI-OCR Tools
* **Contact Extraction:** Upload a business card or document to auto-extract **Emails**, **Phones**, and **URLs**.
* **Actionable Links:** One-click redirection to **WhatsApp**, **Gmail**, or **Dialer** directly from the scan results.
* **Camera Integration:** Captures documents directly from the device camera.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide Icons, Recharts
* **Backend:** Python FastAPI (Modular Router Architecture)
* **Database:** PostgreSQL / SQLite (via SQLAlchemy)
* **Storage:** MinIO (S3 Compatible Object Storage)
* **OCR Engine:** Tesseract OCR (Python `pytesseract`)

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js & npm
* Python 3.9+
* MinIO Server (Running locally or via Docker)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary boto3 pytesseract python-multipart pillow

# Run the Server
uvicorn app.main:app --reload
Server will start at: http://127.0.0.1:8000

2. Frontend Setup
Bash
cd frontend
# Install libraries
npm install
# Run the React App
npm run dev
Client will start at: http://localhost:5173

3. MinIO (Storage) Setup
Ensure MinIO is running on port 9000. Update your backend/app/storage.py with your credentials:

Python
ENDPOINT = "127.0.0.1:9000"
ACCESS_KEY = "minioadmin"
SECRET_KEY = "minioadmin"
BUCKET_NAME = "cloudvault"


