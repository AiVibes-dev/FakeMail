import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import config from '../config';

// API base URL
const API_URL = config.apiUrl;

const ComposeEmail = ({ navigation, fromEmail }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to) {
      Alert.alert('Error', 'Please enter a recipient email address');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail || 'user@example.com',
          to: to,
          subject: subject || '(No Subject)',
          body: body || '',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Email sent successfully');
        navigation.navigate('Inbox');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send email');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>From:</Text>
        <TextInput
          style={styles.input}
          value={fromEmail || 'user@example.com'}
          editable={false}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>To:</Text>
        <TextInput
          style={styles.input}
          value={to}
          onChangeText={setTo}
          placeholder="Recipient email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Subject:</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
        />
      </View>
      
      <View style={styles.formGroup}>
        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="Compose your message here..."
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.sendButton} 
        onPress={handleSend}
        disabled={isSending}
      >
        <Text style={styles.sendButtonText}>
          {isSending ? 'Sending...' : 'Send Email'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComposeEmail; 