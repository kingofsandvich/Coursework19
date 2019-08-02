import React from 'react';
import ReactDOM from 'react-dom';
import Feed from './Feed'
import Constructor from './Constructor'
import Window from './Window'
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

try {
  ReactDOM.render(
    <Window/>,
    document.getElementById('window')
  );
} catch (e) {

}
// ReactDOM = require('react-dom');
module.hot.accept();
