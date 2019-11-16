import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import ACodeParser from './ACodeParser';

ReactDOM.render(<ACodeParser />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}

serviceWorker.unregister();
