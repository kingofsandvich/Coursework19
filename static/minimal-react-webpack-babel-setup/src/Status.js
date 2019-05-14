import React, { Component } from 'react';
import './Status.css';

class Status extends Component {
  constructor(props){
      super(props);
      this.sendStatus = this.sendStatus.bind(this);
  }

  render() {
    return (
      <div className="Feed">
        <form>
          <div>Введите новый статус: <input type="text" id="statusField"/><br/>
          <input type="submit" value="изменить статус" onClick={this.sendStatus}/></div>
        </form>
      </div>
    );
  }

  sendStatus(){
    let url =  window.location.origin + "/change_status/vk/";
    url = url + "?data=" + encodeURIComponent(document.getElementById("statusField").value);
    fetch(url).catch();
  }
}

export default Status;
