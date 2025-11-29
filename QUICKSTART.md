# 🚀 Быстрый старт

## 1. Установка

```bash
cd auth-server
npm install
```

## 2. Настройка OAuth

### Google OAuth (5 минут)

1. Откройте https://console.cloud.google.com/
2. Создайте новый проект
3. Включите Google+ API
4. Credentials → Create Credentials → OAuth client ID
5. Web application
6. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
7. Скопируйте Client ID и Client Secret

### GitHub OAuth (3 минуты)

1. Откройте https://github.com/settings/developers
2. New OAuth App
3. Заполните:
   - Name: `XOLO Browser`
   - Homepage: `http://localhost:3001`
   - Callback: `http://localhost:3001/auth/github/callback`
4. Скопируйте Client ID и Client Secret

## 3. Создайте .env файл

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
GOOGLE_CLIENT_ID=ваш_google_client_id
GOOGLE_CLIENT_SECRET=ваш_google_secret

GITHUB_CLIENT_ID=ваш_github_client_id
GITHUB_CLIENT_SECRET=ваш_github_secret

PORT=3001
SESSION_SECRET=любая_случайная_строка
FRONTEND_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

## 4. Запуск

```bash
npm start
```

Сервер запустится на http://localhost:3001

## 5. Тестирование

Откройте `example-integration.html` в браузере или используйте:

```bash
# Linux/Mac
xdg-open example-integration.html

# Или просто откройте файл в браузере
```

## 6. Интеграция с XOLO Browser

В вашем Electron приложении используйте:

```typescript
// Открыть окно авторизации
const authWindow = window.open(
  'http://localhost:3001/auth/google',
  'auth',
  'width=500,height=700'
);

// Проверить статус
const response = await fetch('http://localhost:3001/api/auth/status', {
  credentials: 'include'
});
const data = await response.json();

if (data.authenticated) {
  console.log('Пользователь:', data.user);
}
```

## Готово! 🎉

Теперь ваш браузер может:
- ✅ Авторизовывать пользователей через Google/GitHub
- ✅ Получать доступ к Gmail, Calendar, Drive (для Google)
- ✅ Хранить сессии пользователей
- ✅ Работать с Google API

## Следующие шаги

1. Интегрируйте auth-server с WelcomePage
2. Добавьте сохранение токенов в electron-store
3. Настройте автообновление токенов
4. В продакшене используйте HTTPS и базу данных
