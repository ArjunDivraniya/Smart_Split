import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { BackHandler, Platform } from 'react-native';
import { useCallback } from 'react';

type ResolveFallback = () => Href;
type BackNavigationOptions = {
  alwaysUseFallback?: boolean;
};

export const useBackNavigation = (
  fallbackRoute: Href,
  resolveFallback?: ResolveFallback,
  options?: BackNavigationOptions
) => {
  const router = useRouter();
  const alwaysUseFallback = options?.alwaysUseFallback === true;

  const handleBack = useCallback(() => {
    const canGoBack =
      typeof (router as any).canGoBack === 'function' ? (router as any).canGoBack() : false;

    if (!alwaysUseFallback && canGoBack) {
      router.back();
      return true;
    }

    const target = resolveFallback ? resolveFallback() : fallbackRoute;
    router.replace(target);
    return true;
  }, [alwaysUseFallback, fallbackRoute, resolveFallback, router]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return () => undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => subscription.remove();
    }, [handleBack])
  );

  return handleBack;
};
