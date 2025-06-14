import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import api from '../services/api';
import BottomNavbar from '../components/BottomNavbar';

interface Team {
  name: string;
  logo?: string;
  country?: string;
  score?: string;
}

interface Event {
  name: string;
  logo: string;
}

interface Match {
  status: string;
  team1: Team;
  team2: Team;
  time?: string;
  meta?: string;
  link?: string;
  event?: Event;
}

const placeholderLogo = 'https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png';

function getLogo(logo?: string) {
  if (logo && logo.trim() !== '') {
    if (logo.endsWith('.svg') || logo.includes('.svg?')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(logo)}`;
    }
    return logo;
  }
  return placeholderLogo;
}

function removeDuplicates(matches: Match[]): Match[] {
  const seen = new Set();
  return matches.filter(match => {
    const key = match.link || `${match.team1.name}-${match.team2.name}-${match.time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.log('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const filteredMatches = matches.filter(m => {
    const champOk = selectedChamp ? m.event?.name === selectedChamp : true;
    const searchOk = search.trim() === ''
      || m.team1.name.toLowerCase().includes(search.toLowerCase())
      || m.team2.name.toLowerCase().includes(search.toLowerCase());
    return champOk && searchOk;
  });

  const liveMatches = removeDuplicates(filteredMatches.filter(m => m.status === 'LIVE'));
  const futureMatches = removeDuplicates(filteredMatches.filter(m => m.status !== 'LIVE'));

  const championships = Array.from(
    new Map(
      matches
        .filter(m => m.event?.name)
        .map(m => [m.event!.name, { name: m.event!.name, logo: m.event!.logo }])
    ).values()
  );

  // Ordena: MAJOR primeiro, depois alfabético
  championships.sort((a, b) => {
    const isMajorA = a.name.toLowerCase().includes('major');
    const isMajorB = b.name.toLowerCase().includes('major');
    if (isMajorA && !isMajorB) return -1;
    if (!isMajorA && isMajorB) return 1;
    return a.name.localeCompare(b.name);
  });

  // Renderiza um cartão de partida
  const renderMatchCard = (item: Match, isLive: boolean = false) => (
    <View style={[styles.card, isLive && styles.liveCard]}>
      {/* Horário e meta no topo */}
      <View style={styles.topInfo}>
        {item.time && <Text style={styles.time}>{item.time}</Text>}
        {item.meta && <Text style={styles.meta}>{item.meta}</Text>}
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>AO VIVO</Text>
          </View>
        )}
      </View>
      {/* Evento */}
      {item.event && (
        <View style={styles.eventRow}>
          <Image source={{ uri: getLogo(item.event.logo) }} style={styles.eventLogo} />
          <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">
            {item.event.name}
          </Text>
        </View>
      )}
      {/* Times */}
      <View style={styles.teamsRow}>
        <View style={styles.teamBlockLeft}>
          <Image source={{ uri: getLogo(item.team1?.logo) }} style={styles.logo} />
          <Text
            style={[
              styles.teamName,
              !item.team1?.name?.trim() && { color: '#bbb', fontStyle: 'italic' }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.team1?.name?.trim() ? item.team1.name : 'A definir'}
          </Text>
        </View>
        <View style={styles.vsBlock}>
          <Text style={styles.vs}>vs</Text>
        </View>
        <View style={styles.teamBlockRight}>
          <Text
            style={[
              styles.teamName,
              !item.team2?.name?.trim() && { color: '#bbb', fontStyle: 'italic' }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.team2?.name?.trim() ? item.team2.name : 'A definir'}
          </Text>
          <Image source={{ uri: getLogo(item.team2?.logo) }} style={styles.logo} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6fa' }}>
      <View style={styles.headerRow}>
        <Image source={require('../../assets/images/icon.png')} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>CSapp</Text>
      </View>
      <Text style={styles.headerSubtitle}>Jogos ao vivo e próximos</Text>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => setShowSearch(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24 }}>🔍</Text>
        </TouchableOpacity>
      </View>
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar time..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            onBlur={() => { if (search === '') setShowSearch(false); }}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10, minHeight: 48, maxHeight: 60 }}
        contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center', height: 48 }}
      >
        <TouchableOpacity
          style={[
            styles.champTab,
            !selectedChamp && styles.champTabActive
          ]}
          onPress={() => setSelectedChamp(null)}
        >
          <Text style={[styles.champTabText, !selectedChamp && styles.champTabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {championships.map(champ => (
          <TouchableOpacity
            key={champ.name}
            style={[
              styles.champTab,
              selectedChamp === champ.name && styles.champTabActive
            ]}
            onPress={() => setSelectedChamp(champ.name)}
          >
            {champ.logo ? (
              <Image
                source={{ uri: getLogo(champ.logo) }}
                style={{ width: 20, height: 20, borderRadius: 6, marginRight: 7, backgroundColor: '#eee' }}
              />
            ) : null}
            <Text style={[
              styles.champTabText,
              selectedChamp === champ.name && styles.champTabTextActive
            ]}>
              {champ.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ flex: 1, justifyContent: 'center' }} />
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              {liveMatches.length > 0 && (
                <View>
                  <Text style={styles.liveSection}>AO VIVO</Text>
                  {liveMatches.map((item, idx) => (
                    <View key={item.link || `live-${idx}`}>
                      {renderMatchCard(item, true)}
                    </View>
                  ))}
                  <Text style={styles.section}>Próximas partidas</Text>
                </View>
              )}
            </>
          }
          data={futureMatches}
          keyExtractor={item => item.link || `future-${item.team1.name}-${item.team2.name}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => renderMatchCard(item, false)}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma partida carregada.</Text>
          }
        />
      )}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    margin: 16,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
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
  liveSection: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e53935',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  liveCard: {
    borderColor: '#e53935',
    borderWidth: 2,
    shadowColor: '#e53935',
    shadowOpacity: 0.15,
  },
  topInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  time: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  meta: {
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  liveBadge: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginLeft: 8,
  },
  liveBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  teamBlockLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  teamBlockRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    maxWidth: 90,
    marginHorizontal: 2,
    textAlign: 'left',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  vsBlock: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vs: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  eventLogo: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginRight: 6,
  },
  eventName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
    maxWidth: 140,
  },
  searchBarContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  champTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f8ff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2196F3',
    elevation: 2,
    minHeight: 38,
    maxHeight: 44,
  },
  champTabActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    elevation: 4,
  },
  champTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 15,
    maxWidth: 120,
  },
  champTabTextActive: {
    color: '#fff',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchIconBtn: {
    padding: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
});
