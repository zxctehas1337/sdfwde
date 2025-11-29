# XOLO Browser Auth Server

Сервер аутентификации для XOLO Browser с поддержкой Google и GitHub OAuth.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd auth-server
npm install
```

### 2. Настройка OAuth приложений

#### Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Перейдите в "Credentials" → "Create Credentials" → "OAuth client ID"
5. Выберите "Web application"
6. Добавьте Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback`
7. Скопируйте Client ID и Client Secret

#### GitHub OAuth

1. Перейдите в [GitHub Settings](https://github.com/settings/developers)
2. Нажмите "New OAuth App"
3. Заполните:
   - Application name: `XOLO Browser`
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001/auth/github/callback`
4. Скопируйте Client ID и Client Secret

### 3. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните ваши credentials:

```env
GOOGLE_CLIENT_ID=ваш_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш_google_client_secret

GITHUB_CLIENT_ID=ваш_github_client_id
GITHUB_CLIENT_SECRET=ваш_github_client_secret

PORT=3001
SESSION_SECRET=случайная_строка_для_сессий
FRONTEND_URL=http://localhost:5173
```

### 4. Запуск сервера

```bash
npm start
```

Или в режиме разработки с автоперезагрузкой:

```bash
npm run dev
```

Сервер запустится на `http://localhost:3001`

## 📡 API Endpoints

### Аутентификация

- `GET /auth/google` - Начать авторизацию через Google
- `GET /auth/github` - Начать авторизацию через GitHub
- `GET /api/user` - Получить информацию о текущем пользователе
- `POST /api/logout` - Выйти из аккаунта
- `GET /api/auth/status` - Проверить статус авторизации

### Google Services (только для пользователей Google)

- `GET /api/google/gmail` - Получить последние 10 писем
- `GET /api/google/calendar` - Получить ближайшие события календаря
- `GET /api/google/drive` - Получить файлы из Google Drive

## 🔧 Интеграция с Electron

### Пример использования в renderer процессе:

```typescript
// Открыть окно авторизации
const authWindow = window.open(
  'http://localhost:3001/auth/google',
  'auth',
  'width=500,height=700'
);

// Проверить статус авторизации
const checkAuth = async () => {
  const response = await fetch('http://localhost:3001/api/auth/status', {
    credentials: 'include'
  });
  const data = await response.json();
  
  if (data.authenticated) {
    console.log('Пользователь:', data.user);
  }
};

// Получить Gmail
const getGmail = async () => {
  const response = await fetch('http://localhost:3001/api/google/gmail', {
    credentials: 'include'
  });
  const data = await response.json();
  console.log('Письма:', data.messages);
};
```

## 🔐 Безопасность

- Используйте HTTPS в продакшене
- Установите `cookie.secure: true` в настройках сессии для HTTPS
- Храните `.env` файл в `.gitignore`
- Используйте сильный `SESSION_SECRET`
- В продакшене используйте базу данных вместо Map для хранения пользователей

## 📝 Примечания

- Сервер использует in-memory хранилище (Map) для пользователей
- В продакшене замените на PostgreSQL, MongoDB или другую БД
- Токены хранятся в сессии и обновляются автоматически
- CORS настроен для работы с `http://localhost:5173` (Vite dev server)

## 🛠️ Разработка

Структура проекта:

```
auth-server/
├── server.js          # Основной файл сервера
├── package.json       # Зависимости
├── .env              # Переменные окружения (не в git)
├── .env.example      # Пример переменных окружения
└── README.md         # Документация
```

## 📦 Зависимости

- `express` - Web framework
- `passport` - Аутентификация
- `passport-google-oauth20` - Google OAuth
- `passport-github2` - GitHub OAuth
- `express-session` - Управление сессиями
- `googleapis` - Google APIs
- `cors` - CORS middleware
- `dotenv` - Переменные окружения
# sdfwde
