/**
 * Utility to manage custom contact names (nicknames / edited names)
 * Saved persistently in localStorage and dispatches live update events
 */

const extractId = (u) => {
  if (!u) return '';
  if (typeof u === 'string') return u;
  if (typeof u === 'object') {
    return (u._id || u.id || u).toString();
  }
  return String(u);
};

export const getCustomContactName = (userId, defaultName) => {
  if (typeof window === 'undefined' || !userId) return defaultName;
  const key = extractId(userId);
  if (!key) return defaultName;

  try {
    const raw = localStorage.getItem('veyra_custom_contact_names');
    if (!raw) return defaultName;
    const map = JSON.parse(raw);
    return map[key] || defaultName;
  } catch (e) {
    return defaultName;
  }
};

export const getAllCustomContactNames = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('veyra_custom_contact_names');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const setCustomContactName = (userId, customName) => {
  if (typeof window === 'undefined' || !userId) return;
  const key = extractId(userId);
  if (!key) return;

  try {
    const raw = localStorage.getItem('veyra_custom_contact_names');
    const map = raw ? JSON.parse(raw) : {};
    if (customName && customName.trim()) {
      map[key] = customName.trim();
    } else {
      delete map[key];
    }
    localStorage.setItem('veyra_custom_contact_names', JSON.stringify(map));

    // Dispatch custom event so all active components re-render immediately
    window.dispatchEvent(
      new CustomEvent('veyra_contact_updated', {
        detail: { userId: key, customName: customName?.trim() || null },
      })
    );
  } catch (e) {
    console.error('Failed to save custom contact name:', e);
  }
};
