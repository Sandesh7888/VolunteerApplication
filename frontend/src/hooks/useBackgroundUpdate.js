import { useEffect, useCallback } from 'react';
import { useApi } from '../useApi';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Custom hook to poll the backend every 10 minutes (or custom interval) for updates.
 * By default, checks user notifications or can be customized for other update types.
 *
 * @param {Function} onUpdateReceived Callback triggered when updates are successfully fetched
 * @param {number} intervalMs Polling interval in milliseconds (defaults to 10 minutes: 600,000 ms)
 */
export const useBackgroundUpdate = (onUpdateReceived, intervalMs = 600000) => {
  const { apiCall } = useApi();
  const { user } = useAuth();

  const checkForUpdates = useCallback(async () => {
    if (!user || !user.userId) return;

    try {
      console.log(`[Background Poll] Checking for updates at ${new Date().toLocaleTimeString()}...`);
      
      // Call notifications endpoint as the primary check for updates.
      // You can modify this to call a generic "/updates" or "/status" endpoint if needed.
      const updates = await apiCall(`/notifications/${user.userId}`);
      
      if (onUpdateReceived) {
        onUpdateReceived(updates);
      }
    } catch (error) {
      console.error('[Background Poll] Error checking for updates:', error);
    }
  }, [user, apiCall, onUpdateReceived]);

  useEffect(() => {
    if (!user) return;

    // Run immediately on mount/user change
    checkForUpdates();

    // Set up 10-minute interval
    const interval = setInterval(checkForUpdates, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [user, checkForUpdates, intervalMs]);

  return { checkForUpdates };
};
