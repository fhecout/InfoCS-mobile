import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';
import { vetoTranslations } from '../i18n/translations';

type Player = {
  name: string;
  nick: string;
  country: string;
  flag: string;
  link: string;
  kd: string;
  plusMinus: string;
  adr: string;
  kast: string;
  rating: string;
};

type Team = {
  name: string;
  logo: string;
  country: string;
  countryFlag: string;
  score: string;
};

type Event = {
  name: string;
  link: string;
};

type TeamsInfo = {
  team1: Team;
  team2: Team;
  event: Event;
  time: string;
  date: string;
  status: string;
};

type MapInfo = {
  name: string;
  team1: { name: string; score: string };
  team2: { name: string; score: string };
  halfScores: string;
};

type MatchStats = {
  map: string;
  teams: {
    name: string;
    players: Player[];
  }[];
};

type Props = {
  data: {
    success: boolean;
    teamsInfo: TeamsInfo;
    vetoInfo: string[];
    matchStats: MatchStats[];
    mapsInfo: MapInfo[];
  };
};

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

function traduzirVeto(veto: string) {
  let traduzido = veto;
  Object.entries(vetoTranslations).forEach(([en, pt]) => {
    traduzido = traduzido.replace(en, pt);
  });
  return traduzido;
}

export default function InMatchScreen() {
  const route = useRoute();
  const { matchUrl } = route.params as { matchUrl: string };
  const [data, setData] = useState(null);
  const [selectedMap, setSelectedMap] = useState<string>('All maps');

  useEffect(() => {
    async function fetchData() {
      const response = await api.get('/inmatch', { params: { matchUrl } });
      setData(response.data);
    }
    fetchData();
  }, [matchUrl]);

  if (!data) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#f7f9fc',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{
          marginTop: 18,
          fontSize: 18,
          color: '#2196F3',
          fontWeight: 'bold',
          letterSpacing: 1
        }}>
          Carregando dados da partida...
        </Text>
      </View>
    );
  }

  return <MatchDetailsScreen data={data} />;
}

