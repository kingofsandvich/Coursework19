import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {createStore} from 'redux'

import Window from './Window';
import Status from './Status'
import Feed from './Feed'
import './Constructor.css';
import './Window.css';
import './index.css'

import grapesjs from 'grapesjs';
import exportGrapes from 'grapesjs-plugin-export';
import './../node_modules/grapesjs/dist/css/grapes.min.css';

"use strict";
var elem = document.getElementById('constructor');

function openFullscreen() {
  if((!window.screenTop && !window.screenY) ||
     (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
      document.exitFullscreen();
  } else {
       elem.requestFullscreen();
  }
}

class Constructor extends Component {
  constructor(props){
      super(props);

      // window.alert = function () {  };
      // alert('qwerty');
      //
      // window.confirm = function () {  };
      // window.confirm();
      //
      // window.onbeforeunload=  function () { };
      // window.onbeforeunload();

      this.save = this.save.bind(this);
      this.cancel = this.cancel.bind(this);
      this.csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
      // window.confirm = function() { return false; };
      // window.onbeforeunload = function() { return false; };
      //
      // window.addEventListener('beforeunload', function (e) {
      //   // Cancel the event
      //   e.preventDefault();
      //   // Chrome requires returnValue to be set
      //   // e.returnValue = '';
      // });
  }
  render() {
    return (
      <div className="Constructor">
        <div id="gjs">

        </div>
        <div className="constrBar">
          <div className="toggleSwitch save" onClick={this.save}>
            <p className="noselect" id="constrButton">save</p>
          </div>
          <div className="toggleSwitch" onClick={this.cancel}>
            <p className="noselect" id="constrButton">canel</p>
          </div>
          <Window name="components" switchWidth="140px" height="400px" width="500px">
            <div id="blocks"></div>
          </Window>
          <Window name="styles" switchWidth="100px" height="400px" width="500px">
            <div class="styles-container"></div>
          </Window>
          <Window name="layers" switchWidth="100px" height="400px" width="500px">
            <div class="layers-container"></div>
          </Window>
          <Window name="code" switchWidth="100px" height="400px" width="500px">
              <div class="panel__basic-actions"></div>
              <div class="panel__devices"></div>
          </Window>
        </div>
      </div>
    );
  }
  cancel(){
    // window.confirm = function() { return false; };
    // window.onbeforeunload = function() { return false; };
    // window.open(window.location.origin + "/index/",'_self');
    window.location.replace(window.location.protocol + "//" + window.location.host + '/index');
  }
  save(){
    let html = this.editor.getHtml();
    let css = this.editor.getCss();
    // let data =  JSON.stringify({ 'html' : html, 'css': css })
    // let message = "?data=" + encodeURIComponent(data);
    // let url = window.location.origin + "/style/";
    // window.open(url + message, '_self');

    // POST
    let data = new FormData();
    data.append('csrfmiddlewaretoken', this.csrf);
    data.append('html', html);
    data.append('css', css);

    fetch("/style/set/", {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    }).then(function(response) {
      window.location.replace(window.location.protocol + "//" + window.location.host + '/index');
    }).catch(function(error) {
        console.log('error in processing new page styles on server');
    });
  }
  componentDidMount(){
    let css = '';
    let html = '';
    let data = new FormData();
    data.append('csrfmiddlewaretoken', this.csrf);


    // let request = async () => {
    //     let response = await fetch("/style/get/", {
    //         method: 'POST',
    //         body: data,
    //         credentials: 'same-origin',
    //     });
    //     let json = await response.json();
    //     json = JSON.parse(JSON.stringify(json));
    //     css = json['css'];
    //     html = json['html'];
    //     console.log(json['css']);
    //     console.log(json['html']);
    //     console.log(json);
    //     console.table(json);
    //     console.log(json);
    // }
    //
    // request();


    // request();

    this.editor = grapesjs.init({
          plugins : [exportGrapes],
          pluginsOpts: {
            [exportGrapes]:{}
          },
          allowScripts: 1,
          protectedCss: '',
          container: '#gjs',
          fromElement: true,
          height: '100%',
          width: '100%',
          storageManager: { type: null },
          panels: { defaults: [] },
          mediaCondition: 'min-width', // default is `max-width`
          deviceManager: {
            devices: [{
                name: 'Mobile',
                width: '320',
                widthMedia: '320',
              },{
                name: 'Tablet',
                width: '720',
                widthMedia: '720',
              }, {
                name: 'Desktop',
                width: '1024',
                widthMedia:'1024',
            }]
          },
          layerManager: {
            appendTo: '.layers-container'
          },
          blockManager: {
          appendTo: '#blocks',
          blocks: [
            {
              id: 'section',
              label: '<b>Section</b>',
              attributes: { class:'gjs-block-section' },
              content: `<section>
                <h1>This is a simple title</h1>
                <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
              </section>`,
            }, {
              id: 'text',
              label: 'Text',
              content: '<div data-gjs-type="text">Insert your text here</div>',
            }
          ]
        },
        styleManager: {
          appendTo: '.styles-container',
          sectors: [{
              name: 'размерность и отступы',
              open: false,
              buildProps: ['width','height', 'min-height', 'max-height', 'min-width', 'max-width', 'padding','margin'],
              properties: [
                {
                  type: 'integer',
                  name: 'The width',
                  property: 'width',
                  units: ['px', '%'],
                  defaults: 'auto',
                  min: 0,
                }
              ]
            },{
              name: 'цвета',
              open: false,
              buildProps: ['background-color', 'color', 'box-shadow', 'custom-prop'],
              properties: [
                {
                  id: 'custom-prop',
                  name: 'Custom Label',
                  property: 'font-size',
                  type: 'select',
                  defaults: '32px',
                  options: [
                    { value: '12px', name: 'Tiny' },
                    { value: '18px', name: 'Medium' },
                    { value: '32px', name: 'Big' },
                  ],
               }
              ]
            },{
              name: 'границы',
              open: false,
              buildProps: ['border'],
            },{
              name: 'расположение',
              open: false,
              buildProps: ['float','position', 'display','text-align','top', 'right', 'bottom', 'left'],
            },{
              name: 'шрифты',
              open: false,
              buildProps: ['font-family','font-weight', 'font-size','text-align','top', 'right', 'bottom', 'left'],
            }]
        },
    });

    this.editor.Panels.addPanel({
      id: 'panel-top',
      el: '.panel__top',
    });

    // this.editor.setDevice('Mobile');

    this.editor.Panels.addPanel({
        id: 'panel-devices',
        el: '.panel__devices',
        buttons: [{
            id: 'device-desktop',
            label: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"  viewBox="0 0 24 24"><path d="M21 14H3V4h18m0-2H3c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4a2 2 0 0 0-2-2z"></path></svg>',
            command: 'set-device-desktop',
            active: true,
            togglable: false,
          }, {
            id: 'device-tablet',
            label: '<svg viewBox="0 0 28 28" class="icon icon-tablet" width="32" height="32"  aria-hidden="true"><path d="M19.953 2h-15.506a1.92 1.92 0 0 0-1.921 1.924v22.556a1.92 1.92 0 0 0 1.921 1.92h15.506c1.062 0 1.922-0.862 1.923-1.922v-22.554a1.924 1.924 0 0 0-1.923-1.924z m-7.752 24.502a1.226 1.226 0 1 1 1.225-1.226c-0.001 0.761-0.552 1.225-1.225 1.226z m8.235-4.202h-16.47v-17.055h16.47v17.055z"/></svg>',
            command: 'set-device-tablet',
            togglable: false,
        }, {
          id: 'device-mobile',
          label: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"  viewBox="0 0 24 24"><path d="M16 18H7V4h9m-4.5 18c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4-21h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1z"></path></svg>',
          command: 'set-device-mobile',
          togglable: false,
      }],
      });


      // panel__fullscreen
      this.editor.Commands.add('set-device-desktop', {
        run: editor => editor.setDevice('Desktop')
      });
      this.editor.Commands.add('set-fullscreen', {
        run: editor => openFullscreen()
      });
      this.editor.Commands.add('set-device-tablet', {
        run: editor => editor.setDevice('Tablet')
      });
      this.editor.Commands.add('set-device-mobile', {
        run: editor => editor.setDevice('Mobile')
      });

    this.editor.Panels.addPanel({
      id: 'basic-actions',
      el: '.panel__basic-actions',
      buttons: [
        {
          id: 'export',
          className: 'btn-open-export',
          label: 'HTML & CSS',
          command: 'export-template',
          context: 'export-template',
        },{
          id: 'full',
          className: 'btn-fullscreen',
          label: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 18 18"><path d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"/></svg>',
          active: false,
          command: 'set-fullscreen',
          // context: 'export-template',
        },{
          id: 'markup',
          className: 'btn-markup',
          label: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>',
          active: true,
          command: 'sw-visibility',
          // context: 'export-template',
        },
      ],
    });

    this.editor.BlockManager.add('feed', {
      label: 'feed',
      content:
      `<div id="feed"></div>`,
    });

    this.editor.BlockManager.add('status', {
      label: 'status',
      content:
      `<div id="status">`,
    });

    this.editor.BlockManager.add('div', {
      label: 'div',
      content:
      `<div></div>`,
    });
    this.editor.BlockManager.add('span', {
      label: 'span',
      content:
      `<span></span>`,
    });

    let editor = this.editor;
    fetch("/style/get/", {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    }).then(function(response) {
      return response.json();
    }).then(function(myJson) {
      let json = JSON.parse(JSON.stringify(myJson));

      if (json['error']) {
        throw Error(json['error']);
      }
      css = json['css'];
      html = json['html'];

      console.log(editor.Canvas);
      console.log(editor);

      // console.log(json['css']);
      // console.log(json['html']);
      // console.log(json);
      // console.table(json);
      // Стили внутри редактора
      let react_script = '<script id="init_script" type="text/javascript" src="/static/minimal-react-webpack-babel-setup/dist/bundle.js"></script>';
      // editor.DomComponents.getWrapper().setStyle(css);
      editor.setStyle(css);
      editor.setComponents(html);

      if (!html.includes(react_script)){
      editor.setComponents(react_script);
      }
    }).catch(function(error) {
        console.log('error in processing new page styles on server');
    });


    this.editor.on('block:drag:stop', model => {
      // alert(document.getElementsByClassName('gjs-frame')[0].contentWindow.document.getElementById('feed'));
      // console.log(document.getElementsByClassName('gjs-frame')[0].contentWindow.document.getElementById('feed'));
      try {
        ReactDOM.render(
          <Feed/>,
          document.getElementsByClassName('gjs-frame')[0].contentWindow.document.getElementById('feed')
        );
      } catch (e) { }

      try {
        ReactDOM.render(
          <Status/>,
          document.getElementsByClassName('gjs-frame')[0].contentWindow.document.getElementById('status')

        );
      } catch (e) { }
    });
  }
}



export default Constructor;
