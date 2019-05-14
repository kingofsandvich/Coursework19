import React from 'react';
import ReactDOM from 'react-dom';
import Feed from './Feed'
import Constructor from './Constructor'
import Status from './Status'


try {
  ReactDOM.render(
    <Constructor/>,
    document.getElementById('constructor')
  );
} catch (e) {

}

try {
  ReactDOM.render(
    <Feed/>,
    document.getElementById('feed')
  );
} catch (e) {

}

try {
  ReactDOM.render(
    <Status/>,
    document.getElementById('status')
  );
} catch (e) {

}

module.hot.accept();
