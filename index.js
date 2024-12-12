// installation de nodejs
//npm init
//npm install body-parser express axios qs dotenv express-session

require('dotenv').config();
const { default: axios } = require('axios');
const express = require('express');
const qs = require('qs');
const app = express();
const crypto = require('crypto');
const session = require('express-session');

const port = process.env.PORT || 3000;

// Assurez-vous que CLIENT_ID est défini dans votre fichier .env
const ClientID = process.env.SPOTIFY_CLIENT_ID; 
const clientSECRET = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/callback';

// Utilisation de session pour gérer l'état
app.use(session({
  secret: ClientID,  // Remplacer par une chaîne sécurisée
  resave: false,
  saveUninitialized: true
}));

// Flux Authorization Code Flow
app.get('/login', function (req, res) {
  console.log('Route /login appelée');

  const scope = 'user-read-private user-read-email user-library-read user-read-recently-played';
  const state = crypto.randomBytes(16).toString('hex'); // Génére un état aléatoire
  req.session.state = state;  // Stocker l'état dans la session

  const url = 'https://accounts.spotify.com/authorize?' + qs.stringify({
    response_type: 'code',
    client_id: ClientID,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  });
  
  console.log('Redirection vers :', url);
  res.redirect(url); // Rediriger vers Spotify
});

// Flux Implicit Grant Flow
app.get('/implicit-login', function (req, res) {
  console.log('Route /implicit-login appelée');

  const scope = 'user-read-private user-read-email user-library-read user-read-recently-played';

  // Redirection pour obtenir un token en utilisant le Implicit Grant Flow
  const url = 'https://accounts.spotify.com/authorize?' + qs.stringify({
    response_type: 'token',  // L'accès se fait directement avec un access token
    client_id: ClientID,
    scope: scope,
    redirect_uri: redirect_uri,
  });

  console.log('Redirection vers :', url);
  res.redirect(url);  // Rediriger vers Spotify
});

// Callback pour le flux Authorization Code Flow
app.get('/callback', function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  // Vérifier que l'état correspond à celui attendu pour éviter les attaques CSRF
  if (state !== req.session.state) {
    return res.redirect('/#' + qs.stringify({
      error: 'state_mismatch'
    }));
  }

  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(ClientID + ':' + clientSECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    })
  };

  axios(authOptions) 
    .then(response => {
      const access_token = response.data.access_token;
      const refresh_token = response.data.refresh_token;

      // Le token d'accès est utilisé pour accéder aux données protégées
      console.log('Access Token :' + access_token);

      res.redirect('/success?' + qs.stringify({ access_token, refresh_token }));
    })
    .catch(error => {
      console.error('Erreur pour obtenir le access token:', error.response ? error.response.data : error.message);
      res.redirect('/#' + qs.stringify({error: 'failed_to_get_access_token'}));
    });
});

// Page de succès qui montre les tokens obtenus
app.get('/success', function(req, res) {
  const access_token = req.query.access_token;
  const refresh_token = req.query.refresh_token;

  if (!access_token || !refresh_token) {
    return res.status(400).send('Tokens manquants');
  }

  // Affichage des tokens et redirection vers l'endpoint des derniers titres joués
  res.send(`
    <h1>Connexion réussie !</h1>
    <p><strong>Access Token:</strong> ${access_token}</p>
    <p><strong>Refresh Token:</strong> ${refresh_token}</p>
    <p>Vous pouvez maintenant voir vos morceaux récemment joués.</p>
    <a href="/recently-played?access_token=${access_token}">Voir mes morceaux récemment joués</a>
  `);
});

// Page pour récupérer les derniers titres joués
app.get('/recently-played', function (req, res) {
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).send('Access token manquant');
  }

  // On utilise la variable accessTokenToMe pour les derniers titres joués
  const accessTokenToMe = access_token;

  const options = {
    url: 'https://api.spotify.com/v1/me/player/recently-played',
    headers: {
      'Authorization': `Bearer ${accessTokenToMe}`,
      'Content-Type': 'application/json'
    },
  };

  axios(options)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des derniers morceaux joués : ' + error);
      res.status(500).send('Erreur lors de la récupération des derniers morceaux joués');
    });
});

// Lancer l'application sur le port défini
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
