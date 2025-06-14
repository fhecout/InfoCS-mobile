import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import api from '../services/api';
import BottomNavbar from '../components/BottomNavbar';
import Feather from 'react-native-vector-icons/Feather';

interface Team {
  name: string;
  logo?: string;
  country?: string;
  score?: string;
  maps?: string;
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
          <Text style={styles.eventName} numberOfLines={2}>
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
              isLive && styles.teamNameLive,
              (!item.team1?.name?.trim() && { color: '#bbb', fontStyle: 'italic' })
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.team1?.name?.trim() ? item.team1.name : 'A definir'}
          </Text>
        </View>
        {isLive && (
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLive}>{item.team1?.score ?? ''}</Text>
            <Text style={styles.mapsLive}>({item.team1?.maps ?? '0'})</Text>
          </View>
        )}
        <View style={styles.vsBlock}>
          <Text style={styles.vs}>vs</Text>
        </View>
        {isLive && (
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLive}>{item.team2?.score ?? ''}</Text>
            <Text style={styles.mapsLive}>({item.team2?.maps ?? '0'})</Text>
          </View>
        )}
        <View style={styles.teamBlockRight}>
          <Text
            style={[
              styles.teamName,
              isLive && styles.teamNameLive,
              (!item.team2?.name?.trim() && { color: '#bbb', fontStyle: 'italic' })
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
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Filtro de campeonatos no topo */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
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
                  style={styles.champTabLogo}
                />
              ) : null}
              <Text style={[
                styles.champTabText,
                selectedChamp === champ.name && styles.champTabTextActive
              ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {champ.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Botão de busca discreto */}
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => setShowSearch(v => !v)}
          activeOpacity={0.7}
        >
          <Feather name="search" size={22} color="#2196F3" />
        </TouchableOpacity>
      </View>
      {/* Barra de busca integrada */}
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
      {/* Conteúdo principal */}
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
                    <View key={item.link || `live-${idx}`}>{renderMatchCard(item, true)}</View>
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
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Nenhuma partida carregada.</Text>
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
    fontSize: 19,
    fontWeight: 'bold',
    color: '#e53935',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 1,
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e4ea',
  },
  liveCard: {
    borderColor: '#e53935',
    borderWidth: 2,
    shadowColor: '#e53935',
    shadowOpacity: 0.12,
  },
  topInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    gap: 8,
  },
  time: {
    color: '#2196F3',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
  },
  meta: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  liveBadge: {
    backgroundColor: '#e53935',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  liveBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 2,
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
    fontSize: 15,
    color: '#222',
    maxWidth: 80,
    marginHorizontal: 2,
    textAlign: 'left',
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  vsBlock: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vs: {
    fontSize: 15,
    color: '#888',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  eventLogo: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginRight: 5,
  },
  eventName: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: 'bold',
    maxWidth: 180,
    textAlign: 'center',
  },
  searchBarContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  champTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f8ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#2196F3',
    elevation: 1,
    minHeight: 36,
    maxHeight: 40,
  },
  champTabActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    elevation: 2,
  },
  champTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 14,
    maxWidth: 110,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  champTabTextActive: {
    color: '#fff',
  },
  champTabLogo: {
    width: 18,
    height: 18,
    borderRadius: 5,
    marginRight: 6,
    backgroundColor: '#eee',
  },
  searchIconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  scoreLive: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginRight: 2,
  },
  mapsLive: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  teamNameLive: {
    fontSize: 14,
    maxWidth: 60,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 2,
    backgroundColor: '#f7f9fc',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4ea',
    minHeight: 60,
  },
  tabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    minHeight: 44,
  },
});
