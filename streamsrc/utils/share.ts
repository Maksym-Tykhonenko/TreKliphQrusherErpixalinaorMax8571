import { Share } from 'react-native';

export const shareText = async (message: string, title?: string) => {
  try {
    await Share.share({ message, title });
  } catch {
    // ignore
  }
};
