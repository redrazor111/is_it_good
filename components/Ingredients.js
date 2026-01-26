import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Ingredients({ imageUri }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Scanned Product</Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageUri}` }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image scanned yet.</Text>
        </View>
      )}

      <Text style={styles.subtitle}>Ingredients List Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  subtitle: { fontSize: 18, color: '#666', marginTop: 10 },
  imageContainer: {
    width: width * 0.9,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: width * 0.9,
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999'
  }
});