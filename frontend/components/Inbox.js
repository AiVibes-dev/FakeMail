// components/Inbox.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';
import RenderHtml from 'react-native-render-html';
import config from '../config';

// API base URL
const API_URL = config.apiUrl;

// HTML renderer configuration
const htmlConfig = {
  baseStyle: {
    fontSize: 14,
    color: '#777',
  },
  tagsStyles: {
    body: {
      margin: 0,
      padding: 0,
    },
    p: {
      margin: 0,
    },
  },
};

const Inbox = ({ navigation, userEmail }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/emails`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/emails`;
      
      if (searchQuery) {
        // Simple search implementation - in real app, you might want more sophisticated search
        if (searchQuery.includes('@')) {
          url += `?from=${searchQuery}`;
        } else {
          url += `?subject=${searchQuery}`;
        }
      }
      
      const response = await axios.get(url);
      setEmails(response.data);
    } catch (error) {
      console.error('Error searching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    // Format the date
    const formattedDate = format(new Date(item.timestamp), 'MMM d');
    
    // Create a preview of the HTML content
    const previewContent = item.body.length > 50 
      ? item.body.substring(0, 50) + '...' 
      : item.body;
    
    return (
      <TouchableOpacity
        style={[styles.emailItem, !item.isRead && styles.unreadEmail]}
        onPress={() => navigation.navigate('EmailDetail', { 
          id: item.id,
          subject: item.subject
        })}
      >
        <View style={styles.emailSender}>
          <Text style={[styles.senderText, !item.isRead && styles.unreadText]}>
            {item.from}
          </Text>
        </View>
        <View style={styles.emailContent}>
          <Text style={[styles.subjectText, !item.isRead && styles.unreadText]} numberOfLines={1}>
            {item.subject}
          </Text>
          <View style={styles.previewContainer}>
            <RenderHtml
              contentWidth={300}
              source={{ html: previewContent }}
              {...htmlConfig}
            />
          </View>
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search emails..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
      ) : (
        <FlatList
          data={emails}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No emails found</Text>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.composeButton}
        onPress={() => navigation.navigate('ComposeEmail')}
      >
        <Ionicons name="create-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    margin: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  emailItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  unreadEmail: {
    backgroundColor: '#f2f6fc',
  },
  emailSender: {
    width: 80,
  },
  senderText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  emailContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  subjectText: {
    fontSize: 15,
    marginBottom: 4,
  },
  previewContainer: {
    maxHeight: 20,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    width: 50,
    textAlign: 'right',
  },
  composeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4285F4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default Inbox;