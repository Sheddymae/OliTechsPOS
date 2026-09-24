import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { PlatformAdmin } from './PlatformAdmin.jsx';
import { PublicLanding, PublicSignup } from './public-site.jsx';

const path = window.location.pathname;
const Component =
  path === '/signup'
    ? PublicSignup
    : path === '/platform-admin'
      ? PlatformAdmin
      : (path === '/login' || path === '/admin' || path.startsWith('/app'))
        ? App
        : PublicLanding;

createRoot(document.getElementById('root')).render(React.createElement(Component));
