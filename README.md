# CSapp - Aplicativo de CS

Aplicativo mobile para acompanhar partidas, resultados, ranking e transferências do CS, consumindo dados do HLTV.org.

## 📱 Funcionalidades do App

### Partidas
- Visualização das próximas partidas
- Detalhes do evento e horário
- Links diretos para as partidas no HLTV

### Resultados
- Últimos resultados de partidas
- Placar detalhado
- Informações do evento

### Ranking
- Ranking atual dos times
- Pontuação e posição
- Logos e países dos times

### Transferências
- Últimas transferências de jogadores
- Fotos dos jogadores
- Logos dos times
- Status da transferência
- Tradução automática para português

## 🚀 Tecnologias Utilizadas

### Frontend (Mobile)
- React Native
- TypeScript
- React Navigation
- Axios para requisições HTTP
- Material Community Icons

### Backend (API)
- Node.js
- Express
- Puppeteer para web scraping
- TypeScript

## 📋 Pré-requisitos

### Para o App
- Node.js 18+
- npm ou yarn
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Para a API
- Node.js 18+
- npm ou yarn
- Conexão estável com a internet

## 🛠️ Instalação

### API
1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd <nome-da-pasta>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
node app.js
```

A API estará disponível em `http://localhost:3000`

### App Mobile
1. Entre na pasta do app:
```bash
cd CSapp
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o app:
```bash
npm start
```

## 📡 Endpoints da API

### 1. Próximas Partidas
```http
GET /matches
```
Retorna todas as próximas partidas agendadas.

### 2. Partidas por Data
```http
GET /matches/date?date=YYYY-MM-DD
```
Retorna partidas de uma data específica.

### 3. Resultados Recentes
```http
GET /results
```
Retorna os últimos resultados de partidas.

### 4. Ranking de Times
```http
GET /ranking
```
Retorna o ranking atual dos times.

### 5. Transferências
```http
GET /transfers
```
Retorna as últimas transferências de jogadores.

**Parâmetros Opcionais:**
- `ranking`: Filtrar por ranking específico (5, 10, 20, 30)

## 📱 Estrutura do App

```
CSapp/
├── src/
│   ├── components/
│   │   └── BottomNavbar.tsx
│   ├── screens/
│   │   ├── MatchesScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── RankingScreen.tsx
│   │   └── TransfersScreen.tsx
│   ├── services/
│   │   └── api.ts
│   └── assets/
│       └── images/
├── App.tsx
└── package.json
```

## ⚠️ Dicas e Observações

### API
1. **Proteção contra Bloqueio:**
   - O HLTV pode bloquear scrapers
   - Se receber erro 403, rode o Puppeteer em modo visível

2. **Performance:**
   - O scraping pode demorar 3-5 segundos por requisição
   - Cache implementado para endpoints populares

3. **Limitações:**
   - Não abuse das requisições (máximo 1 por segundo)
   - Evite múltiplas requisições simultâneas

### App Mobile
1. **Configuração do Ambiente:**
   - Certifique-se de ter todas as dependências do React Native instaladas
   - Configure corretamente o Android Studio ou Xcode

2. **Desenvolvimento:**
   - Use o modo de desenvolvimento para hot-reload
   - Teste em diferentes tamanhos de tela

3. **Produção:**
   - Otimize as imagens antes de fazer build
   - Teste a performance em dispositivos reais

## 🔧 Troubleshooting

### API
1. **Erro 403 Forbidden:**
   - Verifique se o HLTV não bloqueou seu IP
   - Tente usar um proxy
   - Rode em modo visível para resolver captchas

2. **Erro 500 Internal Server Error:**
   - Verifique a conexão com a internet
   - Confirme se o HLTV está online
   - Verifique os logs do servidor

### App Mobile
1. **Erro de Conexão:**
   - Verifique se a API está rodando
   - Confirme se o IP está correto no arquivo de configuração
   - Teste a conexão com a internet

2. **Erro de Build:**
   - Limpe o cache do npm/yarn
   - Verifique as versões das dependências
   - Confirme se todas as configurações nativas estão corretas

## 📝 Licença
MIT

## 👥 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests. 