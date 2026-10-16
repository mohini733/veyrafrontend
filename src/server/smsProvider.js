// In-memory OTP storage for verification
const otpStore = new Map();

export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().trim().replace(/[\s\-\(\)]/g, '');

  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
      cleaned = `+91${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }

  return cleaned;
};

export const isValidInternationalPhone = (phone) => {
  if (!phone) return false;
  const regex = /^\+[1-9]\d{6,14}$/;
  return regex.test(phone);
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
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalized, {
    otp,
    expiresAt,
    attempts: 0,
  });

  return {
    success: true,
    message: `Verification code generated. (Testing fallback code: ${otp})`,
    phone: normalized,
    devOtp: otp,
    configured: true,
  };
};

export const verifyOTP = (phone, candidateOtp) => {
  const normalized = normalizePhoneNumber(phone);
  const record = otpStore.get(normalized);

  if (!record) {
    return {
      success: false,
      message: 'No active OTP request found for this number or it has expired.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
    };
  }

  if (record.otp !== candidateOtp.toString().trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      otpStore.delete(normalized);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      };
    }
    return {
      success: false,
      message: `Invalid verification code. ${5 - record.attempts} attempts remaining.`,
    };
  }

  otpStore.delete(normalized);
  return {
    success: true,
    message: 'Phone number verified successfully.',
  };
};
