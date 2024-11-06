import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import Home from './pages/Home/index';
import Clientes from './pages/Clientes/index';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Clientes" component={Clientes} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}