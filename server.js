import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Хранилище пользователей (в продакшене используйте БД)
const users = new Map();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'xolo-browser-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // В продакшене установите true с HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      provider: 'google',
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      accessToken,
      refreshToken
    };
    
    users.set(user.id, user);
    return done(null, user);
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      provider: 'github',
      username: profile.username,
      name: profile.displayName || profile.username,
      picture: profile.photos[0].value,
      email: profile.emails?.[0]?.value,
      accessToken,
      refreshToken
    };
    
    users.set(user.id, user);
    return done(null, user);
  }
));

// Routes

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'XOLO Browser Auth Server',
    status: 'running',
    endpoints: {
      google: '/auth/google',
      github: '/auth/github',
      user: '/api/user',
      logout: '/api/logout'
    }
  });
});

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Успешная авторизация
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin: 0 0 10px 0;
            }
            p {
              color: #666;
              margin: 0 0 20px 0;
            }
            .user-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .user-info img {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Успешная авторизация!</h1>
            <p>Вы вошли через Google</p>
            <div class="user-info">
              <img src="${req.user.picture}" alt="Avatar">
              <div><strong>${req.user.name}</strong></div>
              <div style="color: #888; font-size: 14px;">${req.user.email}</div>
            </div>
            <p style="margin-top: 20px; font-size: 14px;">Окно закроется автоматически...</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
);

// GitHub Auth
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #24292e 0%, #000000 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin: 0 0 10px 0;
            }
            p {
              color: #666;
              margin: 0 0 20px 0;
            }
            .user-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .user-info img {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Успешная авторизация!</h1>
            <p>Вы вошли через GitHub</p>
            <div class="user-info">
              <img src="${req.user.picture}" alt="Avatar">
              <div><strong>${req.user.name}</strong></div>
              <div style="color: #888; font-size: 14px;">@${req.user.username}</div>
            </div>
            <p style="margin-top: 20px; font-size: 14px;">Окно закроется автоматически...</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
);

// Failure redirect
app.get('/auth/failure', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Ошибка авторизации</h1>
          <p>Попробуйте еще раз</p>
        </div>
      </body>
    </html>
  `);
});

// API: Получить текущего пользователя
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        provider: req.user.provider,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture,
        username: req.user.username
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Не авторизован'
    });
  }
});

// API: Выход
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ошибка выхода' });
    }
    res.json({ success: true, message: 'Успешный выход' });
  });
});

// API: Проверка статуса авторизации
app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      provider: req.user.provider,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture
    } : null
  });
});

// API: Google Services (работают только для авторизованных через Google)
app.get('/api/google/gmail', async (req, res) => {
  if (!req.isAuthenticated() || req.user.provider !== 'google') {
    return res.status(401).json({ error: 'Требуется авторизация через Google' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10
    });

    res.json({ success: true, messages: response.data.messages });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения писем', details: error.message });
  }
});

app.get('/api/google/calendar', async (req, res) => {
  if (!req.isAuthenticated() || req.user.provider !== 'google') {
    return res.status(401).json({ error: 'Требуется авторизация через Google' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json({ success: true, events: response.data.items });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения событий', details: error.message });
  }
});

app.get('/api/google/drive', async (req, res) => {
  if (!req.isAuthenticated() || req.user.provider !== 'google') {
    return res.status(401).json({ error: 'Требуется авторизация через Google' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, modifiedTime)'
    });

    res.json({ success: true, files: response.data.files });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения файлов', details: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Auth Server запущен на http://localhost:${PORT}`);
  console.log(`📝 Настройте .env файл с вашими OAuth credentials`);
  console.log(`\nДоступные endpoints:`);
  console.log(`  - Google Auth: http://localhost:${PORT}/auth/google`);
  console.log(`  - GitHub Auth: http://localhost:${PORT}/auth/github`);
  console.log(`  - User Info: http://localhost:${PORT}/api/user`);
  console.log(`  - Gmail: http://localhost:${PORT}/api/google/gmail`);
  console.log(`  - Calendar: http://localhost:${PORT}/api/google/calendar`);
  console.log(`  - Drive: http://localhost:${PORT}/api/google/drive`);
});
