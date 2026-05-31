import { ref } from 'vue';
import { injectStorage } from '../storage/inject-storage';
import { DARK_MODE_DEFAULT, StorageParams } from '../storage/storage-params';
import { applyDarkMode } from '../utils/dark-mode';

/**
 * Shared dark-mode state for a single page (popup or dashboard).
 *
 * `isDark` is a module-level singleton ref, so every component on the same page
 * (e.g. the dashboard sidebar toggle AND the Settings page switch) reads and
 * writes the same value — no desync. `setDark`/`toggle` both apply the theme to
 * the document immediately (via applyDarkMode) and persist it.
 */
const isDark = ref(DARK_MODE_DEFAULT);

export function useDarkMode() {
  async function load(): Promise<void> {
    isDark.value = await injectStorage().getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
    applyDarkMode(isDark.value);
  }

  async function setDark(value: boolean): Promise<void> {
    isDark.value = value;
    applyDarkMode(value);
    await injectStorage().saveValue(StorageParams.DARK_MODE, value);
  }

  function toggle(): Promise<void> {
    return setDark(!isDark.value);
  }

  return { isDark, load, setDark, toggle };
}
