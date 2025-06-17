import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, Pressable } from 'react-native';
import { i18n, Language } from '../i18n/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavbar from '../components/BottomNavbar';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pt', label: 'Português (BR)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

const lightColors = {
  background: '#f7f9fc',
  card: '#fff',
  text: '#222',
  primary: '#2196F3',
  border: '#e0e4ea',
  shadow: '#000',
  secondaryText: '#888',
};

const darkColors = {
  background: '#181a20',
  card: '#23262f',
  text: '#f7f9fc',
  primary: '#2196F3',
  border: '#23262f',
  shadow: '#000',
  secondaryText: '#bbb',
};

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 18,
      marginBottom: 6,
      letterSpacing: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    languageBtn: {
      padding: 4,
    },
    aboutText: {
      fontSize: 13,
      color: colors.secondaryText,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      minWidth: 220,
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOpacity: 0.10,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    modalOption: {
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
  });
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [languageModal, setLanguageModal] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState<Language>(i18n.getCurrentLanguage());
  const [darkMode, setDarkMode] = React.useState(false);
  const colors = darkMode ? darkColors : lightColors;
  const styles = getStyles(colors);

  const handleChangeLanguage = (lang: Language) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    setLanguageModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('settings.language')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{LANGUAGES.find(l => l.code === currentLang)?.label}</Text>
        <TouchableOpacity style={styles.languageBtn} onPress={() => setLanguageModal(true)}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={languageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModal(false)}>
          <View style={styles.modalContent}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={styles.modalOption}
                onPress={() => handleChangeLanguage(lang.code)}
              >
                <Text style={[styles.modalOptionText, currentLang === lang.code && { color: colors.primary, fontWeight: 'bold' }]}> 
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Text style={styles.title}>{i18n.t('settings.notifications')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{i18n.t('settings.notifications')}</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          thumbColor={notifications ? colors.primary : '#ccc'}
          trackColor={{ true: '#bbdefb', false: '#eee' }}
        />
      </View>
      <Text style={styles.title}>{i18n.t('settings.theme')}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark theme</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? colors.primary : '#ccc'}
          trackColor={{ true: colors.primary + '55', false: '#eee' }}
        />
      </View>
      <Text style={styles.title}>{i18n.t('settings.about')}</Text>
      <View style={styles.row}>
        <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.aboutText}>CS App v1.0{"\n"}Developed by you :)</Text>
      </View>
      <BottomNavbar />
    </View>
  );
} 