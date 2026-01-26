import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Shop() {
  const insets = useSafeAreaInsets();
  const trackingId = "softywareai-21";
  const amazonUrl = `https://www.amazon.co.uk/?tag=${trackingId}`;

  const handleOpenAmazon = async () => {
    const supported = await Linking.canOpenURL(amazonUrl);
    if (supported) {
      await Linking.openURL(amazonUrl);
    } else {
      console.log("Don't know how to open URI: " + amazonUrl);
    }
  };

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop Alternatives</Text>
        <Text style={styles.subtitle}>Safe products found for you</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.placeholderContainer}>
          <MaterialCommunityIcons name="cart-outline" size={60} color="#E0E0E0" />
          <Text style={styles.placeholderText}>Your safe alternatives will appear here after a scan.</Text>

          <TouchableOpacity style={styles.amazonButton} onPress={handleOpenAmazon}>
            <MaterialCommunityIcons name="cart" size={20} color="#000" />
            <Text style={styles.amazonButtonText}>Shop on Amazon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* COMPLIANCE FOOTER: Amazon requires this disclosure */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <Text style={styles.disclosureText}>
          As an Amazon Associate, I earn from qualifying purchases.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 15,
    marginBottom: 25,
    fontSize: 16,
    lineHeight: 22,
  },
  amazonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900', // Amazon Orange
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amazonButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  disclosureText: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});