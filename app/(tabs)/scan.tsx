import React from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScanActionCard } from '@/components/scan/ScanActionCard';
import { ManualAddCard } from '@/components/scan/ManualAddCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

export default function ScanScreen() {
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan receipts.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });
    if (!result.canceled) {
      Alert.alert('Photo captured', 'Receipt review flow will be available in a future update.');
    }
  };

  const uploadFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });
    if (!result.canceled) {
      Alert.alert('Image selected', 'Receipt review flow will be available in a future update.');
    }
  };

  const addItemManually = () => {
    Alert.alert('Add Item', 'Manual item entry form will be available in a future update.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Scan"
        rightAction={{
          onPress: () => {},
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScanActionCard
          onTakePhoto={takePhoto}
          onUploadFromGallery={uploadFromGallery}
        />
        <View style={styles.spacer} />
        <ManualAddCard onAddItem={addItemManually} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  spacer: {
    height: SPACING.xl,
  },
});
