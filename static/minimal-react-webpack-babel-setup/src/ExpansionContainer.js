import React, { Component } from 'react';
import './ExpansionContainer.css';
import Leash from "./Leash"

// расширяемый контейнер контейнер
class ExpansionContainer extends Component {
  constructor(props){
      super(props);
      this.height = props.height;
      this.width = props.width;
      this.currentComp = React.createRef();
  }
  render() {
    return (
      <div className="ExpansionContainer" ref={this.currentComp}>

        <din className="ECHeader">
          <Leash content="window"/>
        </div>
          <div id="scroller">
            {this.props.children}
          </div>
      </div>
    );
  }
  componentDidMount(){
    this.currentComp.current.style.height = this.height;
    this.currentComp.current.style.width = this.width;
  }
}



export default ExpansionContainer;
