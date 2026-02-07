import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { GOOGLE_API_KEY_IN_RC } from './constants';

const API_KEYS = {
  google: GOOGLE_API_KEY_IN_RC
};

export function useSubscriptionStatus() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const setupAndCheckStatus = async () => {
      try {
        // 1. Configure
        await Purchases.configure({ apiKey: API_KEYS.google });

        // 2. Initial check
        const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
        checkProStatus(customerInfo);

        // 3. Listen for changes (like if a purchase finishes or a refund happens)
        const listener = (info: CustomerInfo) => checkProStatus(info);
        Purchases.addCustomerInfoUpdateListener(listener);

      } catch (e) {
        console.error("Subscription check failed:", e);
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    const checkProStatus = (info: CustomerInfo) => {
      // Use 'unlimited_searches' or whatever you named your Entitlement
      if (info.entitlements.active['unlimited_searches'] !== undefined) {
        setIsPro(true);
      } else {
        setIsPro(false);
      }
    };

    setupAndCheckStatus();
  }, []);

  return { isPro, loading };
}