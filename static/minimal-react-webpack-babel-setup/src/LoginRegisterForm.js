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
class LoginRegisterForm extends Component {
  constructor(props){
      super(props);
      this.height = props.height;
      this.width =  props.width;

      this.loginLink      = React.createRef();
      this.registerLink   = React.createRef();
      this.login          = React.createRef();
      this.register       = React.createRef();
      this.regForm        = React.createRef();
      this.logForm        = React.createRef();
      this.logMessage     = React.createRef();
      this.regMessage     = React.createRef();

      this.loginButtonClick    = this.loginButtonClick.bind(this);
      this.registerButtonClick = this.registerButtonClick.bind(this);

      // this.openTab = this.openTab.bind(this);
      this.openLog= this.openLog.bind(this);
      this.openReg= this.openReg.bind(this);

      this.csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
  }
  render() {
    return (
      <div className="LoginRegisterForm">
          <div className="form_header">
            <div ref={this.loginLink} className="ULCorner">
              Вход
            </div>
            <div ref={this.registerLink} className="ULCorner">
              Регистрация
            </div>
          </div>
          <div className="form_content">
            <div id="login" className="tablink" ref={this.register}>
              <form ref={this.regForm}>
                <input type="text" name="mail" title="mail" placeholder="mail" required></input>
                <input type="text" name="username" title="username" placeholder="login"  required></input>
                <input type="password" name="password" title="password" placeholder="password"  required></input>
                <input type="password" name="repeat_password" title="repeat password" placeholder="repeator password"  required></input>
                <label ref={this.regMessage}></label>
              </form>
              <div id="title" onClick={this.registerButtonClick} className="LRCorner">
                Зарегистрироваться
              </div>
            </div>
            <div id="reg" className="tablink" ref={this.login}>
              <form ref={this.logForm}>
                <input type="text" name="username" title="username" placeholder="username" required></input>
                <input type="password" name="password" title="password" placeholder="password" required></input>
                <label ref={this.logMessage}></label>
              </form>
              <div id="title" onClick={this.loginButtonClick} className="LRCorner">
                Войти
              </div>
            </div>
          </div>
      </div>
    );
  }

  componentDidMount(){
    this.loginLink.current.onclick = this.openLog;
    this.registerLink.current.onclick = this.openReg;

    this.loginLink.current.className += " active";
    this.login.current.className += " active";
  }
  openReg(){
    if (!this.register.current.className.includes("active")){
      this.loginLink.current.className = this.loginLink.current.className.replace(" active","");
      this.login.current.className = this.login.current.className.replace(" active","");

      this.registerLink.current.className += " active";
      this.register.current.className += " active";
    }
  }
  openLog(){
    if (!this.login.current.className.includes("active")){
      this.registerLink.current.className = this.registerLink.current.className.replace(" active","");
      this.register.current.className = this.register.current.className.replace(" active","");

      this.login.current.className += " active";
      this.loginLink.current.className += " active";
    }
  }
  loginButtonClick(){
    let data = new FormData(this.logForm.current);
    let logMessage = this.logMessage.current;

    // удаление сообщений об ошибках
    while (logMessage.firstChild) {
        logMessage.removeChild(logMessage.firstChild);
    }

    // проверяем правильность заполнения формы
    if(this.logForm.current.checkValidity()){

      data.append('csrfmiddlewaretoken', this.csrf);

      // обрабатываем POST запрос с формой
      fetch("/loginAJAX/", {
          method: 'POST',
          body: data,
          credentials: 'same-origin',
      }).then(function(response) {
        if (response.ok) {
          // корректный ответ
          return response.json();
        } else {
          // ошибка на сервере
          throw Error(response.statusText);
        }
      }).then(function(myJson) {
        let json = JSON.parse(JSON.stringify(myJson));
        if (!json['error']){
          // переход по переданной ссылке, если все правильно
          window.location.replace(window.location.protocol + "//" + window.location.host + json["url"]);
        } else {
          // ошибка в переданных данных
          throw Error(json['error']);
        }
      }).catch(function(error) {
        // обработка ошибок
        let message = document.createTextNode((""+error).toLowerCase());
        logMessage.appendChild(message);
      });

    } else {
      // обработка ошибок
      let message = document.createTextNode('error: the form should be filled properly');
      logMessage.appendChild(message);
    }
  }

  registerButtonClick(){
    let data = new FormData(this.regForm.current);
    let form = this.regForm.current.elements;
    let regMessage = this.regMessage.current;

    // удаление сообщений об ошибках
    while (regMessage.firstChild) {
        regMessage.removeChild(regMessage.firstChild);
    }

    // проверяем правильность заполнения формы
    if(this.regForm.current.checkValidity() & (form['repeat_password'].value === form['password'].value)){

      data.append('csrfmiddlewaretoken', this.csrf);

      // обрабатываем POST запрос с формой
      fetch("/registerAJAX/", {
          method: 'POST',
          body: data,
          credentials: 'same-origin',
      }).then(function(response) {
        if (response.ok) {
          // корректный ответ
          return response.json();
        } else {
          // ошибка на сервере
          throw Error(response.statusText);
        }
      }).then(function(myJson) {
        let json = JSON.parse(JSON.stringify(myJson));
        if (!json['error']){
          // сообщение об успешной регистрации, если все правильно
          let message = document.createTextNode("registered successfully".toLowerCase());
          regMessage.appendChild(message);
          alert('ok');
          window.location.replace(window.location.protocol + "//" + window.location.host + json["url"]);
        } else {
          // ошибка в переданных данных
          throw Error(json['error']);
        }
      }).catch(function(error) {
        // обработка ошибок
        let message = document.createTextNode((""+error).toLowerCase());
        regMessage.appendChild(message);
      });

    } else {
      // обработка ошибок
      regMessage.appendChild(document.createTextNode('error: '));
      if (form['repeat_password'].value !== form['password'].value){
        regMessage.appendChild(document.createTextNode(' passwords should match; '));
      }
      if (!this.regForm.current.checkValidity()) {
        regMessage.appendChild(document.createTextNode(' the form should be filled properly; '));
      }
    }
  }
}

export default LoginRegisterForm;
