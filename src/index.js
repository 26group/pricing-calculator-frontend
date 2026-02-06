import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Auth0Provider } from '@auth0/auth0-react';
import { store } from './app/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

function Root() {
  if (!domain || !clientId) {
    console.error('Missing Auth0 environment variables (REACT_APP_AUTH0_DOMAIN, REACT_APP_AUTH0_CLIENT_ID).');
    return null;
  }

  const redirectUri = `${window.location.origin}/login`;

  const authorizationParams = {
    redirect_uri: redirectUri,
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
