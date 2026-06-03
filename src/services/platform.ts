import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const isCapacitorAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return window.innerWidth < 768 || isCapacitorAndroid();
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || isCapacitorAndroid());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
