# 🚀 Деплой на Render.com

## Ваш сервер: https://xolo.onrender.com

## Настройка OAuth для продакшена

### Google OAuth

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в **Credentials**
4. Отредактируйте ваш OAuth 2.0 Client ID
5. В **Authorized redirect URIs** добавьте:
   ```
   https://xolo.onrender.com/auth/google/callback
   ```
6. Сохраните изменения

### GitHub OAuth

1. Откройте [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Выберите ваше приложение
3. Обновите **Authorization callback URL**:
   ```
   https://xolo.onrender.com/auth/github/callback
   ```
4. Сохраните изменения

## Переменные окружения на Render

В настройках вашего сервиса на Render.com установите:

```env
GOOGLE_CLIENT_ID=ваш_google_client_id
GOOGLE_CLIENT_SECRET=ваш_google_secret

GITHUB_CLIENT_ID=ваш_github_client_id
GITHUB_CLIENT_SECRET=ваш_github_secret

PORT=3001
SESSION_SECRET=случайная_длинная_строка_для_безопасности

# ВАЖНО: Укажите URL вашего Electron приложения
FRONTEND_URL=*

# Callback URLs
GOOGLE_CALLBACK_URL=https://xolo.onrender.com/auth/google/callback
GITHUB_CALLBACK_URL=https://xolo.onrender.com/auth/github/callback
```

## CORS настройки

Для работы с Electron приложением нужно разрешить CORS. В `server.js` уже настроено:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Для продакшена можно использовать:
- `FRONTEND_URL=*` - разрешить все источники (не рекомендуется)
- `FRONTEND_URL=https://yourdomain.com` - конкретный домен
- Или настроить динамическую проверку origin

## Cookie настройки для HTTPS

В `server.js` обновите настройки сессии для HTTPS:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true для HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

## Проверка работы

1. Откройте https://xolo.onrender.com
2. Должны увидеть JSON с информацией о сервере
3. Попробуйте авторизацию через example-integration.html

## Интеграция с Electron

В вашем Electron приложении URL уже обновлен на:
```typescript
// src/renderer/config/auth.ts
export const AUTH_SERVER_URL = 'https://xolo.onrender.com';
```

## Важные замечания

### 1. Render.com Free Tier
- Сервер "засыпает" после 15 минут неактивности
- Первый запрос может занять 30-60 секунд (cold start)
- Рекомендуется использовать платный план для продакшена

### 2. Безопасность
- Используйте сильный `SESSION_SECRET`
- Настройте правильный `FRONTEND_URL`
- В продакшене используйте базу данных вместо in-memory хранилища

### 3. База данных
Для продакшена замените Map на PostgreSQL:

```javascript
// Установите
npm install pg

// Используйте
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Мониторинг

Логи доступны в Render Dashboard:
https://dashboard.render.com/

## Обновление

При push в GitHub, Render автоматически деплоит новую версию.

## Тестирование

```bash
# Проверка статуса
curl https://xolo.onrender.com/

# Проверка авторизации
curl https://xolo.onrender.com/api/auth/status
```

## Готово! 🎉

Теперь ваш XOLO Browser может использовать облачный auth-server для авторизации пользователей.
