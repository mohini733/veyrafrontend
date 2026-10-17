import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  let uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/veyra_chat';

  if (uri.startsWith('mongodb+srv://') && !uri.includes('authSource=')) {
    uri += uri.includes('?') ? '&authSource=admin' : '?authSource=admin';
  }

  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('[Veyra Serverless DB] MongoDB Connected Successfully');
        return mongooseInstance;
      })
      .catch(async (primaryErr) => {
        // If 127.0.0.1 failed in local development, attempt connecting via localhost fallback
        if (
          !isProduction &&
          (uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017'))
        ) {
          const alternateUri = uri.includes('127.0.0.1')
            ? uri.replace('127.0.0.1', 'localhost')
            : uri.replace('localhost', '127.0.0.1');

          try {
            console.warn(
              `[Veyra Serverless DB] Retrying connection via ${alternateUri}...`
            );
            return await mongoose.connect(alternateUri, opts);
          } catch (altErr) {
            console.error('[Veyra Serverless DB] Local MongoDB fallback failed:', altErr.message);
          }
        }
        throw primaryErr;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('[Veyra Serverless DB] Connection failed:', e.message);

    if (e.message && e.message.includes('ECONNREFUSED')) {
      const msg = isProduction
        ? 'Database connection refused. Please ensure MONGODB_URI is correctly configured in your deployment settings.'
        : 'Cannot connect to local MongoDB (127.0.0.1:27017). Please ensure MongoDB Service is running on your machine.';
      throw new Error(msg);
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
