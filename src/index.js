import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { AuthKitProvider } from '@workos-inc/authkit-react';
import { store } from './app/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const clientId = process.env.REACT_APP_WORKOS_CLIENT_ID;

function Root() {
  if (!clientId) {
    console.error('Missing REACT_APP_WORKOS_CLIENT_ID environment variable.');
    return null;
  }

  const redirectUri = `${window.location.origin}/login`;

  return (
    <AuthKitProvider clientId={clientId} redirectUri={redirectUri}>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthKitProvider>
  );
}

root.render(<Root />);
