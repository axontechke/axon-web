import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {FirebaseAuthProvider} from './context/FirebaseAuthContext.tsx';
import {ConfigProvider, ConfigSuspense, useConfig} from './context/ConfigContext.tsx';
import {MetaPixel} from './components/MetaPixel.tsx';
import './index.css';

function MetaPixelLoader() {
  const {config} = useConfig();
  return <MetaPixel pixelId={config?.metaPixelId || ""} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <ConfigProvider>
        <ConfigSuspense>
          <MetaPixelLoader />
          <App />
        </ConfigSuspense>
      </ConfigProvider>
    </FirebaseAuthProvider>
  </StrictMode>,
);
