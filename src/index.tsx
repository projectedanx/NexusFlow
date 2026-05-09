/**
 * @fileoverview Entry point for the React application.
 * Bootstraps the root component and attaches it to the HTML DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Retrieves the DOM element where the React application will be mounted.
 *
 * @constant {HTMLElement | null} rootElement
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * The React Root node created from the target DOM element.
 *
 * @constant {ReactDOM.Root} root
 */
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