function MatchDetailsScreen({ data }: Props) {
  const { teamsInfo, vetoInfo, matchStats = [], mapsInfo = [] } = data;
  const [selectedMap, setSelectedMap] = useState<string>('All maps');

  // Garante que não há mapas duplicados e remove 'All maps' se já existir
  const mapNames = Array.isArray(matchStats) 
    ? Array.from(new Set(matchStats.map(m => m.map))).filter(m => m.toLowerCase() !== 'all maps')
    : [];
  const allMaps = ['All maps', ...mapNames];

  if (!data) return <Text>Carregando...</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* EVENTO */}
      {teamsInfo?.event?.name && (
        <View style={styles.eventSection}>
          <Text style={styles.eventTitle}>{teamsInfo.event.name}</Text>
          <Text style={styles.eventDate}>{teamsInfo.date} - {teamsInfo.time}</Text>
          <Text style={styles.eventStatus}>{teamsInfo.status}</Text>
        </View>
      )}
      <View style={styles.divider} />

      {/* TIMES */}
      {teamsInfo?.team1 && teamsInfo?.team2 && (
        <View style={styles.teamsRow}>
          {[teamsInfo.team1, teamsInfo.team2].map((team, idx) => (
            <View key={team.name} style={styles.teamBox}>
              {team.countryFlag && (
                <>
                  <Image
                    source={{ uri: team.countryFlag }}
                    style={styles.flagBackground}
                    resizeMode="cover"
                    blurRadius={1}
                  />
                  <View style={styles.flagOverlay} />
                </>
              )}
              <View style={{ position: 'relative', zIndex: 2, alignItems: 'center' }}>
                {team.logo && <Image source={{ uri: getLogo(team.logo) }} style={styles.teamLogo} />}
                <Text style={styles.teamName}>{team.name}</Text>
                <View style={styles.flagRow}>
                  <Text style={styles.country}>{team.country}</Text>
                </View>
                {team.score && <Text style={styles.score}>Score: {team.score}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* VETOS */}
      {Array.isArray(vetoInfo) && vetoInfo.length > 0 && (
        <View style={styles.vetoBox}>
          <Text style={styles.vetoTitle}>Veto de Mapas</Text>
          <View style={styles.vetoList}>
            {vetoInfo.map((veto, idx) => (
              <Text key={idx} style={styles.vetoText}>{traduzirVeto(veto)}</Text>
            ))}
          </View>
        </View>
      )}

      {/* BOX DE MAPAS COM TIMES E BANDEIRA */}
      {Array.isArray(mapsInfo) && mapsInfo.length > 0 && (
        <View style={styles.mapsBoxModern}>
          <Text style={styles.mapsTitleModern}>Resultados por Mapa</Text>
          {mapsInfo.map((map: MapInfo, idx: number) => {
            const team1Score = parseInt(map.team1.score, 10);
            const team2Score = parseInt(map.team2.score, 10);
            const team1Win = team1Score > team2Score;
            const team2Win = team2Score > team1Score;
            return (
              <View key={idx} style={styles.mapModernItemBox}>
                <Text style={styles.mapModernName}>{map.name}</Text>
                <View style={styles.mapModernTeamsRow}>
                  {/* Time 1 */}
                  <View style={styles.mapModernTeamBox}>
                    {teamsInfo?.team1?.countryFlag && (
                      <>
                        <Image
                          source={{ uri: teamsInfo.team1.countryFlag }}
                          style={styles.mapModernFlagBg}
                          resizeMode="cover"
                          blurRadius={1}
                        />
                        <View style={styles.mapModernFlagOverlay} />
                      </>
                    )}
                    <View style={styles.mapModernTeamContent}>
                      {teamsInfo?.team1?.logo && <Image source={{ uri: getLogo(teamsInfo.team1.logo) }} style={styles.mapModernLogo} />}
                      <Text style={styles.mapModernTeamName}>{map.team1.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.mapModernX}>x</Text>
                  {/* Time 2 */}
                  <View style={styles.mapModernTeamBox}>
                    {teamsInfo?.team2?.countryFlag && (
                      <>
                        <Image
                          source={{ uri: teamsInfo.team2.countryFlag }}
                          style={styles.mapModernFlagBg}
                          resizeMode="cover"
                          blurRadius={1}
                        />
                        <View style={styles.mapModernFlagOverlay} />
                      </>
                    )}
                    <View style={styles.mapModernTeamContent}>
                      {teamsInfo?.team2?.logo && <Image source={{ uri: getLogo(teamsInfo.team2.logo) }} style={styles.mapModernLogo} />}
                      <Text style={styles.mapModernTeamName}>{map.team2.name}</Text>
                    </View>
                  </View>
                </View>
                {/* Placar embaixo dos cards */}
                <View style={styles.mapModernScoreRow}>
                  <Text style={[styles.mapModernScore, team1Win ? styles.win : styles.lose]}>{map.team1.score}</Text>
                  <Text style={styles.mapModernX}>x</Text>
                  <Text style={[styles.mapModernScore, team2Win ? styles.win : styles.lose]}>{map.team2.score}</Text>
                </View>
                {map.halfScores && <Text style={styles.mapModernHalfScoresCentered}>{map.halfScores}</Text>}
              </View>
            );
          })}
        </View>
      )}

      {/* ESTATÍSTICAS POR MAPA */}
      {Array.isArray(matchStats) && matchStats.length > 0 && (
        <>
          <View style={styles.mapTabsRow}>
            {allMaps.map(map => (
              <TouchableOpacity
                key={map}
                style={[
                  styles.mapTab,
                  selectedMap === map && styles.mapTabActive
                ]}
                onPress={() => setSelectedMap(map)}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.mapTabText,
                  selectedMap === map && styles.mapTabTextActive
                ]}>
                  {map.charAt(0).toUpperCase() + map.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {matchStats
            .filter(m => selectedMap === 'All maps'
              ? m.map.toLowerCase() === 'all maps'
              : m.map === selectedMap)
            .map((mapStat, idx) => (
              <View key={mapStat.map} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {selectedMap === 'All maps' ? 'Todos os mapas' : `Mapa: ${mapStat.map}`}
                </Text>
                {Array.isArray(mapStat.teams) && mapStat.teams.map((team, tIdx) => (
                  <View key={team.name} style={styles.teamStatsBox}>
                    <Text style={styles.teamStatsTitle}>{team.name}</Text>
                    {selectedMap === 'All maps' ? (
                      <View>
                        <View style={styles.statsHeaderRow}>
                          <Text style={[styles.statsHeader, styles.playerCell, styles.statsHeaderPlayer]}>Jogador</Text>
                          <Text style={styles.statsHeader}>K-D</Text>
                          <Text style={styles.statsHeader}>+/-</Text>
                          <Text style={styles.statsHeader}>ADR</Text>
                          <Text style={styles.statsHeader}>KAST</Text>
                          <Text style={styles.statsHeader}>Rating</Text>
                        </View>
                        {Array.isArray(team.players) && team.players.map((player, pIdx) => {
                          const plusMinus = parseInt(player.plusMinus, 10);
                          let plusMinusColor = '#888';
                          if (plusMinus > 0) plusMinusColor = '#43a047';
                          else if (plusMinus < 0) plusMinusColor = '#e53935';
                          return (
                            <View
                              key={player.link}
                              style={[
                                styles.statsRow,
                                pIdx % 2 === 1 && styles.statsRowZebra
                              ]}
                            >
                              <TouchableOpacity onPress={() => Linking.openURL(player.link)} style={styles.playerCell}>
                                {player.flag && <Image source={{ uri: player.flag }} style={styles.flagSmall} />}
                                <Text style={styles.playerName}>{player.nick}</Text>
                              </TouchableOpacity>
                              <Text style={styles.statsCell}>{player.kd}</Text>
                              <Text style={[styles.statsCell, { color: plusMinusColor }]}>{player.plusMinus}</Text>
                              <Text style={styles.statsCell}>{player.adr}</Text>
                              <Text style={styles.statsCell}>{player.kast}</Text>
                              <Text style={styles.statsCell}>{player.rating}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <ScrollView horizontal>
                        <View>
                          <View style={styles.statsHeaderRow}>
                            <Text style={[styles.statsHeader, styles.playerCell, styles.statsHeaderPlayer]}>Jogador</Text>
                            <Text style={styles.statsHeader}>K-D</Text>
                            <Text style={styles.statsHeader}>+/-</Text>
                            <Text style={styles.statsHeader}>ADR</Text>
                            <Text style={styles.statsHeader}>KAST</Text>
                            <Text style={styles.statsHeader}>Rating</Text>
                          </View>
                          {Array.isArray(team.players) && team.players.map((player, pIdx) => {
                            const plusMinus = parseInt(player.plusMinus, 10);
                            let plusMinusColor = '#888';
                            if (plusMinus > 0) plusMinusColor = '#43a047';
                            else if (plusMinus < 0) plusMinusColor = '#e53935';
                            return (
                              <View
                                key={player.link}
                                style={[
                                  styles.statsRow,
                                  pIdx % 2 === 1 && styles.statsRowZebra
                                ]}
                              >
                                <TouchableOpacity onPress={() => Linking.openURL(player.link)} style={styles.playerCell}>
                                  {player.flag && <Image source={{ uri: player.flag }} style={styles.flagSmall} />}
                                  <Text style={styles.playerName}>{player.nick}</Text>
                                </TouchableOpacity>
                                <Text style={styles.statsCell}>{player.kd}</Text>
                                <Text style={[styles.statsCell, { color: plusMinusColor }]}>{player.plusMinus}</Text>
                                <Text style={styles.statsCell}>{player.adr}</Text>
                                <Text style={styles.statsCell}>{player.kast}</Text>
                                <Text style={styles.statsCell}>{player.rating}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                ))}
              </View>
            ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  section: { marginVertical: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2196F3', marginBottom: 8 },
  eventSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 2,
    textAlign: 'center',
  },
  eventLink: {
    fontSize: 13,
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 1,
    textAlign: 'center',
  },
  eventStatus: {
    fontSize: 13,
    color: '#b0b0b0',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e3eaf6',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 1,
  },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  teamBox: {
    alignItems: 'center',
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  flagBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
    zIndex: 1,
    borderRadius: 12,
  },
  flagOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
    borderRadius: 12,
  },
  teamLogo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 6 },
  teamName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flagRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  flag: { width: 28, height: 18, marginRight: 6, borderRadius: 3 },
  country: { 
    fontSize: 13, 
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  score: { 
    fontSize: 15, 
    color: '#4FC3F7',
    fontWeight: 'bold', 
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vetoBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
  },
  vetoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    textAlign: 'center',
  },
  vetoList: {
    width: '100%',
    marginTop: 2,
  },
  vetoText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    lineHeight: 22,
  },
  teamStatsBox: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  teamStatsTitle: { fontSize: 15, fontWeight: 'bold', color: '#2196F3', marginBottom: 4 },
  statsHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f4f8fc',
    paddingVertical: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  statsHeader: {
    width: 55,
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  statsHeaderPlayer: {
    paddingLeft: 18,
    textAlign: 'left',
    color: '#1976d2',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 26,
    backgroundColor: '#fff',
  },
  statsRowZebra: {
    backgroundColor: '#f7fafd',
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  flagSmall: {
    width: 18,
    height: 12,
    marginRight: 3,
    borderRadius: 2,
  },
  playerName: {
    fontSize: 12,
    color: '#111',
    fontWeight: '600',
    textAlign: 'left',
  },
  statsCell: {
    width: 55,
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  mapTabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  mapTab: {
    backgroundColor: '#e3eaf6',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginHorizontal: 4,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  mapTabActive: {
    backgroundColor: '#2196F3',
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  mapTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  mapTabTextActive: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapsBoxModern: {
    marginVertical: 12,
    paddingHorizontal: 0,
  },
  mapsTitleModern: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    textAlign: 'center',
  },
  mapModernItemBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  mapModernName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  mapModernTeamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  mapModernTeamBox: {
    alignItems: 'center',
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  mapModernFlagBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
    zIndex: 1,
    borderRadius: 12,
  },
  mapModernFlagOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
    borderRadius: 12,
  },
  mapModernTeamContent: {
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
  },
  mapModernLogo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 6 },
  mapModernTeamName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapModernScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4FC3F7',
    marginTop: 4,
    paddingHorizontal: 70,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapModernX: {
    fontSize: 15,
    color: '#444',
    marginHorizontal: 12,
  },
  mapModernHalfScoresCentered: {
    fontSize: 16,
    color: '#111',
    marginTop: 4,
    textAlign: 'center',
  },
  win: {
    color: '#43a047',
  },
  lose: {
    color: '#e53935',
  },
  mapModernScoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
    gap: 12,
  },
  mapModernScoreBig: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: -2,
  },
});
