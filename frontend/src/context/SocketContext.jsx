import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, X, ArrowRight, Wrench } from 'lucide-react';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../services/apiConnector';
import { saveLiveServicePricing, saveLiveFuelRate } from '../services/pricingService';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  playNotificationSound: () => {},
  showGlobalNotification: () => {},
});

// Subtle, pleasant notification chime using Web Audio API (Zero external assets required)
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle melodic ding: 523.25Hz (C5) -> 659.25Hz (E5)
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) {
    // AudioContext blocked by browser autoplay policy until user gesture
  }
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const showGlobalNotification = useCallback((notif) => {
    playNotificationSound();
    setNotification(notif);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNotification(null);
    }, 6000);
  }, []);

  useEffect(() => {
    // Only connect if user is authenticated with a valid token
    if (!token) {
      if (socketRef.current) {
        console.log('[Socket] Disconnecting socket on logout/token cleared');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('[Socket] Initializing connection to:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket Connected] ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket Disconnected] Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('[Socket Connect Error]:', error.message);
      setIsConnected(false);
    });

    // ── Global Real-Time Event Handlers (Works on ANY page of the site) ─────
    const userRole = (user?.role || '').toLowerCase();

    // Customer events
    newSocket.on('booking:status_changed', (updatedBooking) => {
      if (window.location.pathname === '/dashboard') return;
      const status = updatedBooking?.bookingStatus || 'Updated';
      const tech = updatedBooking?.vendor?.fullName || 'A verified technician';
      const appliance = updatedBooking?.appliance || updatedBooking?.serviceCategory || 'Your appliance';

      showGlobalNotification({
        id: Date.now(),
        title: `Service Status: ${status}`,
        message:
          status === 'Accepted'
            ? `${tech} has accepted your ${appliance} booking and is preparing for service.`
            : `Status updated to "${status}" for ${appliance}.`,
        type: 'success',
        actionUrl: '/dashboard',
        actionLabel: 'Track Booking',
      });
    });

    newSocket.on('booking:cancelled', (cancelledBooking) => {
      if (window.location.pathname === '/dashboard') return;
      const appliance = cancelledBooking?.appliance || 'Appliance service';
      showGlobalNotification({
        id: Date.now(),
        title: 'Booking Cancelled',
        message: `${appliance} booking has been cancelled.`,
        type: 'warning',
        actionUrl: '/dashboard',
        actionLabel: 'View Details',
      });
    });

    // ── Platform-Wide Real-Time Pricing & Fuel Synchronization ──
    newSocket.on('pricing:updated', (payload) => {
      const incomingList = payload?.meta?.allServices || payload?.services;
      if (Array.isArray(incomingList) && incomingList.length > 0) {
        saveLiveServicePricing(incomingList, false);
      }
    });

    newSocket.on('pricing:fuel_rate_updated', (payload) => {
      const rate = payload?.fuelRate;
      if (rate !== undefined && !isNaN(Number(rate))) {
        saveLiveFuelRate(rate, false);
      }
    });

    // Vendor events
    if (userRole === 'vendor') {
      newSocket.on('booking:new', (newBooking) => {
        if (window.location.pathname === '/vendor-dashboard') return;
        const appliance = newBooking?.serviceCategory || newBooking?.appliance || 'Repair';
        const area = newBooking?.address?.city || 'nearby';
        showGlobalNotification({
          id: Date.now(),
          title: 'New Service Request! 🛠️',
          message: `New ${appliance} service requested in ${area}. Tap to review and accept.`,
          type: 'info',
          actionUrl: '/vendor-dashboard',
          actionLabel: 'View Request',
        });
      });
    }

    // Admin events
    if (userRole === 'admin') {
      newSocket.on('admin:new_booking', (newBooking) => {
        if (window.location.pathname === '/admin-dashboard') return;
        const customer = newBooking?.customer?.fullName || 'Customer';
        const appliance = newBooking?.appliance || 'Service';
        showGlobalNotification({
          id: Date.now(),
          title: 'New Booking Placed',
          message: `${customer} placed an order for ${appliance}.`,
          type: 'info',
          actionUrl: '/admin-dashboard',
          actionLabel: 'Open Admin',
        });
      });

      newSocket.on('admin:new_application', (newApp) => {
        if (window.location.pathname === '/admin-dashboard') return;
        const applicant = newApp?.fullName || 'A vendor';
        showGlobalNotification({
          id: Date.now(),
          title: 'New Vendor Application 📋',
          message: `${applicant} submitted an application to become a vendor.`,
          type: 'info',
          actionUrl: '/admin-dashboard',
          actionLabel: 'Review Application',
        });
      });
    }

    return () => {
      console.log('[Socket Cleanup] Closing connection');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, user?.role, showGlobalNotification]);

  const handleNotificationClick = () => {
    if (notification?.actionUrl) {
      navigate(notification.actionUrl);
      setNotification(null);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, playNotificationSound, showGlobalNotification }}>
      {children}

      {/* Global Real-Time Floating Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-4 right-4 z-[99999] max-w-md w-full p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 flex items-start gap-3.5"
            style={{ boxShadow: '0 20px 40px rgba(11, 30, 64, 0.18)' }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                notification.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : notification.type === 'warning'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : notification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-900 truncate">{notification.title}</h4>
                <button
                  onClick={() => setNotification(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>

              {notification.actionUrl && (
                <button
                  onClick={handleNotificationClick}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {notification.actionLabel || 'View Details'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

/**
 * Custom hook to safely listen to socket events with auto-cleanup.
 * Uses a callback ref to avoid unnecessary re-subscriptions on re-renders.
 */
export const useSocketEvent = (eventName, handler) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !eventName) return;

    const eventListener = (...args) => {
      if (handlerRef.current) {
        handlerRef.current(...args);
      }
    };

    socket.on(eventName, eventListener);

    return () => {
      socket.off(eventName, eventListener);
    };
  }, [socket, eventName]);
};

export default SocketContext;
