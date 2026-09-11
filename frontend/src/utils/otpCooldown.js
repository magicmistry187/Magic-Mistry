import { useState, useEffect, useCallback } from 'react';

export const OTP_COOLDOWN_SECONDS = 60;

/**
 * Returns the remaining cooldown in seconds (0 if no cooldown active).
 * @param {string} purpose - 'signup' | 'forgotPassword'
 * @param {string} [email] - User's email address
 * @returns {number} Remaining seconds
 */
export function getOtpRemainingCooldown(purpose = 'signup', email = '') {
  try {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    let latestSentTime = 0;

    if (normalizedEmail) {
      const emailStored = localStorage.getItem(`otp_cooldown_${purpose}_${normalizedEmail}`);
      if (emailStored) {
        latestSentTime = Math.max(latestSentTime, parseInt(emailStored, 10) || 0);
      }
    }

    const purposeStored = localStorage.getItem(`otp_cooldown_${purpose}`);
    if (purposeStored) {
      latestSentTime = Math.max(latestSentTime, parseInt(purposeStored, 10) || 0);
    }

    if (!latestSentTime) return 0;

    const elapsedSeconds = Math.floor((Date.now() - latestSentTime) / 1000);
    const remaining = OTP_COOLDOWN_SECONDS - elapsedSeconds;

    if (remaining <= 0) {
      clearOtpCooldown(purpose, email);
      return 0;
    }

    return remaining;
  } catch (e) {
    console.error('Error reading OTP cooldown from storage:', e);
    return 0;
  }
}

/**
 * Sets the OTP cooldown timestamp in localStorage.
 * @param {string} purpose - 'signup' | 'forgotPassword'
 * @param {string} [email] - User's email address
 */
export function setOtpCooldown(purpose = 'signup', email = '') {
  try {
    const now = Date.now().toString();
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    if (normalizedEmail) {
      localStorage.setItem(`otp_cooldown_${purpose}_${normalizedEmail}`, now);
    }
    localStorage.setItem(`otp_cooldown_${purpose}`, now);
  } catch (e) {
    console.error('Error saving OTP cooldown to storage:', e);
  }
}

/**
 * Clears OTP cooldown for a purpose and email.
 * @param {string} purpose - 'signup' | 'forgotPassword'
 * @param {string} [email] - User's email address
 */
export function clearOtpCooldown(purpose = 'signup', email = '') {
  try {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    if (normalizedEmail) {
      localStorage.removeItem(`otp_cooldown_${purpose}_${normalizedEmail}`);
    }
    localStorage.removeItem(`otp_cooldown_${purpose}`);
  } catch (e) {
    console.error('Error clearing OTP cooldown from storage:', e);
  }
}

/**
 * Custom React hook for countdown timer and status for OTP cooldown.
 * @param {string} purpose - 'signup' | 'forgotPassword'
 * @param {string} [email] - User's email address
 * @returns {{ remainingTime: number, isCooldownActive: boolean, startCooldown: () => void }}
 */
export function useOtpCooldown(purpose = 'signup', email = '') {
  const [remainingTime, setRemainingTime] = useState(() => getOtpRemainingCooldown(purpose, email));
  const [prevKey, setPrevKey] = useState(`${purpose}:${email}`);
  const currentKey = `${purpose}:${email}`;

  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setRemainingTime(getOtpRemainingCooldown(purpose, email));
  }

  useEffect(() => {
    const current = getOtpRemainingCooldown(purpose, email);
    if (current <= 0) return;

    const interval = setInterval(() => {
      const remaining = getOtpRemainingCooldown(purpose, email);
      setRemainingTime(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [purpose, email]);

  const startCooldown = useCallback(() => {
    setOtpCooldown(purpose, email);
    setRemainingTime(OTP_COOLDOWN_SECONDS);
  }, [purpose, email]);

  return {
    remainingTime,
    isCooldownActive: remainingTime > 0,
    startCooldown,
  };
}
