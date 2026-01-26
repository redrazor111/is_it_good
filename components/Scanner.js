import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Scanner({ onScan, disabled }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) return <View />;

  const takePicture = async () => {
    if (cameraRef.current && !disabled) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        imageType: 'jpg'
      });
      onScan(photo.base64);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Outer Ring */}
          <View style={styles.outerRing}>
            <TouchableOpacity
              disabled={disabled}
              style={[
                styles.captureBtn,
                disabled ? styles.disabledBtn : styles.enabledBtn
              ]}
              onPress={takePicture}
            >
              {disabled && <ActivityIndicator color="white" />}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Keeps content at the bottom
    alignItems: 'center',
    // CHANGED: Reduced from 20 to 10 to move it closer to the tabs
    marginBottom: 10,
  },
  outerRing: {
    width: 75, // Slightly smaller to fit better in the lower area
    height: 75,
    borderRadius: 37.5,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)', // Slight tint to make the white ring pop
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  enabledBtn: {
    backgroundColor: 'white',
  },
  disabledBtn: {
    backgroundColor: '#666',
  },
});