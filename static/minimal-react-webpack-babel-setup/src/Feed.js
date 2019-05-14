import React, { Component } from 'react';
import './Feed.css';
import Post from "./Post"

class Feed extends Component {
  constructor(props){
      super(props);
      this.getLatestPosts = this.getLatestPosts.bind(this);
      this.getElderPosts = this.getElderPosts.bind(this);
      this.handleScroll = this.handleScroll.bind(this);

      this.num_leave = 10;
      this.max_num = 100;

      let postsList = []
      + new Date()
      if (!Date.now) Date.now = function() { return new Date().getTime(); }

      this.step = 3600; // юникс время в с
      // юникс время первого поста в ленте
      this.lastPostDate = Math.floor(Date.now() / 1000);
      // юникс время последнего поста в ленте
      this.firstPostDate = this.lastPostDate - this.step;
      this.scroller = null;
      this.state = { posts : []}
  }

  handleScroll(){
    if(this.scroller){
      let bottom = this.scroller.offsetHeight ? this.scroller.scrollHeight - this.scroller.scrollTop - this.scroller.offsetHeight : 0;
      if (this.scroller.scrollTop <= 0.5){
        this.getLatestPosts();
      }
      if (bottom <= 0.5){
        this.getElderPosts();
      }
    }
  }

  render() {
    return (
      <div className="Feed">
        <button onClick={this.getLatestPosts} type="button">Загрузить новые записи</button>
        <div>
          {this.state.posts.map((item, key) => <Post key={item.id} date={item.date} text={item.text} photos={item.photos} owner_id={item.owner_id} post_id={item.post_id}/>)}
        </div>
        <button onClick={this.getElderPosts} type="button">Загрузить ранние записи</button>
      </div>
    );
  }

  processData = (data) => {
    let processed_dat = []
    let vk = data['vk']
    for (let obj of vk) {
        try {
          switch (obj.type) {
            case "audio":
              break;
            case "post":
              let attachments = obj["attachments"];
              let photos = [];
              let videos = [];
              let audio = [];

              for (let att of attachments){
                switch (att["type"]) {
                  case "photo":
                    photos.push(att)
                    break;
                  case "video":

                    break;
                  case "audio":

                    break;
                  default:

                }
              }
              processed_dat.push({
                date : parseInt(obj["date"], 10),
                text : obj["text"],
                owner_id : -parseInt(obj["source_id"]),
                post_id : obj["post_id"],
                photos : photos
              })
              break;
            case "wall_photo":
              console.log('wall_photo');
              break;
            case "friend":
              console.log('friend');
              break;
              case "video":
                console.log('video');
                break;
            default:
              console.log('unknown vk category');
            }
          //console.log('Parsing vk JSON  went ok',obj);
        } catch (e) {
          //console.log('Problem parsing vk JSON',obj);
        }
      }
      return processed_dat;
  }

  dataRecieved = (data) => {
    let processed_dat = this.processData(data);
    this.setState({posts: processed_dat});
  }

  updateTop = (data) => {
    const  postsCopy = Object.assign([], this.state.posts);
    let processed_dat = this.processData(data);
    for (let obj of processed_dat){
      postsCopy.unshift(obj);
    }

    if (this.state.posts.length !== postsCopy.length){
      location.reload(true);
    }
    this.setState({posts: postsCopy});
  }

  updateBottom = (data) => {
    const  postsCopy = Object.assign([], this.state.posts);
    let processed_dat = this.processData(data);
    for (let obj of processed_dat){
      postsCopy.push(obj);
    }

    this.setState({posts: postsCopy});
  }

  componentWillMount(){
    let url = window.location.origin + "/feed/"+this.firstPostDate+"/"+this.lastPostDate+"/";
    fetch(url, {mode: 'cors'}).then(response => response.json()).then(this.dataRecieved).catch();
  }

  getLatestPosts(){
      + new Date()
      if (!Date.now) Date.now = function() { return new Date().getTime(); }
      let curTime = Math.floor(Date.now() / 1000);
      let url = window.location.origin + "/feed/"+(this.lastPostDate + 1)+"/"+curTime+"/";
      fetch(url, {mode: 'cors'}).then(response => response.json()).then(this.updateTop).catch();
      this.lastPostDate = curTime;
  }

  getElderPosts(){
    let url = window.location.origin + "/feed/"+(this.firstPostDate - this.step)+"/"+(this.firstPostDate - 1)+"/";
    fetch(url, {mode: 'cors'}).then(response => response.json()).then(this.updateBottom).catch();
    this.firstPostDate = this.firstPostDate - this.step;
  }
}

export default Feed;
