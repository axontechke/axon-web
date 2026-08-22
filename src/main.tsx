import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {FirebaseAuthProvider} from './context/FirebaseAuthContext.tsx';
import {ConfigProvider, ConfigSuspense} from './context/ConfigContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <ConfigProvider>
        <ConfigSuspense>
          <App />
        </ConfigSuspense>
      </ConfigProvider>
    </FirebaseAuthProvider>
  </StrictMode>,
);
