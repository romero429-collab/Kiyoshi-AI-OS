import React, { useState } from 'react';
import { View, FlatList, TextInput, Text, SafeAreaView, StyleSheet } from 'react-native';
import { Theme } from '../theme';
import { useKiyoshi } from '../store/useKiyoshi';

export const ChatScreen = () => {
  const { messages, sendMessage, isConnected } = useKiyoshi();
  const [input, setInput] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isConnected ? '#22C55E' : '#EF4444' }
        ]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected to Kiyoshi Engine' : 'Connecting...'}
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.text}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Initiate input..."
          placeholderTextColor={Theme.colors.textSecondary}
          onSubmitEditing={() => {
            if (input.trim()) {
              sendMessage(input);
              setInput('');
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.sm,
  },
  statusText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  listContent: { padding: Theme.spacing.md },
  messageBubble: { paddingVertical: Theme.spacing.sm },
  inputContainer: { padding: Theme.spacing.md },
  input: {
    color: Theme.colors.textPrimary,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
  },
  text: { color: Theme.colors.textPrimary },
});
