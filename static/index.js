import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {createStore} from 'redux'

import BasicContainer from './BasicContainer';
import ExpansionContainer from './ExpansionContainer'
import Leash from './Leash';
import Window from './Window';
import Constructor from './Constructor'
import Feed from './Feed'

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import interact from 'interactjs'


import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

function storeControl(state = [], action){
  if (action.type === "ADD_DATA"){
    return [
      ...state,
      action.content
    ]
  }
  return state;
}
const store = createStore(storeControl,
window.__REDUX_DEVTOOLS_EXTENSION__ &&
window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  //<Constructor/>
  <Feed/>
  ,  document.getElementById('root'));


interact('.ExpansionContainer')
    .resizable({
      // resize from all edges and corners
      edges: { left: false, right: true, bottom: true, top: false },

      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent',
          endOnly: true,
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 },
        }),
      ],

      inertia: true
    })
    .on('resizemove', function (event) {
      var target = event.target,
          x = (parseFloat(target.getAttribute('data-x')) || 0),
          y = (parseFloat(target.getAttribute('data-y')) || 0);

      // update the element's style
      target.style.width  = event.rect.width + 'px';
      target.style.height = event.rect.height + 'px';

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      //target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
      //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    });


const editor = grapesjs.init({
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: '#gjs',
      // Get the content for the canvas directly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      fromElement: true,
      // Size of the editor
      height: '100%',
      width: '100%',
      // Disable the storage manager for the moment
      storageManager: { type: null },
      // Avoid any default panel
      panels: { defaults: [] },
      blockManager: {
    appendTo: '#blocks',
    blocks: [
      {
        id: 'section', // id is mandatory
        label: '<b>Section</b>', // You can use HTML/SVG inside labels
        attributes: { class:'gjs-block-section' },
        content: `<section>
          <h1>This is a simple title</h1>
          <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
        </section>`,
      }, {
        id: 'text',
        label: 'Text',
        content: '<div data-gjs-type="text">Insert your text here</div>',
      }, {
        id: 'image',
        label: 'Image',
        // Select the component once it's dropped
        select: true,
        // You can pass components as a JSON instead of a simple HTML string,
        // in this case we also use a defined component type `image`
        content: { type: 'image' },
        // This triggers `active` event on dropped components and the `image`
        // reacts by opening the AssetManager
        activate: true,
      }
    ]
  },
});
editor.BlockManager.add('window', {
  label: 'window',
  content: '<div class="pseudoScreen"><div class="ExpansionContainer" width="500px" height="400px" style="top: 232px; left: 148px; z-index: 1;"><div><div id="title" class="Leash"><p class="noselect">components</p></div><div class="toggleButton"><div><p class="noselect">-</p></div></div></div><div id="scroller"><div id="blocks"><div class="gjs-blocks-cs gjs-one-bg gjs-two-color"> <div class="gjs-block-categories"></div> <div class="gjs-blocks-no-cat"> <div class="gjs-blocks-c"><div class="gjs-block-section gjs-block gjs-one-bg gjs-four-color-h" title="Section" draggable="true"><div class="gjs-block-label"><b>Section</b></div></div><div class=" gjs-block gjs-one-bg gjs-four-color-h" title="Text" draggable="true"><div class="gjs-block-label">Text</div></div><div class=" gjs-block gjs-one-bg gjs-four-color-h" title="Image" draggable="true"><div class="gjs-block-label">Image</div></div><div class=" gjs-block gjs-one-bg gjs-four-color-h" title="window" draggable="true"><div class="gjs-block-label">window</div></div></div></div> </div></div></div>',
})

//document.getElementsByClassName("gjs-cv-canvas")[0].style.zIndex = 0;


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
