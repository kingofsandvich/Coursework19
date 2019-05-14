import React, { Component } from 'react';
import './Post.css';
import Leash from "./Leash"

class Post extends Component {
  constructor(props){
      super(props);
      this.make_repost = this.make_repost.bind(this);
      this.set_like = this.set_like.bind(this);
      this.state = { text : props.text,
                     date : props.date,
                   photos : props.photos}
     let date = new Date(props.date*1000);
     this.owner_id = props.owner_id;
     this.post_id = props.post_id;
     this.formattedTime = ''+date.getFullYear()+'.'+date.getMonth()+'.'+date.getDate()+' ' + date.getHours() + ':' + ("0" + date.getMinutes()).substr(-2);
  }

  render() {
    let photos = [];
    let link = '';
    this.state.photos.map((value, index) =>  {
      try {
        link = value["photo"]['sizes'];
        link = link[Object.keys(link).length-1]['url'];
      } catch (e) {
      }
      photos.push(<img src={link}/>)
    })
    return (
      <div className="Post">
        <div id="sourceInfo">
          <p>{this.formattedTime}</p>
        </div>
        <div id="text">
          {this.state.text}
        </div>
        <div id="attachments">
          {photos}
        </div>
        <div id="actions">
          <button onClick={this.make_repost}>repost</button>
          <button id="biasedButton" onClick={this.set_like}>like</button>
        </div>
        <div id="comments"></div>
      </div>
    );
  }

  make_repost(){
    let url = window.location.origin + "/repost/" + this.owner_id + "/" + this.post_id +"/";
    fetch(url).catch();
  }
  set_like(){
    let url = window.location.origin + "/like/" + this.owner_id + "/" + this.post_id +"/";
    fetch(url).catch();
  }
  dataRecieved = (data) => {
    this.setState({posts: data});
  }
  componentDidUpdate(prevProps, prevState, snapshot){
  }
  componentDidMount(){
  }
}

export default Post;
