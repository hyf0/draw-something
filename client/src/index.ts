import { hot } from 'react-hot-loader/root';
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import './index.scss';
import { IS_DEV } from './util/constants';

if (IS_DEV) {
  ReactDOM.render(React.createElement(hot(App)), document.getElementById('root'));
} else {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
}

