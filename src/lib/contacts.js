/**
 * Utility to manage custom contact names (nicknames / edited names)
 * Saved persistently in localStorage and dispatches live update events
 */

export const getCustomContactName = (identifier, defaultName, fallbackPhone) => {
  if (typeof window === 'undefined') return defaultName;
  try {
    const raw = localStorage.getItem('veyra_custom_contact_names');
    if (!raw) return defaultName;
    const map = JSON.parse(raw);

    if (identifier && map[identifier?.toString()]) {
      return map[identifier.toString()];
    }
    if (fallbackPhone && map[fallbackPhone?.toString()]) {
      return map[fallbackPhone.toString()];
    }
    return defaultName;
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

export const setCustomContactName = (identifier, customName, fallbackPhone) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('veyra_custom_contact_names');
    const map = raw ? JSON.parse(raw) : {};
    const trimmed = customName && customName.trim() ? customName.trim() : null;

    if (trimmed) {
      if (identifier) map[identifier.toString()] = trimmed;
      if (fallbackPhone) map[fallbackPhone.toString()] = trimmed;
    } else {
      if (identifier) delete map[identifier.toString()];
      if (fallbackPhone) delete map[fallbackPhone.toString()];
    }

    localStorage.setItem('veyra_custom_contact_names', JSON.stringify(map));

    // Dispatch custom event so all active components re-render immediately
    window.dispatchEvent(
      new CustomEvent('veyra_contact_updated', {
        detail: { identifier, fallbackPhone, customName: trimmed },
      })
    );
  } catch (e) {
    console.error('Failed to save custom contact name:', e);
  }
};
