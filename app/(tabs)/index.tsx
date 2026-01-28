import { Camera } from 'expo-camera';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import { checkQuota, incrementQuota } from '@/utils/quotaService';
import Ingredients from '../../components/Ingredients';
import PremiumModal from '../../components/PremiumModal';
import Scanner from '../../components/Scanner';
import Shop from '../../components/Shop';
import { analyzeImageWithGemini } from '../../utils/geminiService';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// --- TYPES ---
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface AnalysisState {
  text: string;
  status: string;
}

interface StatusCardProps {
  title: string;
  data: AnalysisState;
  icon: MaterialIconName;
  isParentLoading: boolean;
}

// --- STATUS CARD SUB-COMPONENT ---
const StatusCard = ({ title, data, icon, isParentLoading }: StatusCardProps) => {
  const [showSummary, setShowSummary] = useState(false);
  const hasData = !!data.text;
  const isPending = isParentLoading && !hasData;

  useEffect(() => {
    if (!hasData) setShowSummary(false);
  }, [hasData]);

  const getSummaryText = (jsonString: string) => {
    try {
      if (!jsonString) return "";
      const parsed = JSON.parse(jsonString);
      return parsed.summary || jsonString;
    } catch { return jsonString; }
  };

  const getStatusText = (jsonString: string) => {
    if (isPending) return "Analyzing...";
    try {
      if (!jsonString) return "Waiting...";
      const parsed = JSON.parse(jsonString);
      return parsed.status || "Pending";
    } catch { return "Pending"; }
  };

  return (
    <TouchableOpacity
      activeOpacity={hasData ? 0.7 : 1}
      onPress={() => hasData && setShowSummary(!showSummary)}
      style={[styles.card, styles.shadow]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={22} color="#4CAF50" />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.cardLabel}>{title}</Text>
          <View style={[styles.statusPill, { backgroundColor: isPending ? '#F5F5F5' : data.status + '15' }]}>
            {isPending ? (
              <ActivityIndicator size="small" color="#4CAF50" style={{ marginRight: 6, transform: [{ scale: 0.7 }] }} />
            ) : (
              <View style={[styles.dot, { backgroundColor: data.status || '#757575' }]} />
            )}
            <Text style={[styles.statusValue, { color: isPending ? '#9E9E9E' : (data.status || '#757575') }]}>
              {getStatusText(data.text)}
            </Text>
          </View>
        </View>
        {hasData && (
          <Ionicons name={showSummary ? "chevron-up" : "chevron-down"} size={20} color="#CCC" />
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

// --- CAMERA SCREEN COMPONENT ---
function CameraScreen({ onImageCaptured, onRecommendationsFound }: { onImageCaptured: (base64: string) => void, onRecommendationsFound: (products: string[]) => void }) {
  const insets = useSafeAreaInsets();
  const initialState: AnalysisState = { text: "", status: "gray" };
  const lastImageRef = useRef<string | null>(null);

  const [foodAnalysis, setFoodAnalysis] = useState<AnalysisState>(initialState);
  const [skinAnalysis, setSkinAnalysis] = useState<AnalysisState>(initialState);
  const [vegAnalysis, setVegAnalysis] = useState<AnalysisState>(initialState);
  const [veganAnalysis, setVeganAnalysis] = useState<AnalysisState>(initialState);
  const [halalAnalysis, setHalalAnalysis] = useState<AnalysisState>(initialState);
  const [alcoholFreeAnalysis, setAlcoholFreeAnalysis] = useState<AnalysisState>(initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showPremium, setShowPremium] = useState(false);
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
    lastImageRef.current = null;
    setFoodAnalysis(initialState);
    setSkinAnalysis(initialState);
    setVegAnalysis(initialState);
    setVeganAnalysis(initialState);
    setHalalAnalysis(initialState);
    setAlcoholFreeAnalysis(initialState);
  };

  const getStatusColor = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const status = parsed.status?.toUpperCase();
      if (status === "UNSAFE") return "#FF5252";
      if (status === "CAUTION") return "#FFB300";
      if (status === "SAFE") return "#2E7D32";
    } catch {
      const upper = jsonString.toUpperCase();
      if (upper.includes("UNSAFE")) return "#FF5252";
      if (upper.includes("CAUTION")) return "#FFB300";
      if (upper.includes("SAFE")) return "#2E7D32";
    }
    return "#757575";
  };

  const handleScan = async (base64Data: string) => {
    const status = await checkQuota();
    if (status === 'LIMIT_REACHED') {
      setShowPremium(true);
      return;
    }

    setIsLoading(true);
    lastImageRef.current = base64Data;
    onImageCaptured(base64Data);

    try {
      const rawResponse = await analyzeImageWithGemini(base64Data);
      await incrementQuota();
      const data = JSON.parse(rawResponse);
      if (data.recommendations) {
        onRecommendationsFound(data.recommendations);
      }

      const updateState = (categoryData: any, setter: any) => {
        setter({
          text: JSON.stringify(categoryData),
          status: getStatusColor(JSON.stringify(categoryData))
        });
      };

      updateState(data.food, setFoodAnalysis);
      updateState(data.skin, setSkinAnalysis);
      updateState(data.veg, setVegAnalysis);
      updateState(data.vegan, setVeganAnalysis);
      updateState(data.halal, setHalalAnalysis);
      updateState(data.alcohol, setAlcoholFreeAnalysis);
    } catch (e) {
      console.error("Batch Analysis Failed", e);
      const errorState = { text: "Analysis failed", status: "#757575" };
      [setFoodAnalysis, setSkinAnalysis, setVegAnalysis, setVeganAnalysis, setHalalAnalysis, setAlcoholFreeAnalysis]
        .forEach(setter => setter(errorState));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = () => {
    if (lastImageRef.current) handleScan(lastImageRef.current);
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={styles.cameraTabContainer}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <Text style={styles.title}>Scan Image</Text>
        <Text style={styles.subtitle}>Scan ingredient label</Text>
      </View>

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
          <View style={styles.buttonGroup}>
            {lastImageRef.current && !isLoading && (
              <TouchableOpacity onPress={handleRerun} style={[styles.actionButton, { marginRight: 8 }]}>
                <Ionicons name="play-outline" size={16} color="#2E7D32" />
                <Text style={styles.actionText}>Re-run</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleReset} style={styles.actionButton}>
              <Ionicons name="refresh" size={16} color="#2E7D32" />
              <Text style={styles.actionText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
          <StatusCard title="Safe to Eat" data={foodAnalysis} icon="food-apple" isParentLoading={isLoading} />
          <StatusCard title="Safe for Skin" data={skinAnalysis} icon="face-man-shimmer" isParentLoading={isLoading} />
          <StatusCard title="Vegetarian" data={vegAnalysis} icon="leaf" isParentLoading={isLoading} />
          <StatusCard title="Vegan" data={veganAnalysis} icon="sprout" isParentLoading={isLoading} />
          <StatusCard title="Halal" data={halalAnalysis} icon="star-crescent" isParentLoading={isLoading} />
          <StatusCard title="Alcohol Free" data={alcoholFreeAnalysis} icon="glass-cocktail-off" isParentLoading={isLoading} />
        </ScrollView>
      </View>

      <PremiumModal
          visible={showPremium}
          onClose={() => setShowPremium(false)}
        />
    </View>
  );
}

// --- MAIN NAVIGATION WRAPPER ---
function AppContent() {
  const insets = useSafeAreaInsets();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const iconMap: Record<string, IoniconsName> = {
    Camera: 'camera-outline',
    Ingredients: 'nutrition-outline',
    Shop: 'cart-outline',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarIcon: ({ color, size }) => {
            const iconName = iconMap[route.name] || 'help-circle-outline';
            return <Ionicons name={iconName} size={size + 2} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Camera">
          {() => <CameraScreen onImageCaptured={setScannedImage} onRecommendationsFound={setRecommendations} />}
        </Tab.Screen>
        <Tab.Screen name="Ingredients">
          {() => <Ingredients imageUri={scannedImage} />}
        </Tab.Screen>
        <Tab.Screen name="Shop">
          {() => <Shop recommendedProducts={recommendations} />}
        </Tab.Screen>
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