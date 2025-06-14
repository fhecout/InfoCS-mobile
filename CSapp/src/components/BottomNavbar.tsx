import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const tabs = [
  { label: 'Partidas', route: '/partidas', icon: 'sword-cross' },
  { label: 'Resultados', route: '/resultados', icon: 'trophy-outline' },
  { label: 'Ranking', route: '/ranking', icon: 'format-list-numbered' },
  { label: 'Transferências', route: '/transferencias', icon: 'swap-horizontal' },
] as const;

export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const active = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => {
              if (!active) router.push(tab.route as any);
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={26}
              color={active ? '#2196F3' : '#888'}
              style={{ marginBottom: 2 }}
            />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    justifyContent: 'center',
  },
  tabActive: {
    borderTopWidth: 3,
    borderTopColor: '#2196F3',
    backgroundColor: '#f4f8ff',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 1,
  },
  tabTextActive: {
    color: '#2196F3',
  },
});