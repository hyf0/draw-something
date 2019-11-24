import { hot } from 'react-hot-loader/root';
import 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import './index.scss';
import { IS_DEV_CLIENT } from './util/constants';

if (IS_DEV_CLIENT) {
  ReactDOM.render(React.createElement(hot(App)), document.getElementById('root'));
} else {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
}

(function() { // 禁止手机浏览器下拉刷新的效果
  const bodyEl = document.querySelector('body') as HTMLBodyElement;
  bodyEl.addEventListener('touchmove', evt => {
    // console.log('touchstart');
    evt.preventDefault();
  }, {
    passive: false,
  });
}());
