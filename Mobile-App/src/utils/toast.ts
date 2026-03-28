import Toast from 'react-native-toast-message';

const BASE_TOAST_OPTIONS = {
  position: 'bottom' as const,
  bottomOffset: 90,
  visibilityTime: 3000,
  autoHide: true,
};

export const showSuccessToast = (message: string): void => {
  Toast.show({
    type: 'success',
    text1: message,
    ...BASE_TOAST_OPTIONS,
  });
};

export const showErrorToast = (message: string): void => {
  Toast.show({
    type: 'error',
    text1: message,
    ...BASE_TOAST_OPTIONS,
  });
};

export const showInfoToast = (message: string): void => {
  Toast.show({
    type: 'info',
    text1: message,
    ...BASE_TOAST_OPTIONS,
  });
};
