import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // 다국어 설정
import { HelmetProvider } from 'react-helmet-async'; // [필수] 이 줄이 있어야 합니다!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* [필수] App을 HelmetProvider로 감싸야 합니다! */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);