import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = (): boolean => Platform.OS !== 'web';

export const hapticSelection = async (): Promise<void> => {
  if (!canHaptic()) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // no-op
  }
};

export const hapticImpactLight = async (): Promise<void> => {
  if (!canHaptic()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // no-op
  }
};

export const hapticImpactHeavy = async (): Promise<void> => {
  if (!canHaptic()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // no-op
  }
};

export const hapticNotifySuccess = async (): Promise<void> => {
  if (!canHaptic()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // no-op
  }
};

export const hapticNotifyWarning = async (): Promise<void> => {
  if (!canHaptic()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // no-op
  }
};
