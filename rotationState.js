import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tipRotationState_v1';

/**
 * Load rotation state object from AsyncStorage.
 * Falls back to an empty default state on any error.
 */
async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: 1, categories: {} };
    }
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      parsed.version !== 1 ||
      typeof parsed.categories !== 'object' ||
      parsed.categories === null
    ) {
      return { version: 1, categories: {} };
    }
    return parsed;
  } catch (e) {
    return { version: 1, categories: {} };
  }
}

/**
 * Persist rotation state to AsyncStorage.
 */
async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore – if saving fails, we just lose persistence for this run
  }
}

/**
 * Get the next index for a category, ensuring each index in the pool
 * is returned once before repeating, persisted per device.
 *
 * On any storage or parsing error, falls back to a simple random index.
 *
 * @param {string} categoryId
 * @param {number} poolLength
 * @returns {Promise<number | null>} index in [0, poolLength) or null if poolLength <= 0
 */
export async function getNextInRotation(categoryId, poolLength) {
  if (!poolLength || poolLength <= 0) {
    return null;
  }

  // Simple, fully in-memory random as a safety net if anything below fails.
  const fallback = () => Math.floor(Math.random() * poolLength);

  try {
    let state = await loadState();
    if (!state || state.version !== 1 || !state.categories) {
      state = { version: 1, categories: {} };
    }

    const categories = state.categories;
    const existing = categories[categoryId];

    let remaining;

    if (
      !existing ||
      !Array.isArray(existing.remaining) ||
      typeof existing.poolLength !== 'number' ||
      existing.poolLength !== poolLength
    ) {
      // Pool size changed or invalid state – reset to full range.
      remaining = Array.from({ length: poolLength }, (_, i) => i);
    } else {
      remaining = existing.remaining.slice();
    }

    if (remaining.length === 0) {
      remaining = Array.from({ length: poolLength }, (_, i) => i);
    }

    const randomIdx = Math.floor(Math.random() * remaining.length);
    const chosenIndex = remaining[randomIdx];
    remaining.splice(randomIdx, 1);

    categories[categoryId] = {
      poolLength,
      remaining,
    };

    await saveState(state);

    return chosenIndex;
  } catch (e) {
    return fallback();
  }
}

