import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, RefreshControl, Image, ScrollView, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavbar from '../components/BottomNavbar';

interface Team {
  name: string;
  logo: string;
}

interface Event {
  name: string;
  logo: string;
}

interface Match {
  team1: Team;
  team2: Team;
  score: string;
  event: Event;
  format: string;
  link: string;
  map?: string;
  stage?: string;
}

// Função para separar o placar
function getScoreParts(score: string) {
  const match = score.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return [match[1], match[2]];
  }
  return [score, ''];
}

const placeholderLogo = 'https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png';

const getLogo = (logo: string) =>
  logo && logo !== ''
    ? `https://images.weserv.nl/?url=${encodeURIComponent(logo)}`
    : placeholderLogo;

export default function ResultsScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      const response = await api.get('/results');
      setMatches(response.data);
    } catch (error) {
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchResults();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  // Agrupa os jogos por campeonato
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

  const filteredMatches = selectedChamp
    ? matches.filter(m => m.event?.name === selectedChamp)
    : matches;

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={{ marginTop: 18, fontSize: 18, color: '#2196F3', fontWeight: 'bold' }}>Carregando resultados...</Text>
        </View>
      ) : (
        <>
          {/* Barra de seleção de campeonatos */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 12, minHeight: 54, maxHeight: 68 }}
            contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center', height: 54 }}
          >
            <TouchableOpacity
              style={[
                styles.champTab,
                !selectedChamp && styles.champTabActive,
                { marginRight: 8 }
              ]}
              onPress={() => setSelectedChamp(null)}
              activeOpacity={0.85}
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
                  selectedChamp === champ.name && styles.champTabActive,
                  { flexDirection: 'row', alignItems: 'center', marginRight: 8 }
                ]}
                onPress={() => setSelectedChamp(champ.name)}
                activeOpacity={0.85}
              >
                {champ.logo ? (
                  <Image
                    source={{ uri: getLogo(champ.logo) }}
                    style={styles.champTabLogo}
                  />
                ) : null}
                <Text
                  style={[
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
          <ScrollView style={{ flex: 1 }}>
            {championships
              .filter(champ => !selectedChamp || champ.name === selectedChamp)
              .map((champ) => {
                const champMatches = filteredMatches.filter(m => m.event?.name === champ.name);
                if (champMatches.length === 0) return null;
                return (
                  <View key={champ.name} style={{ marginBottom: 18 }}>
                    {/* Título do campeonato */}
                    <View style={styles.champHeader}>
                      <Image
                        source={{ uri: getLogo(champ.logo) }}
                        style={styles.champLogo}
                      />
                      <Text style={styles.champTitle}>{champ.name}</Text>
                    </View>
                    {/* Cards dos jogos */}
                    {champMatches.map((item, idx) => {
                      const [score1, score2] = getScoreParts(item.score);
                      return (
                        <View style={styles.resultCard} key={item.link + idx}>
                          <View style={styles.scoreRow}>
                            <View style={styles.teamBlock}>
                              <Image
                                source={{ uri: getLogo(item.team1.logo) }}
                                style={styles.teamLogo}
                              />
                              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{item.team1.name}</Text>
                            </View>
                            <View style={styles.scoreBlock}>
                              <Text style={styles.scoreNumber}>{score1}</Text>
                              <Text style={styles.scoreDash}>-</Text>
                              <Text style={styles.scoreNumber}>{score2}</Text>
                            </View>
                            <View style={styles.teamBlock}>
                              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{item.team2.name}</Text>
                              <Image
                                source={{ uri: getLogo(item.team2.logo) }}
                                style={styles.teamLogo}
                              />
                            </View>
                          </View>
                          {item.map && (
                            <View style={styles.mapRow}>
                              <Text style={styles.mapName}>{item.map}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
          </ScrollView>
        </>
      )}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  champHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginBottom: 8,
    marginTop: 18,
  },
  champLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  champTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flexShrink: 1,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginHorizontal: 12,
    marginVertical: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  teamBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    marginHorizontal: 6,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    maxWidth: 90,
    marginHorizontal: 2,
    textAlign: 'center',
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    marginHorizontal: 0,
  },
  scoreNumber: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#2196F3',
    minWidth: 32,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  scoreDash: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#888',
    marginHorizontal: 2,
    marginTop: 2,
  },
  mapRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  mapName: {
    fontSize: 15,
    color: '#e53935',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  champTab: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 2,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 60,
    maxWidth: 220,
  },
  champTabActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOpacity: 0.12,
  },
  champTabText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    maxWidth: 160,
  },
  champTabTextActive: {
    color: '#fff',
  },
  champTabLogo: {
    width: 22,
    height: 22,
    borderRadius: 6,
    marginRight: 7,
    backgroundColor: '#eee',
  },
});