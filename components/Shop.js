import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Shop() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Shop List</Text>
      {/* Your list/content goes here and will fill the whole screen */}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1, // This is the magic line that fills the screen
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold' }
});