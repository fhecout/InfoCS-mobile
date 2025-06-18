import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tabs = [
  { route: 'partidas', icon: 'sword-cross' },
  { route: 'resultados', icon: 'trophy-outline' },
  { route: 'ranking', icon: 'format-list-numbered' },
  { route: 'transferencias', icon: 'swap-horizontal' },
  { route: 'config', icon: 'cog-outline' },
] as const;

const BAR_WIDTH = Math.min(Dimensions.get('window').width * 0.92, 340);

export default function BottomNavbar() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.fabContainer}>
      <View style={[styles.fabBar, { width: BAR_WIDTH }]}>
        {tabs.map(tab => {
          const active = route.name === tab.route;
          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.fabTab}
              onPress={() => {
                if (!active) navigation.navigate(tab.route as never);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={30}
                color={active ? '#2196F3' : '#888'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 18 : 10,
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
    pointerEvents: 'box-none',
  },
  fabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 0,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e4ea',
  },
  fabTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
});