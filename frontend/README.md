<div align="center">

  # 🛠️ Magic Mistry - Frontend Application

  **Modern On-Demand Home Services & Repair Booking Frontend**

  [![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4.2-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)

---

## 🌟 Overview

The **Magic Mistry Frontend** is a high-performance, responsive single-page web application built with **React 19**, **Vite 8**, and **Tailwind CSS v4**. It allows homeowners to easily discover, schedule, and book doorstep electronics and appliance repair services with transparent pricing.

---

## ✨ Key Features

- 🔌 **Dynamic Appliance Selection**: Select from various appliances (AC, Washing Machine, Refrigerator, Microwave, etc.) with real-time base pricing updates.
- 💡 **Transparent Pricing & Spare Parts**: Detailed breakdown showing fixed inspection/service charges vs optional spare component replacement costs.
- 📅 **Interactive Calendar & Time Slots**: Choose preferred appointment dates and time slots. Past dates are automatically disabled.
- 📍 **Geolocation & Service Area Check**: Auto-detect user address via Browser Geolocation & OpenStreetMap reverse geocoding with West Bengal service area validation.
- 📷 **Appliance Photo Upload**: Drag-and-drop photo upload zone allowing users to attach up to 5 images of the damaged appliance.
- 💳 **Flexible Payment Options**: Choose between Cash After Service and UPI After Service (Pre-selection removed so users actively choose).
- 🎉 **Animated Booking Confirmation**: Order confirmation screen with booking ID generation and confetti animations.
- 🔑 **Authentication Modals**: Animated login, signup, OTP email verification, and Google OAuth integration.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/) & [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **OAuth**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📁 Folder Structure

The frontend follows a clean separation between **pages** (routes) and **components** (reusable UI units grouped by feature):

```text
frontend/
├── public/                     # Public static assets (logos, icons)
├── src/
│   ├── assets/                 # Brand assets and images
│   ├── components/             # Reusable UI components grouped by feature
│   │   ├── auth/               # Auth modals (CreateAccountModal, OTPVerificationModal)
│   │   ├── Booking/            # Booking components (ApplianceSelector, AddressForm,
│   │   │                       # ScheduleForm, PaymentMethod, PricingTransparency,
│   │   │                       # BookingSummary, ProblemSelector, BookingContext)
│   │   ├── common/             # Global layout & shared UI (Navbar, Footer, PageLoader, ScrollToTop)
│   │   └── home/               # Home page sections (HeroSection, ServiceCategories, HowItWorks)
│   ├── context/                # Global Context providers (AuthContext, etc.)
│   ├── pages/                  # Route page views (Pages only)
│   │   ├── aboutus/            # AboutPage.jsx
│   │   ├── auth/               # LoginPage.jsx
│   │   ├── BookingPage/        # BookingPage.jsx, BookingConfirmation.jsx
│   │   ├── contactus/          # ContactPage.jsx
│   │   ├── dashboard/          # DashboardPage.jsx
│   │   ├── home/               # HomePage.jsx
│   │   └── term & policy/      # TermsAndConditions.jsx, PrivacyPolicy.jsx
│   ├── services/               # API service layer and Axios instances
│   ├── App.jsx                 # Main application routes
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global CSS & Tailwind CSS import
│   └── App.css                 # Custom component styles
├── index.html                  # HTML entry template
├── package.json                # Project dependencies and npm scripts
└── vite.config.js              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## ⚙️ Available Scripts

In the frontend directory, you can run:

- **`npm run dev`**: Starts the Vite development server with hot module replacement (HMR).
- **`npm run build`**: Builds the app for production to the `dist` folder.
- **`npm run preview`**: Locally previews the production build.
- **`npm run lint`**: Runs Oxlint code diagnostics.
