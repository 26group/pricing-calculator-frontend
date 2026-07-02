import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Auth0Provider } from '@auth0/auth0-react';
import posthog from 'posthog-js';
import { store } from './app/store';
import App from './App';

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_POSTHOG_KEY) {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

function Root() {
  if (!domain || !clientId) {
    return null;
  }

  const redirectUri = `${window.location.origin}/login`;

  const authorizationParams = {
    redirect_uri: redirectUri,
    scope: 'openid profile email',
  };

  // Only include audience if it's set and not a placeholder
  if (audience && audience !== 'your-api-audience') {
    authorizationParams.audience = audience;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </Auth0Provider>
  );
}

root.render(<Root />);
