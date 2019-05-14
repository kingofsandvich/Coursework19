import React, { Component } from 'react';
import './BasicContainer.css';

// базовый контейнер
class BasicContainer extends Component {
  constructor(props){
      super(props);
      this.height = props.height;
      this.width = props.width;
      this.currentComp = React.createRef();
      //this.state = {content: props.};
  }
  render() {
    return (
      <div className="BasicContainer" ref={this.currentComp}>
        {this.props.children}
      </div>
    );
  }
  componentDidMount(){
    this.currentComp.current.style.height = this.height;
    this.currentComp.current.style.width = this.width;
  }
}



export default BasicContainer;
