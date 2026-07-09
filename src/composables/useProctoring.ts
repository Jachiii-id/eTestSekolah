import { onMounted, onUnmounted } from 'vue';

import { MAX_VIOLATIONS } from '@/constants';
import { useTestSessionStore } from '@/stores/testSession';
import type { ViolationType } from '@/types';

import { useToasts } from './useToasts';

/** Detects tab switches / window blur during an in-progress test and reports each as a violation. Debounced so visibilitychange + blur firing together for one switch only counts once. */
export function useProctoring() {
  const store = useTestSessionStore();
  const { pushToast } = useToasts();

  let cooldown = false;

  async function handleViolation(type: ViolationType) {
    if (store.status !== 'in_progress' || store.isLocked || cooldown) return;
    cooldown = true;
    window.setTimeout(() => {
      cooldown = false;
    }, 800);

    const { violationCount, locked } = await store.recordViolation(type);

    if (locked) {
      pushToast(
        'Test locked: maximum warnings reached. Your answers have been submitted as final.',
        'error',
        8000,
      );
    } else {
      pushToast(
        `Warning: leaving the test window is being recorded (${violationCount}/${MAX_VIOLATIONS})`,
        'warning',
      );
    }
  }

  function onVisibilityChange() {
    if (document.hidden) void handleViolation('tab_switch');
  }

  function onBlur() {
    void handleViolation('window_blur');
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onBlur);
  });
}
