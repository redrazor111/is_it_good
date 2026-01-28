import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native'; // 1. Add this
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatusCard from './StatusCard';

export default function ScanHistory() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('scan_history');
        if (stored) setHistory(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    if (isFocused) load();
  }, [isFocused]);

  const getStatusColor = (data) => {
    try {
      // Handle both object and string formats
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const status = parsed?.status?.toUpperCase();
      if (status === "UNSAFE") return "#FF5252";
      if (status === "CAUTION") return "#FFB300";
      if (status === "SAFE") return "#2E7D32";
    } catch {
      return "#757575";
    }
    return "#757575";
  };

  const formatData = (itemData) => {
    if (!itemData) return { text: "", status: "gray" };
    return {
      text: typeof itemData === 'string' ? itemData : JSON.stringify(itemData),
      status: getStatusColor(itemData) // Calculate color here
    };
  };

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Previous 5 scanned products</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentList} showsVerticalScrollIndicator={false}>
        {history.length === 0 && (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons name="history" size={60} color="#E0E0E0" />
            <Text style={styles.placeholderText}>No scans found yet.</Text>
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionLabel}>RECENT SCANS</Text>
            {history.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyCard}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.historyIconBg}>
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyName}>{item.date}</Text>
                  <Text style={styles.viewResults}>View Analysis Results</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Past Result</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {selectedItem && (
              <Image source={{ uri: selectedItem.uri }} style={styles.fullImage} resizeMode="cover" />
            )}

            {selectedItem?.analysis && (
              <>
                <StatusCard title="Food Safety" data={formatData(selectedItem.analysis.food)} icon="food-apple" />
                <StatusCard title="Skin Safety" data={formatData(selectedItem.analysis.skin)} icon="face-man-shimmer" />
                <StatusCard title="Vegetarian" data={formatData(selectedItem.analysis.veg || selectedItem.analysis.vegetarian)} icon="leaf" />
                <StatusCard title="Vegan" data={formatData(selectedItem.analysis.vegan)} icon="sprout" />
                <StatusCard title="Halal" data={formatData(selectedItem.analysis.halal)} icon="star-crescent" />
                <StatusCard title="Alcohol Free" data={formatData(selectedItem.analysis.alcohol)} icon="glass-cocktail-off" />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  scrollContentList: {
    padding: 20,
    paddingBottom: 40,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40, // Keeps it at the top area
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 15,
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
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  historyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    marginRight: 15,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  historyDetails: {
    flex: 1,
    marginRight: 10,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  viewResults: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  modalContent: { flex: 1, backgroundColor: '#FBFBFB' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalScroll: { padding: 20 },
  fullImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20 }
});