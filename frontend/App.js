// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text } from 'react-native';

// Import all components explicitly from the components directory
import Inbox from './components/Inbox';
import EmailDetail from './components/EmailDetail';
import ComposeEmail from './components/ComposeEmail';
import Login from './components/Login';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (username, password) => {
    // Simple mock authentication for demo purposes
    if (username && password) {
      setUser(username);
      setIsLoggedIn(true);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Inbox" 
              options={{
                title: `Fake Mail Server (${user})`,
                headerRight: () => (
                  <Text style={styles.headerText}>Local Testing</Text>
                ),
              }}>
              {props => <Inbox {...props} userEmail={user} />}
            </Stack.Screen>
            <Stack.Screen 
              name="EmailDetail" 
              component={EmailDetail} 
              options={({ route }) => ({ title: route.params.subject })}
            />
            <Stack.Screen 
              name="ComposeEmail" 
              options={{ title: "New Message" }}>
              {props => <ComposeEmail {...props} fromEmail={user} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerText: {
    marginRight: 10,
    fontSize: 14,
    color: '#555',
  },
});