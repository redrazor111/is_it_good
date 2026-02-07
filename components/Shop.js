import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function Shop({ recommendedProducts }) {
  const insets = useSafeAreaInsets();
  const trackingId = "softywareai-21";

  // Handles general Amazon Search for a specific product name
  const openAmazonSearch = async (productName) => {
    const query = encodeURIComponent(productName);
    const webUri = `https://www.amazon.co.uk/s?k=${query}&tag=${trackingId}`;
    const ios = `amazon://www.amazon.co.uk/s?k=${query}&tag=${trackingId}`;
    const android = `com.amazon.mobile.shopping://search/?k=${query}&tag=${trackingId}`;

    try {
      if (Platform.OS === 'android') {
        const canOpen = await Linking.canOpenURL(android);
        if (canOpen) {
          await Linking.openURL(android);
          return;
        }
      } else if(Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL(ios);
        if (canOpen) {
          await Linking.openURL(ios);
          return;
        }
      }
      await Linking.openURL(webUri);
    } catch (error) {
      Linking.openURL(webUri);
    }
  };

  // Handles the main "Shop on Amazon" button
  const handleOpenAmazonHome = async () => {
    const intentUri = `com.amazon.mobile.shopping://www.amazon.co.uk/?tag=${trackingId}`;
    const webUri = `https://www.amazon.co.uk/?tag=${trackingId}`;

    try {
      if (Platform.OS === 'android') {
        const canOpen = await Linking.canOpenURL(intentUri);
        if (canOpen) {
          await Linking.openURL(intentUri);
          return;
        }
      }
      await Linking.openURL(webUri);
    } catch (error) {
      Linking.openURL(webUri);
    }
  };

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop at Amazon</Text>
        <Text style={styles.subtitle}>Buy similar products from Amazon</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentList} showsVerticalScrollIndicator={false}>
        {recommendedProducts.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionLabel}>RECOMMENDED PRODUCTS</Text>
            {recommendedProducts.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={styles.productCard}
                onPress={() => openAmazonSearch(product)}
                activeOpacity={0.7}
              >
                <View style={styles.productIconBg}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color="#2E7D32" />
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product}
                  </Text>
                  <Text style={styles.viewOnAmazon}>View Product Details</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.placeholderContainer}>
          <MaterialCommunityIcons
            name={recommendedProducts.length > 0 ? "magnify" : "cart-outline"}
            size={60}
            color="#E0E0E0"
          />
          <Text style={styles.placeholderText}>
            {recommendedProducts.length > 0
              ? "Looking for something else?"
              : "Your products will appear here after a scan."}
          </Text>

          <TouchableOpacity style={styles.amazonButton} onPress={handleOpenAmazonHome}>
            <MaterialCommunityIcons name="cart" size={20} color="#000" />
            <Text style={styles.amazonButtonText}>Shop on Amazon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  scrollContentList: {
    padding: 20,
    paddingBottom: 40,
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
  listContainer: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 1,
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  productIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  viewOnAmazon: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  amazonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  amazonButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  amazonLinkSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  amazonLinkSmallText: {
    fontSize: 14,
    color: '#757575',
    marginRight: 5,
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