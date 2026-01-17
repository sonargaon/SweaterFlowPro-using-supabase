
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global error listener for debugging production deployments
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error Captured:", { message, source, lineno, colno, error });
  return false;
};

const root = ReactDOM.createRoot(rootElement);
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error("Render Error:", err);
}
