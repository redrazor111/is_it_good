import { Camera } from 'expo-camera';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Local Imports
import { saveToHistory } from '@/utils/historyStorage';
import { checkQuota, incrementQuota } from '@/utils/quotaService';
import Ingredients from '../../components/Ingredients';
import PremiumModal from '../../components/PremiumModal';
import ScanHistory from '../../components/ScanHistory';
import Scanner from '../../components/Scanner';
import Shop from '../../components/Shop';
import StatusCard from '../../components/StatusCard';
import { analyzeImageWithGemini } from '../../utils/geminiService';
import { useSubscriptionStatus } from '../../utils/subscription';

const Tab = createMaterialTopTabNavigator();

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface AnalysisState {
  text: string;
  status: string;
}

// --- CAMERA SCREEN COMPONENT ---
function CameraScreen({ onImageCaptured, onRecommendationsFound,
  pendingRerunUri,
  onRerunHandled }: {
    onImageCaptured: (base64: string) => void,
    onRecommendationsFound: (products: string[]) => void,
    pendingRerunUri: string | null,
    onRerunHandled: () => void
  }) {
  const insets = useSafeAreaInsets();
  const initialState: AnalysisState = { text: "", status: "gray" };
  const lastImageRef = useRef<string | null>(null);

  const [foodAnalysis, setFoodAnalysis] = useState<AnalysisState>(initialState);
  const [skinAnalysis, setSkinAnalysis] = useState<AnalysisState>(initialState);
  const [makeupAnalysis, setMakeupAnalysis] = useState<AnalysisState>(initialState);
  const [vegAnalysis, setVegAnalysis] = useState<AnalysisState>(initialState);
  const [veganAnalysis, setVeganAnalysis] = useState<AnalysisState>(initialState);
  const [halalAnalysis, setHalalAnalysis] = useState<AnalysisState>(initialState);
  const [alcoholFreeAnalysis, setAlcoholFreeAnalysis] = useState<AnalysisState>(initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const { isPro, loading } = useSubscriptionStatus();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (pendingRerunUri) {
      handleScan(pendingRerunUri);
      onRerunHandled();
    }
  }, [pendingRerunUri]);

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
    setMakeupAnalysis(initialState);
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

    setFoodAnalysis(initialState);
    setSkinAnalysis(initialState);
    setMakeupAnalysis(initialState);
    setVegAnalysis(initialState);
    setVeganAnalysis(initialState);
    setHalalAnalysis(initialState);
    setAlcoholFreeAnalysis(initialState);

    setIsLoading(true);
    lastImageRef.current = base64Data;
    onImageCaptured(base64Data);

    try {
      const rawResponse = await analyzeImageWithGemini(base64Data);
      const data = JSON.parse(rawResponse);
      await incrementQuota();
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
      updateState(data.makeup, setMakeupAnalysis);
      updateState(data.veg, setVegAnalysis);
      updateState(data.vegan, setVeganAnalysis);
      updateState(data.halal, setHalalAnalysis);
      updateState(data.alcohol, setAlcoholFreeAnalysis);

      await saveToHistory(base64Data, data);
    } catch (e) {
      console.error("Batch Analysis Failed", e);
      const errorState = { text: "Analysis failed", status: "#757575" };
      [setFoodAnalysis, setSkinAnalysis, setMakeupAnalysis, setVegAnalysis, setVeganAnalysis, setHalalAnalysis, setAlcoholFreeAnalysis]
        .forEach(setter => setter(errorState));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = async () => {
    const status = await checkQuota();
    if (status === 'LIMIT_REACHED') {
      setShowPremium(true);
      return;
    }

    if (lastImageRef.current) {
      setFoodAnalysis(initialState);
      setSkinAnalysis(initialState);
      setMakeupAnalysis(initialState);
      setVegAnalysis(initialState);
      setVeganAnalysis(initialState);
      setHalalAnalysis(initialState);
      setAlcoholFreeAnalysis(initialState);

      handleScan(lastImageRef.current);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  if (loading) return <ActivityIndicator />;

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
          {isPro ? (
            <>
              <StatusCard title="Safe to Eat" data={foodAnalysis} icon="food-apple" isParentLoading={isLoading} />
              <StatusCard title="Skin Safety" data={skinAnalysis} icon="face-man-shimmer" isParentLoading={isLoading} />
              <StatusCard
                title="Makeup Safety"
                data={makeupAnalysis}
                icon="lipstick"
                isParentLoading={isLoading}
              />
              <StatusCard title="Vegetarian" data={vegAnalysis} icon="leaf" isParentLoading={isLoading} />
              <StatusCard title="Vegan" data={veganAnalysis} icon="sprout" isParentLoading={isLoading} />
              <StatusCard title="Halal" data={halalAnalysis} icon="star-crescent" isParentLoading={isLoading} />
              <StatusCard title="Alcohol Free" data={alcoholFreeAnalysis} icon="glass-cocktail-off" isParentLoading={isLoading} />
            </>
          ) : (
            <>
              <StatusCard title="Safe to Eat" data={foodAnalysis} icon="food-apple" isParentLoading={isLoading} />
              <StatusCard title="Skin Safety" data={skinAnalysis} icon="face-man-shimmer" isParentLoading={isLoading} />
            </>
          )}
        </ScrollView>
      </View>

      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
      />
    </View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [pendingRerunUri, setPendingRerunUri] = useState<string | null>(null);
  const { isPro } = useSubscriptionStatus();

  const iconMap: Record<string, IoniconsName> = {
    Camera: 'camera-outline',
    Product: 'nutrition-outline',
    History: 'time-outline',
    Shop: 'cart-outline',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'none',
            marginTop: 0, // Keeps label close to icon
            paddingBottom: 5 // Space below the text
          },
          tabBarIndicatorStyle: { height: 0 },
          tabBarStyle: {
            backgroundColor: '#fff',
            // Increase height slightly to give the icons "room" to move up
            height: 75 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
            paddingTop: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          },
          swipeEnabled: true,
          // We wrap the icon in a View to apply custom positioning
          tabBarIcon: ({ color }) => {
            const iconName = iconMap[route.name] || 'help-circle-outline';
            return (
              <View style={{ marginBottom: 2 }}>
                <Ionicons name={iconName} size={26} color={color} />
              </View>
            );
          },
          // This setting is crucial for Material Top Tabs to align items correctly
          tabBarItemStyle: {
            flexDirection: 'column',
            justifyContent: 'center',
            height: 65, // Fixed height for the touchable area
          },
        })}
      >
        <Tab.Screen name="Camera">
          {() => (
            <CameraScreen
              onImageCaptured={setScannedImage}
              onRecommendationsFound={setRecommendations}
              pendingRerunUri={pendingRerunUri}
              onRerunHandled={() => setPendingRerunUri(null)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Product">
          {() => <Ingredients imageUri={scannedImage} />}
        </Tab.Screen>
        {isPro && (
          <Tab.Screen name="History">
            {() => <ScanHistory onTriggerRerun={(uri: string) => setPendingRerunUri(uri)} />}
          </Tab.Screen>
        )}
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

const styles = StyleSheet.create({
  cameraTabContainer: {
    flex: 1,
    backgroundColor: '#FBFBFB'
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 10,
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
    height: '35%',
    backgroundColor: '#000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  resultsHalf: {
    flex: 1,
    paddingHorizontal: 20
  },
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
  viewfinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewfinderBox: {
    width: 260,
    height: 160,
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#4CAF50',
    borderWidth: 4,
    borderRadius: 4
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    height: 3,
    backgroundColor: '#4CAF50',
    width: '100%',
    borderRadius: 2
  },
  placeholderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollPadding: {
    paddingBottom: 30
  },
});