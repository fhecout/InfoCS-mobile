import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView } from 'react-native';
import api from '../services/api';
import BottomNavbar from '../components/BottomNavbar';

interface Team {
  name: string;
  logo: string;
  status: string;
}

interface Player {
  name: string;
  link: string;
  img: string;
}

interface Transfer {
  player: Player;
  fromTeam: Team;
  toTeam: Team;
  movement: string;
  date: string;
}

const placeholderPlayer = 'https://img-cdn.hltv.org/playerbodyshot/OGQ3cN_IS8TJm89z-h9GhZ.png?ixlib=java-2.1.0&w=400&s=f0cf028b6b2a7efdda16ae11bd9c5cc7';
const placeholderTeam = 'https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png';

const getLogo = (logo: string) => logo && logo !== '' && !logo.startsWith('/dynamic-svg')
  ? `https://images.weserv.nl/?url=${encodeURIComponent(logo.startsWith('http') ? logo : 'www.hltv.org' + logo)}`
  : placeholderTeam;

const getPlayerImg = (img: string) =>
  img && img !== '' && !img.includes('player_silhouette') && img.startsWith('http')
    ? img
    : placeholderPlayer;

function PlayerImage({ uri }: { uri: string }) {
  const [error, setError] = useState(false);
  return (
    <Image
      source={{ uri: error ? placeholderPlayer : uri }}
      style={styles.playerImg}
      onError={() => setError(true)}
    />
  );
}

function traduzirMovimento(movement: string): string {
  // Traduções básicas, adicione mais conforme necessário
  return movement
    .replace(/joins/i, 'entra para')
    .replace(/parts ways with/i, 'se despede da')
    .replace(/transfers from/i, 'se transfere da')
    .replace(/transfers to/i, 'se transfere para')
    .replace(/retires/i, 'se aposenta')
    .replace(/is benched on/i, 'vai para o banco da')
    .replace(/as coach/i, 'como treinador')
    .replace(/coach/i, 'treinador')
    .replace(/from/i, 'de')
    .replace(/to/i, 'para');
}

export default function TransfersScreen() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const response = await api.get('/transfers?ranking=10');
      setTransfers(response.data);
    } catch (error) {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={styles.headerRow}>
        <Image source={require('../../assets/images/icon.png')} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>CSapp</Text>
      </View>
      <Text style={styles.headerSubtitle}>Transferências Recentes</Text>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={{ marginTop: 18, fontSize: 18, color: '#2196F3', fontWeight: 'bold' }}>Carregando transferências...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {transfers.map((t, idx) => (
            <View style={styles.card} key={t.player.name + t.date + idx}>
              <View style={styles.row}>
                <PlayerImage uri={getPlayerImg(t.player.img)} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.playerName}>{t.player.name}</Text>
                  <Text style={styles.movement}>{traduzirMovimento(t.movement)}</Text>
                  <Text style={styles.date}>{t.date}</Text>
                </View>
              </View>
              <View style={styles.teamsRow}>
                <View style={styles.teamBlock}>
                  <Image source={{ uri: getLogo(t.fromTeam.logo) }} style={styles.teamLogo} />
                  <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{t.fromTeam.name}</Text>
                  {t.fromTeam.status ? <Text style={styles.teamStatus}>{t.fromTeam.status}</Text> : null}
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.teamBlock}>
                  <Image source={{ uri: getLogo(t.toTeam.logo) }} style={styles.teamLogo} />
                  <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{t.toTeam.name}</Text>
                  {t.toTeam.status ? <Text style={styles.teamStatus}>{t.toTeam.status}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 2,
  },
  headerIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 14,
    marginVertical: 12,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#eee',
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  movement: {
    fontSize: 15,
    color: '#444',
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  teamBlock: {
    alignItems: 'center',
    width: 90,
    marginHorizontal: 8,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 2,
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    textAlign: 'center',
    maxWidth: 80,
  },
  teamStatus: {
    fontSize: 12,
    color: '#e53935',
    fontWeight: 'bold',
    marginTop: 1,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#2196F3',
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
}); 