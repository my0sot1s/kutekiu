import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/App';
import registerServiceWorker from './helper/registerServiceWorker';
import { Provider } from 'react-redux'

ReactDOM.render(
    <Provider store={require("./stores").default()}>
        <App />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
