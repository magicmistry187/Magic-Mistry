# Service Booking App

A frontend architecture for a service booking application, built with React and Vite. This repository follows a modular, feature-based directory structure to ensure scalability and maintainability.

## 📁 Project Architecture

```text
Frontend /
├── src/
│   ├── assets/              # Static assets (images, icons, etc.)
│   ├── components/          # Reusable UI components grouped by feature
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── common/          # Navbar, Footer, Button, Card, Modal, Loading, ErrorBoundary
│   │   ├── layout/
│   │   ├── payment/
│   │   └── user/
│   ├── context/             # Global State: AuthContext, BookingContext, CartContext, NotificationContext
│   ├── hooks/               # Custom Hooks: useAuth, useFetch, useForm, useBooking, useNotification, useLocalStorage
│   ├── pages/               # Route Components: Home, Services, Booking, MyBookings, Profile, Login, Signup, Cart, Checkout
│   ├── services/            # API Services: api.js, authService.js, bookingService.js, paymentService.js, userService.js
│   ├── styles/              # Global Styles: index.css, variables.css, responsive.css, animations.css
│   └── utils/               # Utilities: constants.js, validators.js, formatters.js, localStorage.js, errorHandler.js, helpers.js
├── node_modules/
├── .env                     # Environment variables
├── .env.example             # Environment variables templ ate
├── .gitignore               # Git ignore rules
├── .oxlintrc.json           # Linter configuration
├── .qodo                    # Qodo configuration
├── App.css                  # Main application styles
├── App.jsx                  # Main application component
├── index.css                # Base stylesheet
├── index.html               # HTML entry point
├── main.jsx                 # React DOM rendering entry point
├── package.json             # Project metadata and dependencies
├── README.md                # Project documentation
└── vite.config.js           # Vite configuration
```

## 🏗️ Directory Breakdown

### `src/components/`
The components directory is modularized into distinct domains to keep the codebase organized:
*   **`common/`**: Contains generic, highly reusable UI elements (e.g., `Navbar`, `Footer`, `Button`, `Card`, `Modal`, `Loading`, `ErrorBoundary`).
*   **Feature Folders**: Contains components specific to certain domains like `auth/`, `booking/`, `payment/`, `user/`, `admin/`, and overall `layout/`.

### `src/pages/`
Contains the top-level route components for the application:
*   `Home`, `Services`, `Booking`, `MyBookings`, `Profile`, `Login`, `Signup`, `Cart`, `Checkout`.

### `src/hooks/`
Encapsulates complex logic into custom React hooks for reusability:
*   `useAuth`, `useFetch`, `useForm`, `useBooking`, `useNotification`, `useLocalStorage`.

### `src/context/`
Manages global state across the application using the React Context API:
*   `AuthContext`, `BookingContext`, `CartContext`, `NotificationContext`.

### `src/services/`
Handles all external API interactions and data fetching:
*   `api.js` (base configuration), `authService.js`, `bookingService.js`, `paymentService.js`, `userService.js`.

### `src/utils/`
Pure functions and constant values used throughout the application:
*   `constants.js`, `validators.js`, `formatters.js`, `localStorage.js`, `errorHandler.js`, `helpers.js`.

### `src/styles/`
Global styling resources:
*   `index.css`, `variables.css` (CSS variables/design tokens), `responsive.css`, `animations.css`.

## 🚀 Technologies Used
*   **Framework**: React
*   **Build Tool**: Vite
