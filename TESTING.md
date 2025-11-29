# 🧪 Тестирование Auth Server

## Быстрая проверка

### 1. Проверка работы сервера

```bash
curl https://xolo.onrender.com/
```

Ожидаемый ответ:
```json
{
  "message": "XOLO Browser Auth Server",
  "status": "running",
  "endpoints": {
    "google": "/auth/google",
    "github": "/auth/github",
    "user": "/api/user",
    "logout": "/api/logout"
  }
}
```

### 2. Проверка статуса авторизации

```bash
curl https://xolo.onrender.com/api/auth/status
```

Ожидаемый ответ (не авторизован):
```json
{
  "authenticated": false,
  "user": null
}
```

## Тестирование в браузере

### Вариант 1: Через example-integration.html

1. Откройте `auth-server/example-integration.html` в браузере
2. Убедитесь, что URL изменен на `https://xolo.onrender.com`
3. Нажмите "Google" или "GitHub"
4. Пройдите авторизацию
5. Проверьте, что информация о пользователе отображается

### Вариант 2: Через DevTools Console

Откройте консоль браузера и выполните:

```javascript
// Проверка статуса
fetch('https://xolo.onrender.com/api/auth/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);

// Открыть окно авторизации Google
window.open('https://xolo.onrender.com/auth/google', 'auth', 'width=500,height=700');

// После авторизации снова проверить статус
fetch('https://xolo.onrender.com/api/auth/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);
```

## Тестирование в Electron

### 1. Запустите ваш браузер

```bash
npm run dev
```

### 2. Проверьте WelcomePage

- При первом запуске должна появиться WelcomePage
- Должны быть видны кнопки "Войти через Google" и "Войти через GitHub"

### 3. Тест авторизации

1. Нажмите "Войти через Google"
2. Должно открыться новое окно с Google OAuth
3. Войдите в аккаунт
4. Окно должно закрыться автоматически
5. На WelcomePage должна появиться информация о пользователе

### 4. Проверка в DevTools

Откройте DevTools в Electron (Ctrl+Shift+I) и проверьте:

```javascript
// Проверка localStorage
console.log(localStorage.getItem('user'));

// Проверка через fetch
fetch('https://xolo.onrender.com/api/auth/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);
```

## Тестирование Google Services

После авторизации через Google:

```javascript
// Gmail
fetch('https://xolo.onrender.com/api/google/gmail', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);

// Calendar
fetch('https://xolo.onrender.com/api/google/calendar', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);

// Drive
fetch('https://xolo.onrender.com/api/google/drive', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log);
```

## Возможные проблемы

### 1. CORS ошибки

**Проблема:** `Access-Control-Allow-Origin` ошибка

**Решение:**
- Убедитесь, что `FRONTEND_URL` настроен правильно в .env
- Или установите `FRONTEND_URL=*` для разрешения всех источников

### 2. Cookie не сохраняются

**Проблема:** После авторизации статус остается "не авторизован"

**Решение:**
- Проверьте, что используется HTTPS (не HTTP)
- Убедитесь, что `credentials: 'include'` указан во всех fetch запросах
- Проверьте настройки cookie в браузере

### 3. Redirect URI mismatch

**Проблема:** Google/GitHub показывает ошибку redirect URI

**Решение:**
- Проверьте, что в Google/GitHub OAuth настройках указан правильный callback URL:
  - Google: `https://xolo.onrender.com/auth/google/callback`
  - GitHub: `https://xolo.onrender.com/auth/github/callback`

### 4. Сервер не отвечает (cold start)

**Проблема:** Первый запрос занимает 30-60 секунд

**Решение:**
- Это нормально для Render.com Free Tier
- Сервер "просыпается" после первого запроса
- Подождите и повторите запрос

### 5. Session expired

**Проблема:** Сессия истекает слишком быстро

**Решение:**
- Увеличьте `maxAge` в настройках cookie
- Реализуйте автообновление токенов

## Логи и отладка

### Render.com логи

1. Откройте https://dashboard.render.com/
2. Выберите ваш сервис
3. Перейдите в "Logs"
4. Смотрите логи в реальном времени

### Локальная отладка

Запустите сервер локально:

```bash
cd auth-server
npm install
npm start
```

Измените URL в `src/renderer/config/auth.ts`:
```typescript
export const AUTH_SERVER_URL = 'http://localhost:3001';
```

## Чек-лист перед продакшеном

- [ ] Google OAuth настроен с правильным callback URL
- [ ] GitHub OAuth настроен с правильным callback URL
- [ ] Все переменные окружения установлены на Render
- [ ] `SESSION_SECRET` - случайная длинная строка
- [ ] CORS настроен правильно
- [ ] Cookie работают с HTTPS
- [ ] Тестирование авторизации прошло успешно
- [ ] Google Services работают (для Google аккаунтов)
- [ ] Логи не показывают ошибок

## Полезные команды

```bash
# Проверка всех endpoints
curl https://xolo.onrender.com/
curl https://xolo.onrender.com/api/auth/status
curl https://xolo.onrender.com/api/user

# С cookies (после авторизации)
curl -b cookies.txt https://xolo.onrender.com/api/user
curl -b cookies.txt https://xolo.onrender.com/api/google/gmail
```

## Готово! ✅

Если все тесты прошли успешно, ваш auth-server готов к использованию!
