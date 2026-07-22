<div align="center">

  # 🛠️ Magic Mistry

  **On-Demand Home Services & Repair Booking Platform**

  [![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4.2-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <b>Magic Mistry</b> is a modern home service booking platform designed to connect users seamlessly with certified technicians ("Mistrys") for home appliance repair, electrical work, plumbing, AC maintenance, and doorstep service solutions.
  </p>

  [Features](#-key-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Available Scripts](#%EF%B8%8F-available-scripts)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Magic Mistry** bridges the gap between homeowners and skilled service technicians. Whether it's an urgent air conditioner repair, refrigerator troubleshooting, washing machine setup, or routine home maintenance, Magic Mistry provides an intuitive, high-performance web application to discover, schedule, manage, and pay for doorstep services with complete transparency.

---

## ✨ Key Features

- 🔍 **Smart Search & Autocomplete**: Instant search suggestions for popular services like AC installation, fridge repair, washing machine service, microwave fix, and more.
- 🔑 **Modal Auth & Verification**: Sleek, animated modal-based Authentication (Login & Sign-up) complete with client-side form validation and social sign-in integration (Google).
- 📍 **Location-Based Service Delivery**: Smart location selection allowing users to find technicians active in their neighborhood.
- 🛒 **Interactive Cart & Booking Flow**: Dynamic cart management for selecting multiple service packages, scheduling time slots, and reviewing cost breakdowns.
- 📱 **Fully Responsive & Smooth UI**: Modern aesthetic built using Tailwind CSS v4, custom scroll-aware navigation bars, and fluid micro-interactions via Framer Motion.
- 🔔 **Notifications & User Dashboard**: Track booking updates, status changes, and manage personal profiles easily.

---

## 🛠️ Tech Stack

### Frontend
- **Core Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Linter**: [Oxlint](https://github.com/oxc-project/oxc)

### Backend
- **Node.js & Express API Architecture** *(Modular REST API backend setup)*

---

## 📁 Project Architecture

The project follows a clean client-server architecture with modular, domain-driven frontend directory organization:

```text
Magic-Mistry/
├── backend/                  # Node.js Express REST API backend
│   └── backend.txt
├── frontend/                 # React + Vite Client Application
│   ├── src/
│   │   ├── assets/           # Static assets, images, and brand icons
│   │   ├── components/       # UI Components grouped by domain
│   │   │   ├── admin/        # Admin management dashboards
│   │   │   ├── auth/         # Auth components & login modals
│   │   │   ├── booking/      # Service selection & slot picker
│   │   │   ├── common/       # Global Navbar, Footer, Buttons, Cards, Modals
│   │   │   ├── layout/       # Main container & page wrapper layouts
│   │   │   ├── payment/      # Payment gateway integration components
│   │   │   └── user/         # User profile and account management
│   │   ├── context/          # Global Contexts (AuthContext, BookingContext, CartContext, NotificationContext)
│   │   ├── hooks/            # Custom Hooks (useAuth, useFetch, useForm, useBooking, useNotification)
│   │   ├── pages/            # Page Views (Home, Services, Booking, MyBookings, Profile, Cart, Auth)
│   │   ├── services/         # API Service modules (authService, bookingService, paymentService)
│   │   ├── styles/           # Global design tokens, variables, animations
│   │   ├── utils/            # Helper functions, validators, formatters, localStorage helpers
│   │   ├── App.css           # Component styles
│   │   ├── App.jsx           # Root application component with routes
│   │   ├── index.css         # Tailwind CSS directives & base styles
│   │   └── main.jsx          # React DOM entry point
│   ├── .env.example          # Environment variables template
│   ├── .gitignore            # Git exclusion rules
│   ├── .oxlintrc.json        # Code quality & linter configuration
│   ├── index.html            # Application entry HTML
│   ├── package.json          # Dependency manifest & scripts
│   └── vite.config.js        # Vite bundler configuration
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Magic-Mistry.git
   cd Magic-Mistry
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies** *(if applicable)*:
   ```bash
   cd ../backend
   npm install
   ```

### Environment Variables

Create a `.env` file inside the `frontend` directory based on the `.env.example` template:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="Magic Mistry"
```

### Running the Application

1. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the URL printed in your terminal).

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## ⚙️ Available Scripts

In the `frontend` directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite development server with HMR |
| `npm run build` | Bundles the application for production deployment |
| `npm run preview` | Locally previews the production build output |
| `npm run lint` | Runs `oxlint` for high-speed code linting and syntax checking |

---

## 🗺️ Future Roadmap

- [ ] 💳 Integration with Payment Gateways (Razorpay / Stripe)
- [ ] 🗺️ Live GPS Tracking for assigned Mistrys/Technicians
- [ ] 💬 In-app Chat & Direct Calling between user and service provider
- [ ] ⭐️ Rating, Review, and Verified Badge System for Technicians
- [ ] 📱 Mobile App (React Native / Progressive Web App)

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for hassle-free home service booking.</sub>
</div>
