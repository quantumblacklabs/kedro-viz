import React from 'react';
import ReactDOM from 'react-dom';
import '@quantumblack/carbon-ui-components/dist/carbon-ui.min.css';
import registerServiceWorker from './utils/registerServiceWorker';
import App from './app';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
