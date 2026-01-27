import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Ingredients({ imageUri }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      {/* Matching Header Style */}
      <View style={styles.header}>
        <Text style={styles.title}>Scanned Product</Text>
        <Text style={styles.subtitle}>Image preview of your last scan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {imageUri ? (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${imageUri}` }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cardBody}>
              <MaterialCommunityIcons name="nutrition" size={20} color="#2E7D32" />
              <Text style={styles.cardText}>Captured Ingredient Label</Text>
            </View>
          </View>
        ) : (
          /* Matching the Shop placeholder style */
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons name="image-off-outline" size={60} color="#E0E0E0" />
            <Text style={styles.placeholderText}>
              No image scanned yet. Go to the Camera tab to analyze a product.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#FBFBFB', // Same off-white background
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  cardText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});