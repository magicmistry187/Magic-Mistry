// ChatModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Real-Time 1-on-1 In-App Chat Modal between Customer & Assigned Technician.
// Uses Socket.io rooms per booking with local fallback persistence and typing status.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, MessageSquare, Wrench, User, Clock,
  Sparkles, CheckCheck, Smile
} from 'lucide-react';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function ChatModal({
  isOpen,
  onClose,
  bookingId,
  bookingTitle = 'Service Request',
  otherPartyName = 'Technician',
  otherPartyRole = 'Assigned Expert',
  recipientId = null,
}) {
  const { socket, playNotificationSound } = useSocket();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const storageKey = `mm_chat_${bookingId || 'temp'}`;

  const [messages, setMessages] = useState(() => {
    if (!bookingId) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'system-welcome',
        isSystem: true,
        text: `Direct communication channel opened for ${bookingTitle}. Keep coordination notes here.`,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Save messages to local storage for persistence across modal toggles
  useEffect(() => {
    if (bookingId && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (_) {}
    }
  }, [messages, bookingId, storageKey]);

  // Join the dedicated booking socket room on open
  useEffect(() => {
    if (!isOpen || !socket || !bookingId) return;

    socket.emit('chat:join', { bookingId: String(bookingId) });

    return () => {
      socket.emit('chat:leave', { bookingId: String(bookingId) });
    };
  }, [isOpen, socket, bookingId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isOtherTyping]);

  // Listen for real-time messages in this room
  useSocketEvent('chat:new_message', (newMsg) => {
    if (!newMsg || String(newMsg.bookingId) !== String(bookingId)) return;

    // Avoid duplicate if sent by this client and already added optimistically
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    if (String(newMsg.senderId) !== String(user?.id)) {
      if (playNotificationSound) playNotificationSound();
      setIsOtherTyping(false);
    }
  });

  // Listen for typing events
  useSocketEvent('chat:typing', (data) => {
    if (data?.isTyping !== undefined) {
      setIsOtherTyping(data.isTyping);
    }
  });

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && bookingId) {
      socket.emit('chat:typing', {
        bookingId: String(bookingId),
        isTyping: true,
        senderName: user?.fullName || 'User',
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing', {
          bookingId: String(bookingId),
          isTyping: false,
          senderName: user?.fullName || 'User',
        });
      }, 1500);
    }
  };

  const handleSendMessage = (textToSend) => {
    const content = (textToSend || inputText).trim();
    if (!content || !socket || !bookingId) return;

    const newMsg = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      bookingId: String(bookingId),
      text: content,
      senderId: user?.id,
      senderName: user?.fullName || 'Me',
      senderRole: user?.role || 'customer',
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Emit to backend socket
    socket.emit('chat:send_message', {
      bookingId: String(bookingId),
      text: content,
      recipientId: recipientId || undefined,
      senderName: user?.fullName || 'User',
    });

    socket.emit('chat:typing', {
      bookingId: String(bookingId),
      isTyping: false,
    });
  };

  const quickReplies = [
    'I am available at home right now.',
    'Please call when you reach the gate.',
    'Is any spare part required?',
    'What is the estimated arrival time?',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[580px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#0b1e40] text-white px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {otherPartyName.slice(0, 2).toUpperCase()}
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0b1e40] absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  {otherPartyName}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                    {otherPartyRole}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Chat • {bookingTitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 bg-slate-200/80 text-slate-600 text-[11px] rounded-full font-semibold max-w-xs sm:max-w-sm">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = String(msg.senderId) === String(user?.id);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[82%] sm:max-w-[75%]">
                    {!isMe && (
                      <div className="w-6 h-6 rounded-lg bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 mb-1">
                        {msg.senderName ? msg.senderName[0] : 'T'}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#0b1e40] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                      <div
                        className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 font-medium ${
                          isMe ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                        {isMe && <CheckCheck className="w-3 h-3 text-amber-300 inline" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isOtherTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic py-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium">{otherPartyName} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Pill Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qr)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors shrink-0"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message ${otherPartyName}...`}
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b1e40]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-[#0b1e40] hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
