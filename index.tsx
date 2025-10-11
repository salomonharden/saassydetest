// Import the React library, which is the core of the application.
import React from 'react';
// Import ReactDOM/client, which provides the methods to render React components into the DOM.
import ReactDOM from 'react-dom/client';
// Import the main App component and the new I18nProvider.
import App, { I18nProvider } from './App';

// Get the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
// Check if the root element exists in the HTML to prevent runtime errors.
if (!rootElement) {
  // If the root element is not found, throw an error to stop execution.
  throw new Error("Could not find root element to mount to");
}

// Create a new React root instance for concurrent rendering.
const root = ReactDOM.createRoot(rootElement);
// Render the application into the root element.
root.render(
  // Use React.StrictMode to highlight potential problems in the app during development.
  <React.StrictMode>
    {/* Wrap the entire application with the I18nProvider to handle language state. */}
    <I18nProvider>
      {/* The main App component is rendered here. */}
      <App />
    </I18nProvider>
  </React.StrictMode>
);
