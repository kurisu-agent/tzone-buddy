import { useEffect, useState, useCallback } from 'react';
import { checkForUpdate, applyUpdate, shouldCheckForUpdate, UpdateInfo } from '../lib/updater.js';
import packageJson from '../../package.json';

interface UpdateState {
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  isUpdating: boolean;
  error: string | null;
  lastCheckTime: number | null;
}

export function useUpdateCheck() {
  const [state, setState] = useState<UpdateState>({
    updateInfo: null,
    isChecking: false,
    isUpdating: false,
    error: null,
    lastCheckTime: null
  });

  // Check for updates
  const checkNow = useCallback(async (force: boolean = false) => {
    // Skip if already checking or if we checked recently (unless forced)
    if (state.isChecking) return;
    if (!force && state.lastCheckTime && !shouldCheckForUpdate(state.lastCheckTime)) {
      return;
    }

    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const info = await checkForUpdate(packageJson.version);
      setState(prev => ({
        ...prev,
        updateInfo: info,
        isChecking: false,
        lastCheckTime: Date.now()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Check failed'
      }));
    }
  }, [state.isChecking, state.lastCheckTime]);

  // Apply an update
  const performUpdate = useCallback(async () => {
    if (!state.updateInfo?.available || state.isUpdating) return;

    setState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      await applyUpdate(state.updateInfo);
      // If we reach here, the update failed (process should have exited)
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: 'Update failed to apply'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }));
    }
  }, [state.updateInfo, state.isUpdating]);

  // Check on mount and periodically
  useEffect(() => {
    // Initial check after a short delay to not block app startup
    const timer = setTimeout(() => {
      checkNow(false);
    }, 3000);

    // Check every hour while app is running
    const interval = setInterval(() => {
      checkNow(false);
    }, 60 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return {
    updateAvailable: state.updateInfo?.available || false,
    currentVersion: packageJson.version,
    latestVersion: state.updateInfo?.latestVersion || packageJson.version,
    isChecking: state.isChecking,
    isUpdating: state.isUpdating,
    error: state.error,
    checkNow: () => checkNow(true),
    performUpdate
  };
}