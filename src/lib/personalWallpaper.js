/**
 * Per-chat / personal wallpaper management (WhatsApp-style)
 * Allows users to set a custom wallpaper specifically for one contact / conversation
 * Stored persistently in localStorage with live event dispatching
 */

export const PERSONAL_WALLPAPER_PRESETS = [
  {
    id: 'doodle',
    name: 'Veyra Doodles',
    type: 'pattern',
    value:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTc4YmZhIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIwLjMyIj4KICAgIDxwYXRoIGQ9Ik0yMCAyNWgxOGE0IDQgMCAwIDEgNCA0djEwYTQgNCAwIDAgMS00IDRoLTEwbC02IDV2LTVoLTJhNCA0IDAgMCAxLTQtNFYyOWE0IDQgMCAwIDEgNC00eiIvPgogICAgPHBhdGggZD0iTTgwIDc1aDE4YTQgNCAwIDAgMSA0IDR2MTBhNCA0IDAgMCAxLTQgNGgtMTBsLTYgNXYtNWgtMmE0IDQgMCAwIDEtNC00Vjc5YTQgNCAwIDAgMSA0LTR6Ii8+CiAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9Ijg1IiByPSI2Ii8+CiAgICA8cGF0aCBkPSJNNzUgMjVsMTUgNi02IDE1Ii8+CiAgICA8cGF0aCBkPSJNNDggNjBsOC04IDggOCIvPgogICAgPGNpcmNsZSBjeD0iOTAiIGN5PSI0NSIgcj0iMi41IiBmaWxsPSIjYTc4YmZhIi8+CiAgICA8Y2lyY2xlIGN4PSI2MCIgY3k9Ijk1IiByPSIyLjUiIGZpbGw9IiNhNzhiZmEiLz4KICAgIDxwYXRoIGQ9Ik0xNSA2NWw0IDQgNi02Ii8+CiAgICA8cGF0aCBkPSJNOTUgMTVsMiA0IDQgMi00IDItMiA0LTItNC00LTIgNC0yeiIgZmlsbD0iI2E3OGJmYSIvPgogIDwvZz4KPC9zdmc+',
    preview: 'bg-[#090d16] bg-[radial-gradient(#8b5cf6_1.5px,transparent_1.5px)] [background-size:16px_16px]',
  },
  {
    id: 'cyber_grid',
    name: 'Cyber Grid',
    type: 'pattern',
    value:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj4KICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMjUiLz4KPC9zdmc+',
    preview: 'bg-[#0b0f19] bg-[linear-gradient(to_right,#8b5cf633_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf633_1px,transparent_1px)] bg-[size:16px_16px]',
  },
  {
    id: 'cosmic',
    name: 'Starry Nebula',
    type: 'gradient',
    value:
      'radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.45) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.35) 0%, transparent 70%)',
    preview: 'bg-gradient-to-br from-violet-900/80 via-slate-950 to-indigo-900/80',
  },
  {
    id: 'minimal_lines',
    name: 'Minimal Wave',
    type: 'pattern',
    value:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxLjgiIGZpbGw9IiNhNzhiZmEiIG9wYWNpdHk9IjAuMzUiLz4KPC9zdmc+',
    preview: 'bg-[#090d16] bg-[radial-gradient(#a78bfa_1.5px,transparent_1.5px)] [background-size:12px_12px]',
  },
  {
    id: 'sunset_rose',
    name: 'Sunset Rose',
    type: 'gradient',
    value:
      'radial-gradient(ellipse at top, rgba(244, 63, 94, 0.35) 0%, transparent 65%), radial-gradient(ellipse at bottom, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
    preview: 'bg-gradient-to-b from-rose-950 via-slate-950 to-amber-950',
  },
  {
    id: 'emerald_glow',
    name: 'Emerald Matrix',
    type: 'gradient',
    value:
      'radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.35) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
    preview: 'bg-gradient-to-tr from-emerald-950 via-slate-950 to-teal-950',
  },
  {
    id: 'ocean_depth',
    name: 'Midnight Ocean',
    type: 'gradient',
    value:
      'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.3) 0%, rgba(2, 6, 23, 0.95) 80%)',
    preview: 'bg-gradient-to-b from-sky-950 via-slate-950 to-[#020617]',
  },
  {
    id: 'obsidian',
    name: 'Obsidian OLED',
    type: 'color',
    value: 'none',
    preview: 'bg-black border border-zinc-800',
  },
];

const STORAGE_KEY = 'veyra_personal_wallpapers';

export const getPersonalWallpaper = (userId, conversationId) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);

    if (userId && map[userId.toString()]) {
      return map[userId.toString()];
    }
    if (conversationId && map[conversationId.toString()]) {
      return map[conversationId.toString()];
    }
    return null;
  } catch (e) {
    console.warn('Could not read personal wallpaper:', e);
    return null;
  }
};

export const setPersonalWallpaper = (userId, conversationId, wallpaperValue, dim = 35) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};

    const entry = {
      wallpaper: wallpaperValue,
      dim: Number(dim) || 35,
      updatedAt: Date.now(),
    };

    if (userId) map[userId.toString()] = entry;
    if (conversationId) map[conversationId.toString()] = entry;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    window.dispatchEvent(
      new CustomEvent('veyra_personal_wallpaper_updated', {
        detail: { userId, conversationId, wallpaper: wallpaperValue, dim },
      })
    );
  } catch (e) {
    console.error('Could not save personal wallpaper:', e);
  }
};

export const removePersonalWallpaper = (userId, conversationId) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);

    if (userId) delete map[userId.toString()];
    if (conversationId) delete map[conversationId.toString()];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    window.dispatchEvent(
      new CustomEvent('veyra_personal_wallpaper_updated', {
        detail: { userId, conversationId, removed: true },
      })
    );
  } catch (e) {
    console.error('Could not remove personal wallpaper:', e);
  }
};

/**
 * Compress an image file into a lightweight base64 JPEG data URL
 */
export const compressImageFile = (file, maxDimension = 1280, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
