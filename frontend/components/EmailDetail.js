// components/EmailDetail.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import RenderHtml from 'react-native-render-html';
import config from '../config';

// API base URL
const API_URL = config.apiUrl;

// HTML renderer configuration
const htmlConfig = {
  baseStyle: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsStyles: {
    body: {
      margin: 0,
      padding: 0,
    },
    p: {
      marginBottom: 16,
    },
    a: {
      color: '#2196F3',
      textDecorationLine: 'underline',
    },
    img: {
      maxWidth: '100%',
      height: 'auto',
    },
  },
};

const EmailDetail = ({ route }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const emailId = route?.params?.id;

  useEffect(() => {
    if (!emailId) {
      setError('No email ID provided');
      setLoading(false);
      return;
    }
    
    fetchEmailDetails();
  }, [emailId]);

  const fetchEmailDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/email/${emailId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const data = await response.json();
      setEmail(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading email...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!email) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Email not found</Text>
      </View>
    );
  }

  // Format the date
  const formattedDate = new Date(email.timestamp).toLocaleString();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subject}>{email.subject}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.metadata}>
        <Text style={styles.metadataLabel}>From:</Text>
        <Text style={styles.metadataValue}>{email.from}</Text>
      </View>
      
      <View style={styles.metadata}>
        <Text style={styles.metadataLabel}>To:</Text>
        <Text style={styles.metadataValue}>{email.to}</Text>
      </View>
      
      <View style={styles.bodyContainer}>
        <RenderHtml
          contentWidth={styles.container.width}
          source={{ html: email.body }}
          {...htmlConfig}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  subject: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  metadata: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metadataLabel: {
    width: 50,
    fontWeight: '600',
    color: '#555',
  },
  metadataValue: {
    flex: 1,
  },
  bodyContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default EmailDetail;