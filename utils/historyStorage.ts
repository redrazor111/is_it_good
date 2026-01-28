import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const MAX_HISTORY = 10;

export const saveToHistory = async (base64Data: string, analysisData: any) => {
  try {
    // Check if the module is actually loaded
    const isFileSystemAvailable = !!(FileSystem as any).documentDirectory;
    let finalUri = '';

    if (!isFileSystemAvailable) {
      // FALLBACK: Store as Base64 string directly if FileSystem is undefined
      // This works on Web AND on Android devices with linking issues
      console.warn("FileSystem unavailable, falling back to Base64 storage");
      finalUri = `data:image/jpeg;base64,${base64Data}`;
    } else {
      // STANDARD: Save to physical file
      const docDir = (FileSystem as any).documentDirectory!;
      const filename = `scan_${Date.now()}.jpg`;
      const fileUri = `${docDir}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: (FileSystem as any).EncodingType.Base64,
      });
      finalUri = fileUri;
    }

    // 2. Load existing history
    const stored = await AsyncStorage.getItem('scan_history');
    let history = stored ? JSON.parse(stored) : [];

    // 3. Cleanup: Only delete physical files if FileSystem is working
    if (isFileSystemAvailable && history.length >= MAX_HISTORY) {
      const oldest = history[history.length - 1];
      if (oldest?.uri?.startsWith('file://')) {
        await FileSystem.deleteAsync(oldest.uri, { idempotent: true }).catch(() => {});
      }
    }

    // 4. Create and Save Entry
    const newEntry = {
      id: Date.now().toString(),
      uri: finalUri,
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      analysis: analysisData,
    };

    history = [newEntry, ...history].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem('scan_history', JSON.stringify(history));

  } catch (e: any) {
    console.error("History Save Error:", e);
    Alert.alert("History Error", "Could not save scan to history. " + e);
  }
};