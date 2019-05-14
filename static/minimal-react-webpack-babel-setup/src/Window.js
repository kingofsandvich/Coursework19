import React, { Component } from 'react';
import './ExpansionContainer.css';
import './Window.css';
import Leash from "./Leash"
import interact from 'interactjs'

var maxZIndex = 0;

class Window extends Component {
  constructor(props){
      super(props);
      this.height = props.height;
      this.width = props.width;
      this.currentComp = React.createRef();
      this.name = props.name;
      this.switchWidth = "100px";
      this.switchWidth = props.switchWidth;
      this.switch = React.createRef();
      this.button = React.createRef();
      this.window = React.createRef();
      this.all = React.createRef();
      this.isOpened = false;
      this.switchVisability = this.switchVisability.bind(this);
      this.onMouseOver = this.onMouseOver.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.timeOpened = Date.now()
  }
  render() {
    return (
      <div className="Window" ref={this.all}>
        <div className="toggleSwitch" ref={this.switch} onMouseLeave={this.onMouseLeave} onMouseOver ={ this.onMouseOver  }>
          <p class="noselect">{this.name}</p>
        </div>
        <div class="pseudoScreen" ref={this.window}>
          <div className="ExpansionContainer" width={this.width} height={this.height} ref={this.currentComp}>
            <div>
              <Leash content={this.name}/>
              <div className="toggleButton">
                <div ref={this.button}><p class="noselect">-</p></div>
              </div>
            </div>
            <div id="scroller">
              {this.props.children}
            </div>
        </div>
        </div>
      </div>
    );
  }
  componentDidMount(){
    this.switch.current.style.width = this.switchWidth;
    this.all.current.style.width = this.switchWidth;
    this.switch.current.onclick = this.switchVisability;
    this.button.current.onclick = this.switchVisability;
    this.switch.current.childNodes[0].style.textDecoration =  "underline";
    this.window.current.style.display = this.isOpened ? 'block':'none';
    this.switch.current.childNodes[0].style.textDecoration = this.isOpened ? "underline":'none';
    this.window.current.onclick = ()=>{
      if (maxZIndex.toString(10) !== this.window.current.childNodes[0].style.zIndex){
        console.log("", (maxZIndex + 1).toString(10));
        maxZIndex = maxZIndex + 1;
        this.currentComp.current.style.zIndex = (maxZIndex).toString(10);
      }};

    interact('.ExpansionContainer')
          .resizable({
            edges: { left: false, right: true, bottom: true, top: false },
            modifiers: [
              interact.modifiers.restrictEdges({
                outer: 'parent',
                endOnly: true,
              }),
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

            target.style.width  = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          });
  }

  onMouseOver (){
    if (Date.now() - this.timeOpened >= 3000)
      this.window.current.style.opacity = '0.6';
  }
  onMouseLeave(){
    this.window.current.style.opacity = '1.0';
  }

  switchVisability(){
    if (this.isOpened) {
      this.window.current.style.display = 'none';
      this.switch.current.childNodes[0].style.textDecoration =  "none";
    }
    else{
      this.window.current.style.display = 'block';
      this.switch.current.childNodes[0].style.textDecoration =  "underline";
      this.timeOpened = Date.now();
    }
    this.isOpened = !this.isOpened;
    this.window.current.style.opacity = '1.0'
  }
}



export default Window;
