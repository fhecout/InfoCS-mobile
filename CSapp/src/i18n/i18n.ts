import { translations } from './translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

export type Language = 'pt' | 'en' | 'es';

class I18nService {
  private currentLanguage: Language = 'pt';

  async init() {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        this.currentLanguage = savedLanguage as Language;
      } else {
        // Tenta detectar o idioma do dispositivo
        const deviceLanguage = navigator.language.split('-')[0];
        if (deviceLanguage in translations) {
          this.currentLanguage = deviceLanguage as Language;
          await this.setLanguage(deviceLanguage as Language);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar i18n:', error);
    }
  }

  async setLanguage(language: Language) {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      this.currentLanguage = language;
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key;
    }

    return value;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }
}

export const i18n = new I18nService(); 