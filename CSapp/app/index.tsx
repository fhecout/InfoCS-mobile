import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import MatchesScreen from '../src/screens/MatchesScreen';
import ResultsScreen from '../src/screens/ResultsScreen';
import RankingScreen from '../src/screens/RankingScreen';
import TransfersScreen from '../src/screens/TransfersScreen';

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    // <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Partidas" component={MatchesScreen} />
        <Stack.Screen name="Resultados" component={ResultsScreen} />
        <Stack.Screen name="Ranking" component={RankingScreen} />
        <Stack.Screen name="Transferências" component={TransfersScreen} />
      </Stack.Navigator>
    // </NavigationContainer>
  );
} 