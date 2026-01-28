import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Radius } from '../theme/colors'
import { useSettings, useAuth } from '../hooks/useSettings'
import { AIModels, allModels } from '../models/types'

interface Props {
  onBack: () => void
}

const CODESPACE_LOCATIONS = [
  { value: 'EastUs', label: 'East US' },
  { value: 'SoutheastAsia', label: 'Southeast Asia' },
  { value: 'WestEurope', label: 'West Europe' },
  { value: 'WestUs2', label: 'West US 2' },
  { value: 'EuropeWest', label: 'Europe West' },
]

const SettingsView: React.FC<Props> = ({ onBack }) => {
  const { settings, updateSettings } = useSettings()
  const { user, isAuthenticated, signIn, signOut } = useAuth()
  const [openRouterKey, setOpenRouterKey] = useState(settings.openRouterApiKey || '')
  const [loading, setLoading] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const selectedModel = allModels.find((m) => m.id === settings.selectedModelId) || AIModels.kimi
  const selectedLocation = CODESPACE_LOCATIONS.find(
    (l) => l.value === settings.codespaceLocation
  ) || CODESPACE_LOCATIONS[3]

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signIn()
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    Alert.alert('Signed Out', 'You have been signed out successfully.')
  }

  const handleSave = async () => {
    await updateSettings({
      openRouterApiKey: openRouterKey.trim() || undefined,
    })
    Alert.alert('Settings Saved', 'Your settings have been saved successfully.')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {isAuthenticated && user ? (
            <View style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user.name || user.login}</Text>
                <Text style={styles.accountHandle}>@{user.login}</Text>
              </View>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.buttonPrimaryText} />
              ) : (
                <>
                  <Ionicons name="logo-github" size={20} color={Colors.buttonPrimaryText} />
                  <Text style={styles.signInButtonText}>Sign in with GitHub</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* AI Model Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Model</Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowModelPicker(true)}
          >
            <View style={styles.pickerInfo}>
              <Text style={styles.pickerLabel}>Model</Text>
              <Text style={styles.pickerValue}>{selectedModel.displayName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.tertiaryText} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>OpenRouter API Key</Text>
            <TextInput
              style={styles.input}
              value={openRouterKey}
              onChangeText={setOpenRouterKey}
              placeholder="sk-or-..."
              placeholderTextColor={Colors.secondaryText}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Text style={styles.hint}>
              Get your API key from{' '}
              <Text style={styles.linkText}>openrouter.ai/keys</Text>
            </Text>
          </View>
        </View>

        {/* Codespaces Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Codespaces</Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <View style={styles.pickerInfo}>
              <Text style={styles.pickerLabel}>Default Location</Text>
              <Text style={styles.pickerValue}>{selectedLocation.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.tertiaryText} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Model Picker Modal */}
      {showModelPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select AI Model</Text>
            {allModels.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={styles.modalItem}
                onPress={() => {
                  updateSettings({ selectedModelId: model.id })
                  setShowModelPicker(false)
                }}
              >
                <Text style={styles.modalItemTitle}>{model.displayName}</Text>
                <Text style={styles.modalItemSubtitle}>{model.provider}</Text>
                {model.id === settings.selectedModelId && (
                  <Ionicons name="checkmark" size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowModelPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Codespace Location</Text>
            {CODESPACE_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.value}
                style={styles.modalItem}
                onPress={() => {
                  updateSettings({ codespaceLocation: location.value })
                  setShowLocationPicker(false)
                }}
              >
                <Text style={styles.modalItemTitle}>{location.label}</Text>
                {location.value === settings.codespaceLocation && (
                  <Ionicons name="checkmark" size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  content: {
    flex: 1,
    padding: Spacing.LG,
  },
  section: {
    marginBottom: Spacing.XL,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    marginBottom: Spacing.MD,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.MD,
    padding: Spacing.MD,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  accountHandle: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  signOutButton: {
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.Full,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.error,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.SM,
    backgroundColor: '#24292e',
    borderRadius: Radius.MD,
    paddingVertical: Spacing.LG,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.buttonPrimaryText,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.MD,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.MD,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  pickerValue: {
    fontSize: 16,
    color: Colors.primaryText,
  },
  inputContainer: {
    marginTop: Spacing.MD,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryText,
    marginBottom: Spacing.SM,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.MD,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.MD,
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: Spacing.XS,
  },
  hint: {
    fontSize: 12,
    color: Colors.tertiaryText,
  },
  linkText: {
    color: Colors.accent,
  },
  saveButton: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: Radius.Full,
    paddingVertical: Spacing.MD,
    alignItems: 'center',
    marginTop: Spacing.LG,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.buttonPrimaryText,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.LG,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryText,
    padding: Spacing.LG,
    borderBottomWidth: 1,
    borderBottomColor: Colors.chipBorder,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.chipBorder,
  },
  modalItemTitle: {
    fontSize: 16,
    color: Colors.primaryText,
  },
  modalItemSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  modalClose: {
    padding: Spacing.LG,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.accent,
  },
})

export default SettingsView
