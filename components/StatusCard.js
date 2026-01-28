import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StatusCard({ title, data, icon, isParentLoading }) {
  const [showSummary, setShowSummary] = useState(false);

  // Safety check: ensure data exists to avoid "undefined" errors
  const hasData = !!(data && data.text);
  const isPending = isParentLoading && !hasData;

  useEffect(() => {
    if (!hasData) setShowSummary(false);
  }, [hasData]);

  const getSummaryText = (jsonString) => {
    try {
      if (!jsonString) return "";
      const parsed = JSON.parse(jsonString);
      return parsed.summary || jsonString;
    } catch { return jsonString; }
  };

  const getStatusText = (jsonString) => {
    if (isPending) return "Analyzing...";
    try {
      if (!jsonString) return "Waiting...";
      const parsed = JSON.parse(jsonString);
      return parsed.status || "Pending";
    } catch { return "Pending"; }
  };

  // Helper to ensure we always have a valid color
  const statusColor = data?.status || '#757575';

  return (
    <TouchableOpacity
      activeOpacity={hasData ? 0.7 : 1}
      onPress={() => hasData && setShowSummary(!showSummary)}
      style={[styles.card, styles.shadow]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={22} color="#2E7D32" />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.cardLabel}>{title}</Text>
          <View style={[styles.statusPill, { backgroundColor: isPending ? '#F5F5F5' : `${statusColor}20` }]}>
            {isPending ? (
              <ActivityIndicator size="small" color="#2E7D32" style={{ marginRight: 6, transform: [{ scale: 0.7 }] }} />
            ) : (
              <View style={[styles.dot, { backgroundColor: statusColor }]} />
            )}
            <Text style={[styles.statusValue, { color: isPending ? '#9E9E9E' : statusColor }]}>
              {getStatusText(data?.text)}
            </Text>
          </View>
        </View>
        {hasData && (
          <Ionicons name={showSummary ? "chevron-up" : "chevron-down"} size={20} color="#CCC" />
        )}
      </View>

      {showSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.analysisText}>{getSummaryText(data?.text)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 5,
    },
    cameraTabContainer: {
      flex: 1,
      backgroundColor: '#FBFBFB'
    },
    // In your Main Component styles:
    header: {
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: '#fff',
      zIndex: 10,        // Forces it above the camera
      elevation: 10,     // Required for Android z-indexing
      position: 'relative',
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
    cameraViewHalf: {
      height: '35%', // Slightly smaller to give header and results more breathing room
      backgroundColor: '#000',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: 'hidden',
    },
    resultsHalf: { flex: 1, paddingHorizontal: 20 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    resultsHeader: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1A1A1A',
      letterSpacing: -0.5,
    },
    buttonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#2E7D32',
      marginLeft: 4,
    },
    viewfinderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    viewfinderBox: { width: 260, height: 160, position: 'relative' },
    corner: { position: 'absolute', width: 24, height: 24, borderColor: '#4CAF50', borderWidth: 4, borderRadius: 4 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    scanLine: { height: 3, backgroundColor: '#4CAF50', width: '100%', borderRadius: 2 },
    placeholderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollPadding: { paddingBottom: 30 },
    card: {
      backgroundColor: '#fff',
      borderRadius: 18,
      marginBottom: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.03)'
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#F1F8E9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    titleColumn: { flex: 1 },
    cardLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#9E9E9E',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusValue: { fontSize: 15, fontWeight: '700' },
    summaryContainer: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#F5F5F5'
    },
    analysisText: { fontSize: 14, color: '#444', lineHeight: 22 },
  });