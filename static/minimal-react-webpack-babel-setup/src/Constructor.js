import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {createStore} from 'redux'

import Window from './Window';
import './Constructor.css';
import './Window.css';
import './index.css'

import grapesjs from 'grapesjs';
import exportGrapes from 'grapesjs-plugin-export';
import './../node_modules/grapesjs/dist/css/grapes.min.css';

class Constructor extends Component {
  constructor(props){
      super(props);
      this.save = this.save.bind(this);
      this.cancel = this.cancel.bind(this);
  }
  render() {
    return (
      <div className="Constructor">
        <div id="gjs"></div>
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
          </Window>
        </div>
      </div>
    );
  }
  cancel(){ window.open(window.location.origin + "/index/",'_self');}
  save(){
    let html = this.editor.getHtml();
    let css = this.editor.getCss();
    let data =  JSON.stringify({ 'html' : html, 'css': css })
    let message = "?data=" + encodeURIComponent(data);
    let url = window.location.origin + "/style/";
    window.open(url + message, '_self');
  }
  componentDidMount(){
    this.editor = grapesjs.init({
          plugins : [exportGrapes],
          pluginsOpts: {
            [exportGrapes]:{}
          },
          allowScripts: 1,
          container: '#gjs',
          fromElement: true,
          height: '100%',
          width: '100%',
          storageManager: { type: null },
          panels: { defaults: [] },
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
        },
      ],
    });

    this.editor.BlockManager.add('feed', {
      label: 'feed',
      content:
      `<div>
        <div id="feed"></div>
      </div>`,
    });

    this.editor.BlockManager.add('status', {
      label: 'status',
      content:
      `<div>
        <div id="status"></div>
      </div>`,
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

    this.editor.runCommand('preview');
    document.getElementsByClassName("gjs-cv-canvas")[0].style.zIndex = 0;
  }
}



export default Constructor;
