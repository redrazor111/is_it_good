import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PremiumModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconBg}>
            <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
          </View>

          <Text style={styles.title}>Unlock IsItGood? Premium</Text>
          <Text style={styles.description}>
            You've reached your 2 daily scans. Upgrade to Premium for unlimited scans,
            detailed health insights, and ad-free shopping.
          </Text>

          <TouchableOpacity style={styles.upgradeBtn} onPress={() => {/* Logic for payment */}}>
            <Text style={styles.upgradeText}>Go Premium for only - $0.99/month</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
  iconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF9C4', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center' },
  description: { fontSize: 15, color: '#666', textAlign: 'center', marginVertical: 15, lineHeight: 22 },
  upgradeBtn: { backgroundColor: '#2E7D32', width: '100%', padding: 16, borderRadius: 15, alignItems: 'center' },
  upgradeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  closeBtn: { marginTop: 15 },
  closeText: { color: '#9E9E9E', fontWeight: '600' }
});