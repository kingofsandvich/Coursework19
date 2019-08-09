import React, { Component } from 'react';
import './Forms.css';

// function openTab(evt, tabName) {
//   alert("!");
//   var i, ulcorner, tablink;
//   ulcorner = document.getElementsByClassName("ULCorner");
//   for (i = 0; i < ulcorner.length; i++) {
//     ulcorner[i].style.display = "none";
//   }
//   tablink = document.getElementsByClassName("tablink");
//   for (i = 0; i < tablink.length; i++) {
//     tablink[i].className = tablink[i].className.replace(" active", "");
//   }
//   document.getElementById(tabName).style.display = "block";
//   evt.currentTarget.className += " active";
// }


// расширяемый контейнер контейнер
class PasswordForm extends Component {
  constructor(props){
      super(props);
      // this.height = props.height;
      // this.width =  props.width;
      //
      // this.loginLink      = React.createRef();
      // this.registerLink   = React.createRef();
      // this.login          = React.createRef();
      // this.register       = React.createRef();
      //
      // this.loginButtonClick    = this.loginButtonClick.bind(this);
      // this.registerButtonClick = this.registerButtonClick.bind(this);
      //
      // // this.openTab = this.openTab.bind(this);
      // this.openLog= this.openLog.bind(this);
      // this.openReg= this.openReg.bind(this);
  }
  render() {
    // <form>
    //   <input type="text" placeholder="mail"></input>
    //   <input type="submit" value="submit"></input>
    //
    //   <input type="button" onclick="alert('Hello World!')" value="Click Me!"></input>
    //
    //   <select name="cars">
    //     <option value="volvo">Volvo</option>
    //     <option value="saab">Saab</option>
    //     <option value="fiat">Fiat</option>
    //     <option value="audi">Audi</option>
    //   </select>
    //
    //   <label class="brand_checkbox">Two
    //     <input type="checkbox"></input>
    //     <span class="checked"></span>
    //   </label>
    //
    //   <label class="brand_checkbox Radio">Two
    //     <input type="radio" name="radio"></input>
    //     <span class="checked"></span>
    //   </label>
    //   <label class="brand_checkbox Radio">Two
    //     <input type="radio"  name="radio"></input>
    //     <span class="checked"></span>
    //   </label>
    // </form>
    return (
      <div className="PasswordForm">
          <div className="form_header">
            <div className="ULCorner">
              Profile
            </div>
          </div>
          <div className="form_content">
            <div id="login" className="tablink active">
              <form>
                <input type="text" title="mail" placeholder="mail"></input>
                <input type="text" title="login" placeholder="login"></input>
                <input type="text" title="password" placeholder="password"></input>
                <input type="text" title="repeat password" placeholder="repeator password"></input>
                <input type="button" value="update"></input>
              </form>
              <div className="APIs">
                <div className="APIform form_content">
                  <form>
                    <select name="source">
                      <option value="vk">vk.com</option>
                      <option value="fb">fb.com</option>
                      <option value="google">google.com</option>
                    </select>
                    <input type="text" title="login" placeholder="login"></input>
                    <input type="text" title="password" placeholder="password"></input>
                    аутентификация:
                    <label class="brand_checkbox Radio">двухфакторная
                      <input type="radio" name="auth" checked></input>
                      <span class="checked"></span>
                    </label>
                    <label class="brand_checkbox Radio">обычная
                      <input type="radio"  name="auth"></input>
                      <span class="checked"></span>
                    </label>
                    <input type="button" value="edit"></input>
                    аккаунт не доступен
                    <br/>
                    использовать?
                    <label class="brand_checkbox">использовать аккаунт
                      <input type="checkbox"></input>
                      <span class="checked"></span>
                    </label>
                  </form>
                </div>
              </div>
              <div id="title" className="LRCorner">
                +
              </div>
            </div>
          </div>
      </div>
    );
  }// <button  className="UpperBottom">Upper</button >
  //      <button  className="LowerBottom">Lower</button >
  // componentDidMount(){
  //   this.loginLink.current.onclick = this.openLog;
  //   this.registerLink.current.onclick = this.openReg;
  //
  //
  //   // this.login.current.style.display = 'block';
  //   // this.register.current.style.display = 'none';
  //   this.registerLink.current.className += " active";
  //   this.register.current.className += " active";
  // }
  // openReg(){
  //   if (!this.register.current.className.includes("active")){
  //     this.loginLink.current.className = this.loginLink.current.className.replace(" active","");
  //     this.login.current.className = this.login.current.className.replace(" active","");
  //
  //     this.registerLink.current.className += " active";
  //     this.register.current.className += " active";
  //   }
  // }
  // openLog(){
  //   if (!this.login.current.className.includes("active")){
  //     this.registerLink.current.className = this.registerLink.current.className.replace(" active","");
  //     this.register.current.className = this.register.current.className.replace(" active","");
  //
  //     this.login.current.className += " active";
  //     this.loginLink.current.className += " active";
  //   }
  // }
  // loginButtonClick(){
  //   alert("login");
  // }
  //
  // registerButtonClick(){
  //   alert("register");
  // }
}

export default PasswordForm;
