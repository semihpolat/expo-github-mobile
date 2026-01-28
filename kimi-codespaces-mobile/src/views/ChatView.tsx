import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppState } from '../contexts/AppContext'
import { Session, getFullName, Message, MessageRole, ToolCallStatus } from '../models/types'
import { Colors, Spacing, Radius } from '../theme/colors'
import MessageView from '../components/MessageView'
import MessageInputView from '../components/MessageInputView'
import Chip from '../components/Chip'

interface Props {
  session: Session
  onBack: () => void
}

// TODO: This is a simplified stub. Full implementation will:
// 1. Connect to Codespaces agent endpoint
// 2. Stream responses from Kimi 2.5 via OpenRouter
// 3. Show live tool execution progress

const ChatView: React.FC<Props> = ({ session, onBack }) => {
  const { sessions, addMessageToSession } = useAppState()
  const [messageText, setMessageText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Get current session from state
  const currentSession = sessions.find((s) => s.id === session.id) || session

  const handleSendMessage = async () => {
    if (!messageText.trim() || isProcessing) return

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: MessageRole.User,
      content: messageText,
      timestamp: new Date(),
      toolCalls: [],
    }

    // Add user message
    addMessageToSession(session.id, userMsg)

    const textToSend = messageText
    setMessageText('')
    setIsProcessing(true)

    // Scroll to show user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 50)

    // TODO: Implement actual agent flow
    // 1. Send to Codespaces agent endpoint
    // 2. Stream Kimi 2.5 responses via OpenRouter
    // 3. Handle tool call updates

    // Simulate agent response for now
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: MessageRole.Assistant,
        content: `Agent integration not yet implemented. Your message was:\n\n"${textToSend}"\n\nThis will trigger agentic editing in the Codespace for:\n${getFullName(currentSession.repository)} on branch ${currentSession.repository.defaultBranch}\n\nTODO: Implement OpenRouter Kimi 2.5 integration and Codespaces agent endpoint.`,
        timestamp: new Date(),
        toolCalls: [],
      }

      addMessageToSession(session.id, assistantMsg)
      setIsProcessing(false)

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 50)
    }, 1500)
  }

  const allMessages = currentSession.messages || []
  const hasToolCalls = allMessages.some((m) => m.toolCalls.length > 0)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentSession.title.length > 30
              ? currentSession.title.slice(0, 30) + '...'
              : currentSession.title}
          </Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>
              {getFullName(currentSession.repository)} · {currentSession.repository.defaultBranch}
            </Text>
            {isProcessing && (
              <ActivityIndicator size="small" color={Colors.accent} style={styles.spinner} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert('Session Options', 'Options menu coming soon')
          }}
        >
          <Ionicons name="ellipsis-horizontal-circle" size={24} color={Colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
        <Text style={styles.statusText}>
          {currentSession.codespace
            ? `Codespace: ${currentSession.codespace.displayName}`
            : 'No Codespace linked'}
        </Text>
      </View>

      {/* Messages + Input with keyboard avoidance */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {allMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="code-outline" size={48} color={Colors.tertiaryText} />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptyText}>
                Ask Kimi to help you edit code in this repository
              </Text>
            </View>
          ) : (
            allMessages.map((message, index) => (
              <MessageView key={`${message.id}-${index}`} message={message} />
            ))
          )}

          {/* Loading indicator */}
          {isProcessing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.loadingText}>Agent is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <MessageInputView
            text={messageText}
            placeholder="Ask Kimi to help with code..."
            onChangeText={setMessageText}
            onSend={handleSendMessage}
            disabled={isProcessing}
          />

          {/* Bottom chips */}
          <View style={styles.chipsContainer}>
            <Chip
              icon="code-working"
              text="Branch"
              secondaryText={currentSession.repository.defaultBranch}
            />
            {currentSession.codespace && (
              <Chip icon="cloud-outline" text="Codespace" secondaryText="Connected" />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.SM,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryText,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.secondaryText,
  },
  spinner: {
    marginLeft: Spacing.XS,
  },
  menuButton: {
    width: 24,
    height: 24,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS,
    gap: Spacing.XS,
    borderBottomWidth: 1,
    borderBottomColor: Colors.chipBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: Colors.secondaryText,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    padding: Spacing.MD,
    gap: Spacing.LG,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.SM,
    paddingVertical: Spacing.MD,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    paddingBottom: Spacing.MD,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: Spacing.SM,
    paddingHorizontal: Spacing.MD,
    paddingTop: Spacing.MD,
  },
})

export default ChatView
