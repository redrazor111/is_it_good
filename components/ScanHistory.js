import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_HISTORY } from '../utils/historyStorage';
import StatusCard from './StatusCard';

export default function ScanHistory({ onTriggerRerun }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('scan_history');
      if (stored) setHistory(JSON.parse(stored));
    };
    if (isFocused) load();
  }, [isFocused]);

  // --- NEW: DELETE FUNCTION ---
  const deleteHistoryItem = async (id) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      await AsyncStorage.setItem('scan_history', JSON.stringify(updatedHistory));
      if (selectedItem?.id === id) setSelectedItem(null); // Close modal if open
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const confirmDelete = (id) => {
    // For Web compatibility, Alert.alert might not show.
    // On mobile, this is a nice safety check.
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm("Delete this scan?")) deleteHistoryItem(id);
    } else {
      Alert.alert("Delete Scan", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteHistoryItem(id) }
      ]);
    }
  };

  const getStatusColor = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const status = parsed?.status?.toUpperCase();
      if (status === "UNSAFE") return "#FF5252";
      if (status === "CAUTION") return "#FFB300";
      if (status === "SAFE") return "#2E7D32";
    } catch { return "#757575"; }
    return "#757575";
  };

  const handleRerunFromHistory = () => {
    if (selectedItem?.uri) {
      onTriggerRerun(selectedItem.uri);
      setSelectedItem(null);
      navigation.navigate('Camera');
    }
  };

  const formatData = (itemData) => {
    if (!itemData) return { text: "", status: "gray" };
    return {
      text: typeof itemData === 'string' ? itemData : JSON.stringify(itemData),
      status: getStatusColor(itemData)
    };
  };

  return (
    <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Previous scanned products, up to {MAX_HISTORY} products.</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContentList}>
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
              <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => setSelectedItem(item)}>
                <View style={styles.historyIconBg}>
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyName}>{item.date}</Text>
                  <Text style={styles.viewResults}>View Analysis Results</Text>
                </View>

                {/* NEW: QUICK DELETE BUTTON */}
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id)}
                  style={styles.trashIcon}
                >
                  <MaterialCommunityIcons name="delete-outline" size={22} color="#FF5252" />
                </TouchableOpacity>

                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedItem} animationType="slide">
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Past Result</Text>

            <TouchableOpacity onPress={handleRerunFromHistory}>
              <MaterialCommunityIcons name="play-circle" size={28} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {selectedItem && (
              <>
                <Image source={{ uri: selectedItem.uri }} style={styles.fullImage} />

                <TouchableOpacity style={styles.rerunLargeButton} onPress={handleRerunFromHistory}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                  <Text style={styles.rerunLargeText}>Re-run This Analysis</Text>
                </TouchableOpacity>

                {/* MODAL DELETE BUTTON */}
                <TouchableOpacity
                  style={styles.deleteLink}
                  onPress={() => confirmDelete(selectedItem.id)}
                >
                  <Text style={styles.deleteLinkText}>Delete this entry</Text>
                </TouchableOpacity>

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
    letterSpacing: -0.5,
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
    paddingVertical: 40,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  historyIconBg: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
    overflow: 'hidden',
    marginRight: 12,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  historyDetails: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  viewResults: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  trashIcon: {
    padding: 10,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212529',
  },
  modalScroll: {
    padding: 20,
  },
  fullImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#E9ECEF',
  },
  rerunLargeButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  rerunLargeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  deleteLink: {
    marginTop: 16,
    marginBottom: 24,
    padding: 8,
    alignSelf: 'center',
  },
  deleteLinkText: {
    color: '#FA5252',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});