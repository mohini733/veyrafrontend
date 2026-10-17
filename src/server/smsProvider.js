import { Otp } from './models/Otp';
import { connectDB } from './db';

// Global in-memory cache fallback
if (!global.otpStore) {
  global.otpStore = new Map();
}
const otpStore = global.otpStore;

export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().trim().replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle leading 0 (e.g. 07015889571)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 12-digit number starting with 91
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return `+${cleaned}`;
};

export const getPossiblePhones = (phone) => {
  if (!phone) return [];
  const normalized = normalizePhoneNumber(phone);
  const raw = phone.toString().trim();
  const rawDigits = raw.replace(/[^\d]/g, '');

  const phones = new Set([normalized, raw]);
  if (rawDigits.length >= 10) {
    const last10 = rawDigits.slice(-10);
    phones.add(last10);
    phones.add(`+91${last10}`);
    phones.add(`+${rawDigits}`);
    phones.add(`91${last10}`);
  }
  return Array.from(phones);
};

export const isValidInternationalPhone = (phone) => {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  const regex = /^\+[1-9]\d{6,14}$/;
  return regex.test(normalized);
};

export const generateNumericOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const sendOTP = async (phone) => {
  const normalized = normalizePhoneNumber(phone);
  const otp = generateNumericOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 1. Store in memory
  const possible = getPossiblePhones(phone);
  possible.forEach((p) => {
    otpStore.set(p, {
      otp,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
    });
  });

  // 2. Persist in MongoDB for serverless cross-instance resilience
  try {
    await connectDB();
    // Delete any old OTPs for all phone variations
    await Otp.deleteMany({ phone: { $in: possible } });
    // Save new OTP
    await Otp.create({
      phone: normalized,
      otp,
      expiresAt,
      attempts: 0,
    });
  } catch (err) {
    console.warn('[Veyra OTP] Could not persist OTP to MongoDB, using memory store:', err.message);
  }

  // 3. Fast2SMS real dispatch if key is configured
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const rawDigits = phone.toString().replace(/[^\d]/g, '');
  const raw10Digits = rawDigits.slice(-10);

  if (fast2smsKey && fast2smsKey.trim() !== '') {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: raw10Digits,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (data.return === true || data.status_code === 200) {
        return {
          success: true,
          message: `Verification code sent via SMS to ${normalized}. Please check your phone messages.`,
          phone: normalized,
          devOtp: null,
          configured: true,
        };
      }
    } catch (err) {
      console.warn('[Veyra OTP] Fast2SMS dispatch failed:', err.message);
    }
  }

  // Fallback testing code if SMS gateway is not active or needs verification
  return {
    success: true,
    message: `Verification code generated. (Testing fallback code: ${otp})`,
    phone: normalized,
    devOtp: otp,
    configured: true,
  };
};

export const verifyOTP = async (phone, candidateOtp) => {
  if (!candidateOtp) {
    return {
      success: false,
      message: 'OTP code is required',
    };
  }

  const cleanOtp = candidateOtp.toString().trim();
  const possible = getPossiblePhones(phone);

  // 1. Try fetching from MongoDB first (works across all serverless lambdas)
  let record = null;
  let isMongo = false;
  try {
    await connectDB();
    record = await Otp.findOne({ phone: { $in: possible } }).sort({ createdAt: -1 });
    if (record) {
      isMongo = true;
    }
  } catch (err) {
    console.warn('[Veyra OTP] MongoDB lookup failed, checking memory:', err.message);
  }

  // 2. Fallback to memory store if not found in MongoDB
  if (!record) {
    for (const p of possible) {
      if (otpStore.has(p)) {
        record = otpStore.get(p);
        break;
      }
    }
  }

  if (!record) {
    return {
      success: false,
      message: 'No active OTP request found for this number or it has expired. Please request a new code.',
    };
  }

  const expiresTime = isMongo ? record.expiresAt.getTime() : record.expiresAt;
  if (Date.now() > expiresTime) {
    if (isMongo) {
      await Otp.deleteMany({ phone: { $in: possible } }).catch(() => {});
    }
    possible.forEach((p) => otpStore.delete(p));
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
    };
  }

  const currentAttempts = record.attempts || 0;
  if (record.otp !== cleanOtp) {
    const nextAttempts = currentAttempts + 1;
    if (nextAttempts >= 5) {
      if (isMongo) {
        await Otp.deleteMany({ phone: { $in: possible } }).catch(() => {});
      }
      possible.forEach((p) => otpStore.delete(p));
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }

    if (isMongo) {
      record.attempts = nextAttempts;
      await record.save().catch(() => {});
    } else {
      record.attempts = nextAttempts;
    }

    return {
      success: false,
      message: `Invalid verification code. ${5 - nextAttempts} attempts remaining.`,
    };
  }

  // Success! Clear OTP so it cannot be reused
  if (isMongo) {
    await Otp.deleteMany({ phone: { $in: possible } }).catch(() => {});
  }
  possible.forEach((p) => otpStore.delete(p));

  return {
    success: true,
    message: 'Phone number verified successfully.',
  };
};

export default {
  normalizePhoneNumber,
  getPossiblePhones,
  isValidInternationalPhone,
  generateNumericOTP,
  sendOTP,
  verifyOTP,
};
