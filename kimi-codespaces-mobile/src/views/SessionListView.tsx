import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppState, Session } from '../contexts/AppContext'
import { useAuth } from '../hooks/useSettings'
import { Colors, Spacing, Radius } from '../theme/colors'
import SessionRow from '../components/SessionRow'
import NewSessionSheet from '../components/NewSessionSheet'

interface Props {
  onSessionPress: (session: Session) => void
  onSettingsPress: () => void
}

const SessionListView: React.FC<Props> = ({ onSessionPress, onSettingsPress }) => {
  const { sessions } = useAppState()
  const { isAuthenticated, user, accessToken } = useAuth()
  const [showNewSessionSheet, setShowNewSessionSheet] = useState(false)

  const statusText = isAuthenticated
    ? user
      ? `Signed in as @${user.login}`
      : 'Connected'
    : 'Not signed in'

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={24} color={Colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kimi Codespaces</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isAuthenticated ? Colors.success : Colors.tertiaryText },
          ]}
        />
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {/* Session list */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="code-outline" size={48} color={Colors.tertiaryText} />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyText}>
              {isAuthenticated
                ? 'Create a new session to start coding with AI'
                : 'Sign in to GitHub to get started'}
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onPress={() => {
                onSessionPress(session)
              }}
            />
          ))
        )}
      </ScrollView>

      {/* New session button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.newSessionButton,
            !isAuthenticated && styles.newSessionButtonDisabled,
          ]}
          onPress={() => setShowNewSessionSheet(true)}
          disabled={!isAuthenticated}
        >
          <Text
            style={[
              styles.newSessionButtonText,
              !isAuthenticated && styles.newSessionButtonTextDisabled,
            ]}
          >
            {isAuthenticated ? 'New session' : 'Sign in to start'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* New session sheet */}
      <NewSessionSheet
        visible={showNewSessionSheet}
        onClose={() => setShowNewSessionSheet(false)}
        onSessionCreate={(session) => {
          setShowNewSessionSheet(false)
          onSessionPress(session)
        }}
        accessToken={accessToken}
      />
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
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.SM,
  },
  menuButton: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.SM,
    gap: Spacing.SM,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.XXL,
    gap: Spacing.MD,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.MD,
  },
  newSessionButton: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: Radius.Full,
    paddingVertical: Spacing.MD,
    alignItems: 'center',
  },
  newSessionButtonDisabled: {
    backgroundColor: Colors.chipBackground,
  },
  newSessionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.buttonPrimaryText,
  },
  newSessionButtonTextDisabled: {
    color: Colors.tertiaryText,
  },
})

export default SessionListView
