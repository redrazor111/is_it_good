import { Camera } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Navigation & Safe Area Imports
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Local Imports
import Ingredients from '../../components/Ingredients';
import Scanner from '../../components/Scanner';
import Shop from '../../components/Shop';
import { analyzeImageWithGemini } from '../../utils/geminiService';

const Tab = createBottomTabNavigator();

// --- CAMERA SCREEN COMPONENT ---
function CameraScreen({ onImageCaptured }: { onImageCaptured: (base64: string) => void }) {
  const initialState = { text: "", status: "gray" };

  const [foodAnalysis, setFoodAnalysis] = useState(initialState);
  const [skinAnalysis, setSkinAnalysis] = useState(initialState);
  const [vegAnalysis, setVegAnalysis] = useState(initialState);
  const [veganAnalysis, setVeganAnalysis] = useState(initialState);
  const [halalAnalysis, setHalalAnalysis] = useState(initialState);
  const [alcoholFreeAnalysis, setAlcoholFreeAnalysis] = useState(initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [isLoading]);

  const handleReset = () => {
    setFoodAnalysis(initialState);
    setSkinAnalysis(initialState);
    setVegAnalysis(initialState);
    setVeganAnalysis(initialState);
    setHalalAnalysis(initialState);
    setAlcoholFreeAnalysis(initialState);
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const getStatusColor = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const status = parsed.status?.toUpperCase();
      if (status === "UNSAFE") return "#FF5252";
      if (status === "CAUTION") return "#FFB300";
      if (status === "SAFE") return "#2E7D32";
    } catch (e) {
      const upper = jsonString.toUpperCase();
      if (upper.includes("UNSAFE")) return "#FF5252";
      if (upper.includes("CAUTION")) return "#FFB300";
      if (upper.includes("SAFE")) return "#2E7D32";
    }
    return "#757575";
  };

  const handleScan = async (base64Data: string) => {
    setIsLoading(true);
    onImageCaptured(base64Data);
    try {
      const [foodRes, skinRes, vegRes, veganRes, halalRes, alcoholRes] = await Promise.all([
        analyzeImageWithGemini(base64Data, 'food'),
        analyzeImageWithGemini(base64Data, 'skin'),
        analyzeImageWithGemini(base64Data, 'veg'),
        analyzeImageWithGemini(base64Data, 'vegan'),
        analyzeImageWithGemini(base64Data, 'halal'),
        analyzeImageWithGemini(base64Data, 'alcohol')
      ]);

      setFoodAnalysis({ text: foodRes, status: getStatusColor(foodRes) });
      setSkinAnalysis({ text: skinRes, status: getStatusColor(skinRes) });
      setVegAnalysis({ text: vegRes, status: getStatusColor(vegRes) });
      setVeganAnalysis({ text: veganRes, status: getStatusColor(veganRes) });
      setHalalAnalysis({ text: halalRes, status: getStatusColor(halalRes) });
      setAlcoholFreeAnalysis({ text: alcoholRes, status: getStatusColor(alcoholRes) });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.cameraTabContainer}>
      <View style={styles.cameraViewHalf}>
        {hasPermission ? (
          <>
            <Scanner onScan={handleScan} disabled={isLoading} />
            <View style={styles.viewfinderOverlay} pointerEvents="none">
              <View style={styles.viewfinderBox}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                {isLoading && <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholderCenter}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>

      <View style={styles.resultsHalf}>
        <View style={styles.headerRow}>
          <Text style={styles.resultsHeader}>Analysis Results</Text>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.resetButton}
            activeOpacity={0.6}
          >
            <Ionicons name="refresh" size={16} color="#2E7D32" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          <StatusCard title="Safe to Eat" data={foodAnalysis} icon="food-apple" />
          <StatusCard title="Safe for Skin" data={skinAnalysis} icon="face-man-shimmer" />
          <StatusCard title="Vegetarian" data={vegAnalysis} icon="leaf" />
          <StatusCard title="Vegan" data={veganAnalysis} icon="sprout" />
          <StatusCard title="Halal" data={halalAnalysis} icon="star-crescent" />
          <StatusCard title="Alcohol Free" data={alcoholFreeAnalysis} icon="glass-cocktail-off" />
        </ScrollView>
      </View>
    </View>
  );
}

// --- NAVIGATION WRAPPER (AppContent & App as before) ---
function AppContent() {
  const insets = useSafeAreaInsets();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  return (
<View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
            ...styles.shadow
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            if (route.name === 'Camera') iconName = 'camera-outline';
            else if (route.name === 'Ingredients') iconName = 'nutrition-outline';
            else if (route.name === 'Shop') iconName = 'cart-outline';
            return <Ionicons name={iconName} size={size + 2} color={color} />;
          },
        })}
        >
          {/* 2. Pass the setter to CameraScreen */}
          <Tab.Screen name="Camera">
            {() => <CameraScreen onImageCaptured={setScannedImage} />}
          </Tab.Screen>

          {/* 3. Pass the image to Ingredients */}
          <Tab.Screen name="Ingredients">
            {() => <Ingredients imageUri={scannedImage} />}
          </Tab.Screen>

          <Tab.Screen name="Shop" component={Shop} />
        </Tab.Navigator>
      </View>
    );
  }

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// --- STATUS CARD SUB-COMPONENT ---
const StatusCard = ({ title, data, icon }: { title: string, data: any, icon: string }) => {
  const [showSummary, setShowSummary] = useState(false);
  const hasData = !!data.text;

  // Reset expansion when data is cleared
  useEffect(() => {
    if (!hasData) setShowSummary(false);
  }, [hasData]);

  const getSummaryText = (jsonString: string) => {
    try { if (!jsonString) return ""; const parsed = JSON.parse(jsonString); return parsed.summary || jsonString; } catch { return jsonString; }
  };
  const getStatusText = (jsonString: string) => {
    try { if (!jsonString) return ""; const parsed = JSON.parse(jsonString); return parsed.status || "Pending"; } catch { return "Pending"; }
  };

  return (
    <TouchableOpacity
      activeOpacity={hasData ? 0.7 : 1}
      onPress={() => hasData && setShowSummary(!showSummary)}
      style={[styles.card, styles.shadow]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name={icon as any} size={22} color="#4CAF50" />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.cardLabel}>{title}</Text>
          <View style={[styles.statusPill, { backgroundColor: data.status + '15' }]}>
            <View style={[styles.dot, { backgroundColor: data.status }]} />
            <Text style={[styles.statusValue, { color: data.status }]}>
              {getStatusText(data.text)}
            </Text>
          </View>
        </View>
        {hasData && (
          <Ionicons
            name={showSummary ? "chevron-up" : "chevron-down"}
            size={20}
            color="#CCC"
          />
        )}
      </View>
      {showSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.analysisText}>{getSummaryText(data.text)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraTabContainer: { flex: 1, backgroundColor: '#FBFBFB' },
  cameraViewHalf: {
    height: '42%',
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden'
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
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetText: {
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