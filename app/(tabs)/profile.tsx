import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Surface, Divider, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { uploadAPI } from '../../lib/api';

export default function ProfileScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const { user, setUser, habits } = useHabits();
  const router = useRouter();

  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const totalStreaks = habits.reduce((acc, curr) => acc + curr.currentStreak, 0);

  // Pick Image & Upload to Cloudinary
  const handlePickAndUploadAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll permission is required to change profile picture!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setUploadingImage(true);

        try {
          const formData = new FormData();
          formData.append('image', {
            uri: imageUri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          } as any);

          // Upload to Cloudinary via Express Backend
          const res = await uploadAPI.uploadAvatar(formData, 'jwt_token');

          if (res.url || res.secure_url) {
            const newUrl = res.url || res.secure_url;
            setUser((prev) => ({ ...prev, avatarUrl: newUrl }));
            Alert.alert('Success 🎉', 'Profile picture updated & saved on Cloudinary cloud!');
          } else {
            // Local state fallback if backend response format differs
            setUser((prev) => ({ ...prev, avatarUrl: imageUri }));
          }
        } catch (uploadErr: any) {
          console.log('Cloudinary Upload Fallback to local URI:', uploadErr.message);
          setUser((prev) => ({ ...prev, avatarUrl: imageUri }));
          Alert.alert('Updated ✨', 'Profile picture updated!');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error: any) {
      console.warn('Image picker error:', error.message);
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    setUser((prev) => ({
      ...prev,
      name: editName.trim(),
      email: editEmail.trim() || prev.email,
    }));
    setEditModalVisible(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            My Profile 👤
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => router.push('/settings')}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* User Card */}
      <Surface style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Avatar with Cloudinary Upload Trigger */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handlePickAndUploadAvatar}
          activeOpacity={0.8}
          disabled={uploadingImage}
        >
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          {uploadingImage ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          ) : (
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="camera-plus" size={14} color="#FFF" />
            </View>
          )}

          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelBadgeText}>Lvl {user.currentLevel}</Text>
          </View>
        </TouchableOpacity>

        <Text variant="titleLarge" style={[styles.userName, { color: colors.text }]}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
        <Text style={[styles.joinedText, { color: colors.primary }]}>
          Member since {user.joinedDate}
        </Text>

        {/* Edit Profile Action Button */}
        <TouchableOpacity
          style={[styles.editProfileBtn, { borderColor: colors.primary }]}
          onPress={() => {
            setEditName(user.name);
            setEditEmail(user.email);
            setEditModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={18} color={colors.primary} />
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile Details</Text>
        </TouchableOpacity>

        {/* XP Progress Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpLabelRow}>
            <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>XP Progress</Text>
            <Text style={[styles.xpValue, { color: colors.gold }]}>{user.xpPoints} / 2000 XP</Text>
          </View>
          <View style={[styles.xpBarTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.xpBarFill,
                { backgroundColor: colors.primary, width: `${(user.xpPoints / 2000) * 100}%` },
              ]}
            />
          </View>
        </View>
      </Surface>

      {/* Quick Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Lifetime Overview</Text>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="check-circle" size={28} color={colors.accent} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {user.totalHabitsCompleted}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </Surface>

        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="fire" size={28} color={colors.gold} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {totalStreaks}d
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Streaks</Text>
        </Surface>

        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="target" size={28} color={colors.primary} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {totalCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Habits</Text>
        </Surface>
      </View>

      {/* App Settings Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Preferences</Text>

      <Surface style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Dark / Light Mode Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'weather-sunny'}
                size={22}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {isDark ? 'Dark Theme' : 'Light Theme'}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                {isDark ? 'Sleek dark mode enabled' : 'Clean light mode enabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor={isDark ? '#FFF' : '#FFF'}
          />
        </View>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        {/* Detailed Settings Route */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="cog-outline" size={22} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>All App Settings</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Auto Night mode, reminders & data</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </Surface>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: colors.error }]}
        onPress={() => router.replace('/auth')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out of App</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>
            ✏️ Edit Profile Details
          </Text>

          <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
          <TextInput
            mode="outlined"
            placeholder="Your Name"
            value={editName}
            onChangeText={setEditName}
            style={[styles.modalInput, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
          <TextInput
            mode="outlined"
            placeholder="Your Email"
            value={editEmail}
            onChangeText={setEditEmail}
            style={[styles.modalInput, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
          >
            Save Profile Changes 💾
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpContainer: {
    width: '100%',
    marginTop: 18,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    width: '31%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  settingsCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  settingSub: {
    fontSize: 12,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalContent: {
    padding: 22,
    margin: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    marginBottom: 12,
  },
  saveModalBtn: {
    marginTop: 10,
    borderRadius: 14,
  },
});
