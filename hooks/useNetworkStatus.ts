import { useEffect, useState } from 'react';

import NetInfo from '@react-native-community/netinfo';

// Exposes a single `isOnline` flag. Screens that need the network (problem
// input, sign-in) use it to show a warm offline message instead of failing.
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return unsubscribe;
  }, []);

  return { isOnline };
}
