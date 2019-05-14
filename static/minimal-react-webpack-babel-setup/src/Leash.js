import React, { Component } from 'react';
import './Leash.css';

class Leash extends Component {
  constructor(props){
      super(props);
      this.currentComp = React.createRef();
      this.mouseDown = this.mouseDown.bind(this);
      this.closeDragElement = this.closeDragElement.bind(this);
      this.elementDrag = this.elementDrag.bind(this);
      this.difX = 0;
      this.difY = 0;
      this.posX = 0;
      this.posY = 0;
      this.parent= null;
      this.content = props.content;
  }
  render() {
    return (
      <div id="title" className="Leash" ref={this.currentComp} onMouseDown ={this.mouseDown}>
        <p class="noselect">{this.content}</p>
      </div>
    );
  }

  componentDidMount(){
    // получаем DOM элемент
    this.parent = this.currentComp.current.parentNode.parentNode;
    // назначаем события для его передвижения
  }

  mouseDown(e){
    e = e || window.event;
    e.preventDefault();
    this.posX = e.clientX;
    this.posY = e.clientY;document.onmouseup = this.closeDragElement;
    document.onmousemove = this.elementDrag;
  }

  closeDragElement(e){
    document.onmouseup = null;
    document.onmousemove = null;
  }

  elementDrag(e){
    this.difX = this.posX - e.clientX;
    this.difY = this.posY - e.clientY;
    this.posX = e.clientX;
    this.posY = e.clientY;
    this.parent.style.top = (this.parent.offsetTop - this.difY) + "px";
    this.parent.style.left = (this.parent.offsetLeft - this.difX) + "px";
  }
}

export default Leash;
