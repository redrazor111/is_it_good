import { useEffect, useState } from 'react';

// Replace with your actual API Keys from the RevenueCat Dashboard
const API_KEYS = {
  apple: "appl_api_key_here",
  google: "goog_api_key_here"
};

export function useSubscriptionStatus() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const setupAndCheckStatus = async () => {
      try {
        // if (Platform.OS === 'ios') {
        //   await Purchases.configure({ apiKey: API_KEYS.apple });
        // } else {
        //   await Purchases.configure({ apiKey: API_KEYS.google });
        // }

        // const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
        // const activeEntitlements = customerInfo.entitlements.active;

        // if (activeEntitlements['premium'] !== undefined) {
          setIsPro(true);
        // } else {
        //   setIsPro(false);
        // }
      } catch (e) {
        console.error("Subscription check failed:", e);
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    setupAndCheckStatus();
  }, []);

  return { isPro, loading };
}