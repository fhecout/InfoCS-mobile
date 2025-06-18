import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import BottomNavbar from '../components/BottomNavbar'; // ajuste o caminho se necessário
import api from '../services/api'; // ajuste o caminho se necessário
import { cacheService } from '../services/cache';

interface Player {
  name: string;
  link: string;
  country: string;
  countryFlag: string;
  picture: string;
}

interface Team {
  position: string;
  name: string;
  points: string;
  logo: string;
  players: Player[];
  link: string;
}

const placeholderLogo = 'https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png';

function getLogo(logo: string) {
  if (logo && logo.trim() !== '') {
    if (logo.endsWith('.svg') || logo.includes('.svg?')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(logo)}`;
    }
    return logo;
  }
  return placeholderLogo;
}

export default function RankingScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchRanking = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (!forceRefresh) {
        const cachedRanking = await cacheService.get('ranking');
        if (cachedRanking) {
          setTeams(cachedRanking);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }
      const response = await api.get('/ranking');
      setTeams(response.data);
      await cacheService.set('ranking', response.data);
    } catch (error) {
      setTeams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRanking(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={{ flex: 1 }}>
        <Text style={styles.header}>Ranking Mundial</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={teams}
            keyExtractor={item => item.link}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => setSelectedTeam(item)}>
                <View style={styles.left}>
                  <Text style={styles.position}>{item.position}</Text>
                  <Image source={{ uri: getLogo(item.logo) }} style={styles.logo} />
                  <Text style={styles.teamName}>{item.name}</Text>
                </View>
                <Text style={styles.points}>{item.points} pts</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Modal dos jogadores */}
        <Modal
          visible={!!selectedTeam}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedTeam(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTeam?.name}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                {selectedTeam?.players.map(player => (
                  <View key={player.name} style={styles.playerBlock}>
                    <Image source={{ uri: player.picture }} style={styles.playerPic} />
                    <Text style={styles.playerName}>{player.name}</Text>
                    <View style={styles.flagRow}>
                      <Image source={{ uri: 'https://www.hltv.org' + player.countryFlag }} style={styles.flag} />
                      <Text style={styles.country}>{player.country}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Pressable style={styles.closeBtn} onPress={() => setSelectedTeam(null)}>
                <Text style={{ color: '#2196F3', fontWeight: 'bold', fontSize: 16 }}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a2233',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  position: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 12,
    width: 36,
    textAlign: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    maxWidth: 120,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 18,
  },
  playerBlock: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  playerPic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: '#eee',
  },
  country: {
    fontSize: 13,
    color: '#555',
  },
  closeBtn: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#f4f8ff',
  },
});
