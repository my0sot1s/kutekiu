import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from '../helper/registerServiceWorker';

ReactDOM.render(
    <Provider store={require("./stores").default()}>
        <App />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
