import Browser from 'webextension-polyfill';
import { createOffscreen } from '../offscreen/index';
import { Messages } from '../utils/messages';
import { PomodoroSounds } from '../utils/pomodoro';

/** Sounds reused from the Pomodoro sound pack (src/assets/pomodoro-sounds). */
export const FOCUS_COMPLETE_SOUND = PomodoroSounds['Sound 10'];
export const GOAL_ALERT_SOUND = PomodoroSounds['Sound 3'];

/**
 * Plays a short sound via the offscreen audio document — the same path Pomodoro
 * uses. Works from the popup AND the background service worker (which has no
 * `Audio` constructor): it creates the offscreen document on demand and forwards
 * the file to it for playback.
 */
export async function playSound(sound: string): Promise<void> {
  await createOffscreen();
  await Browser.runtime.sendMessage({
    message: Messages.PlayAudio,
    sound,
    offscreen: true,
  });
}
