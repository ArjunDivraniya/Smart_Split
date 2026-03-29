import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Food & Dining', icon: 'restaurant', color: COLORS.coral, enabled: true },
  { id: '2', name: 'Transportation', icon: 'car', color: COLORS.amber, enabled: true },
  { id: '3', name: 'Entertainment', icon: 'play-circle', color: COLORS.violet, enabled: true },
  { id: '4', name: 'Shopping', icon: 'bag', color: COLORS.mint, enabled: true },
  { id: '5', name: 'Bills & Utilities', icon: 'flash', color: COLORS.amber, enabled: true },
  { id: '6', name: 'Healthcare', icon: 'medkit', color: COLORS.coral, enabled: true },
  { id: '7', name: 'Education', icon: 'school', color: COLORS.violetLight, enabled: true },
  { id: '8', name: 'Travel', icon: 'airplane', color: COLORS.mint, enabled: true },
  { id: '9', name: 'Subscriptions', icon: 'refresh', color: COLORS.violet, enabled: true },
  { id: '10', name: 'Others', icon: 'ellipsis-horizontal', color: COLORS.textMuted, enabled: true },
];

const ICON_OPTIONS = [
  { name: 'restaurant', label: 'Food' },
  { name: 'car', label: 'Car' },
  { name: 'play-circle', label: 'Entertainment' },
  { name: 'bag', label: 'Shopping' },
  { name: 'flash', label: 'Utilities' },
  { name: 'medkit', label: 'Healthcare' },
  { name: 'school', label: 'Education' },
  { name: 'airplane', label: 'Travel' },
  { name: 'refresh', label: 'Subscription' },
  { name: 'home', label: 'Home' },
  { name: 'barbell', label: 'Fitness' },
  { name: 'book', label: 'Books' },
  { name: 'heart', label: 'Health' },
  { name: 'gift', label: 'Gifts' },
  { name: 'camera', label: 'Photography' },
  { name: 'musical-notes', label: 'Music' },
  { name: 'gamepad', label: 'Games' },
  { name: 'pizza', label: 'Pizza' },
  { name: 'beer', label: 'Drinks' },
  { name: 'person-add', label: 'Social' },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<ExpenseCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconColor, setSelectedIconColor] = useState(COLORS.violet);
  const [selectedIcon, setSelectedIcon] = useState('bookmark');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.user.getMe();
      if (response.data?.success && response.data.data.expenseCategories?.length > 0) {
        // If we have categories from server, use them
        // But ensure all defaults are included
        const serverCats = response.data.data.expenseCategories;
        const defaultIds = DEFAULT_CATEGORIES.map(c => c.id);
        
        // Keep defaults from DEFAULT_CATEGORIES (in case user changed their enabled status on server)
        const defaultsFromServer = serverCats.filter((c: ExpenseCategory) => defaultIds.includes(c.id));
        const customFromServer = serverCats.filter((c: ExpenseCategory) => c.isCustom);
        
        // If we don't have all defaults from server, add missing ones
        const missingDefaults = DEFAULT_CATEGORIES.filter(
          d => !defaultsFromServer.find(s => s.id === d.id)
        );
        
        const merged = [...missingDefaults, ...defaultsFromServer, ...customFromServer];
        setCategories(merged);
      } else {
        // No categories on server, use defaults
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Keep defaults if load fails
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Invalid', 'Please enter a category name');
      return;
    }

    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      icon: selectedIcon,
      color: selectedIconColor,
      enabled: true,
      isCustom: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    const catName = newCategoryName;
    setNewCategoryName('');
    setSelectedIcon('bookmark');
    setSelectedIconColor(COLORS.violet);
    setShowAddModal(false);
    Alert.alert('Success', `Category "${catName}" added`);
  };

  const deleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category?.isCustom) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      Alert.alert('Success', 'Category deleted');
    } else {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const enabledCategories = categories.filter((c) => c.enabled);
      if (enabledCategories.length === 0) {
        Alert.alert('Invalid', 'Please enable at least one category');
        setLoading(false);
        return;
      }

      // Send all categories to backend for save
      const response = await apiService.profile.updateCategories(categories);
      
      if (response.data?.success) {
        Alert.alert('Success', 'Categories updated successfully');
        router.back();
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to update categories');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update categories');
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = categories.filter((c) => c.enabled).length;
  const customCount = categories.filter((c) => c.isCustom).length;

  const COLOR_OPTIONS = [COLORS.coral, COLORS.mint, COLORS.violet, COLORS.amber, COLORS.violetLight];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['rgba(124, 92, 252, 0.15)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Expense Categories</Text>
            <Text style={styles.headerSubtitle}>{enabledCount} enabled • {customCount} custom</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={COLORS.mint} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Enable or disable categories to customize your expense tracking options.
        </Text>

        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <View
              key={category.id}
              style={[
                styles.categoryItem,
                !category.enabled && styles.categoryItemDisabled,
              ]}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: `${category.color}20`,
                          opacity: category.enabled ? 1 : 0.5,
                        },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={category.color}
                        style={{ opacity: category.enabled ? 1 : 0.5 }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.categoryName,
                          !category.enabled && styles.categoryNameDisabled,
                        ]}
                      >
                        {category.name}
                      </Text>
                      {category.isCustom && (
                        <Text style={styles.customBadge}>Custom</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      category.enabled && styles.checkboxEnabled,
                    ]}
                  >
                    {category.enabled && (
                      <Ionicons name="checkmark" size={16} color={COLORS.mint} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {category.isCustom && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.coral} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.violet} />
          <Text style={styles.infoText}>
            Disabled categories won't appear in the expense creation form. You can add custom categories for your specific needs.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Category</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Category name (e.g., Gym, Books)"
              placeholderTextColor={COLORS.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Text style={styles.modalSubtitle}>Select Icon:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.iconScroller}
            >
              {ICON_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  style={[
                    styles.iconOption,
                    selectedIcon === option.name && styles.iconOptionSelected,
                  ]}
                  onPress={() => setSelectedIcon(option.name)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconOptionCircle,
                    { backgroundColor: selectedIcon === option.name ? selectedIconColor : `${selectedIconColor}20` }
                  ]}>
                    <Ionicons
                      name={option.name as any}
                      size={24}
                      color={selectedIcon === option.name ? 'white' : selectedIconColor}
                    />
                  </View>
                  <Text style={styles.iconLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalSubtitle}>Select Color:</Text>
            <View style={styles.colorPicker}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedIconColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedIconColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedIconColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={addCustomCategory}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[COLORS.violet, COLORS.violetLight]}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.textPrimary} />
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 20,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryItemDisabled: {
    opacity: 0.6,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  categoryNameDisabled: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  customBadge: {
    fontSize: 10,
    color: COLORS.mint,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEnabled: {
    backgroundColor: `${COLORS.mint}20`,
    borderColor: COLORS.mint,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${COLORS.violet}15`,
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: `${COLORS.violet}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.elevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  iconScroller: {
    marginBottom: 16,
  },
  iconOption: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconOptionSelected: {
    opacity: 1,
  },
  iconOptionCircle: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    maxWidth: 60,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.violet,
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
});
