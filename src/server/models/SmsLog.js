import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    toPhone: {
      type: String,
      required: true,
      index: true,
    },
    messageText: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'Fast2SMS',
    },
    status: {
      type: String,
      enum: ['delivered', 'dispatched', 'queued', 'simulated', 'failed'],
      default: 'dispatched',
    },
    requestId: {
      type: String,
      default: '',
    },
    carrierNotice: {
      type: String,
      default: '',
    },
    isRegisteredOnVeyra: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SmsLog = mongoose.models.SmsLog || mongoose.model('SmsLog', smsLogSchema);
export default SmsLog;
