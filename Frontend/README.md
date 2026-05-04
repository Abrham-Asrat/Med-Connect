# 🏥 Med-Connect Frontend

![Med-Connect Dashboard](public/assets/dashboard-preview.png)

## 🚀 Overview

**Med-Connect** is a state-of-the-art Healthcare Management System designed to bridge the gap between patients, doctors, and healthcare administrators. Built with a focus on visual excellence, performance, and security, it provides a seamless experience for managing medical records, appointments, and real-time communication.

---

## ✨ Key Features

### 🔐 Authentication & Security   
- **Unified Login**: Seamless access for Patients, Doctors, and Administrators.
- **Brute-Force Protection**: Rate limiting and account lockout mechanisms.
- **Secure Sessions**: JWT token management with automated HTTP interceptors.
- **OTP Verification**: Enhanced security via MailKit-powered email verification.
- **Role-Based Guards**: Strict route protection (Auth, Role, Pending Doctor).

### 🏥 Support & Corporate Identity (New)
- **Support Hub**: Dedicated "Contact Us" and "About Us" modules for both portals.
- **Dynamic Contact Data**: Real-time retrieval of official support contact information from backend.
- **Contact Form Integration**: Direct submission of inquiries to the centralized Contact Controller.
- **Corporate Profile**: Professional "About Us" with mission statements, core values, and leadership bios.

### 🩺 Doctor Portal & Scheduling
- **Practice Management**: Today's schedule overview and pending appointment confirmations.
- **Schedule Synchronization**: Real-time synchronization of doctor availabilities with the backend database.
- **Shift Management**: Intuitive UI for adding/removing time slots with automated validation.
- **Financial Tracking**: Detailed earnings summary and transaction history.

### 📝 Health Blog & Engagement (Enhanced)
- **Knowledge Sharing**: Practitioner-authored medical insights with multi-tag support.
- **Social Interaction**: Hospital-grade engagement with **Likes**, **Live Comments**, and **View Statistics**.
- **Community Safety**: Integrated **Flagging System** allowing users to report medical misinformation or inappropriate content.

### 🛡️ Admin Portal
- **Verification Engine**: Streamlined CV/Certificate review for new practitioners.
- **User Moderation**: Holistic management of doctors and patients.
- **In-depth Analytics**: Revenue charts, platform stats, and financial logs.
- **Content Moderation**: Tools to review and manage flagged blogs or reviews.

---

## 🎨 Design System

Our application follows a custom design system inspired by **Ethiopian aesthetics**, combining modern glassmorphism with a vibrant cultural palette.

| Token | Role | Hex Code |
| :--- | :--- | :--- |
| **Primary** | Success / Growth | `#078930` (Green) |
| **Secondary** | Professionalism | `#007BFF` (Blue) |
| **Accent** | Attention | `#FCD116` (Yellow) |
| **Alert** | Urgency | `#DA121A` (Red) |
| **Background** | Cleanliness | `#F8F9FA` (Light Gray) |

---

## 🛠️ Technology Stack

- **Framework**: Angular 19+ (Standalone Components)
- **Styling**: Bootstrap 5.3 + Custom CSS (Modern Aesthetic)
- **Real-time**: SignalR (@microsoft/signalr)
- **Payments**: Chapa Integration
- **State Management**: Angular Signals & RxJS
- **Charts**: Chart.js
- **Testing**: Vitest / Karma
- **Communication**: RESTful APIs via .NET 8 Web API

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── core/           # Singleton services, guards, interceptors, models
│   ├── shared/         # Reusable UI components and utilities
│   ├── layouts/        # Patient, Doctor, Admin, and Auth layouts
│   └── features/       # Lazy-loaded business modules
│       ├── auth/       # Login, Register, OTP Flows
│       ├── appointments/# Booking & Management
│       ├── blog/        # Engagement & Insights
│       ├── support/     # About/Contact Support
│       └── doctor-schedule # Availability Management
├── environments/       # Environment-specific configurations
└── styles.scss         # Global styles & theme overrides
```

---

## 🔌 Backend API Integration

The frontend communicates with a **.NET 8 Web API**. Authentication is handled via JWT tokens, which are automatically included in all outgoing requests using the `AuthInterceptor`.

### Key Endpoints (Latest)

| Method | Endpoint | Feature |
| :--- | :--- | :--- |
| `POST` | `/api/User/Register` | User Registration |
| `POST` | `/api/User/login` | Secure Login |
| `POST` | `/api/doctors/availabilities/{id}`| Schedule Synchronization |
| `POST` | `/api/blogs/{id}/like` | Blog Engagement |
| `POST` | `/api/blogs/comment` | Blog Discussions |
| `POST` | `/api/Contact` | Support Submissions |
| `GET` | `/api/Contact/info` | Support Metadata |

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-org/med-connect-frontend.git

# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install
```

### 2. Development

```bash
# Start local development server
npm start
```
Navigate to `http://localhost:4200`.

### 3. Build & Test

```bash
# Production Build
npm run build --configuration production

# Run Unit Tests
npm test
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License & Contact

- **License**: MIT License
- **Email**: [medconnect271@gmail.com](mailto:medconnect271@gmail.com)

---
*Created with ❤️ by the Med-Connect Team.*