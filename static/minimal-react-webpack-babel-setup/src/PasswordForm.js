import React, { Component } from 'react';
import ReactDOM from 'react-dom';
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
      // console.log(this.props.children);
      // this.parentContent =  this.props.children;//.replace('<', '&lt;').replace('>', '&gt;');;
      // Object.assign({}, document.getElementById('passwordForm'));
      // document.getElementById('passwordForm').parentNode.id = "";
      // alert(this.parentContent);
      // console.log(this.parentContent);

      this.edit   = React.createRef();
      this.userUpdate = React.createRef();

      this.addSource = React.createRef();
      this.userForm = React.createRef();
      this.message = React.createRef();

      // console.log(ReactDOM.findDOMNode(this));
      // this.whole       = React.createRef();
      // this.registerLink   = React.createRef();
      // this.login          = React.createRef();
      // this.register       = React.createRef();
      //
      this.updating    = this.updating.bind(this);
      this.addingSource    = this.addingSource.bind(this);

      // this.registerButtonClick = this.registerButtonClick.bind(this);
      //
      // // this.openTab = this.openTab.bind(this);
      // this.alert= this.alert.bind(this);
      this.csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
      // this.changeVis = this.changeVis.bind(this);
  }
  render() {
    return (
      <div className="PasswordForm">
          <div className="form_header">
            <div className="ULCorner">
              Profile
            </div>
          </div>
          <div className="form_content">
            <div id="login" className="tablink active">
              <form ref={this.userForm}>
                <input autocomplete="new-password" type="text" name="mail" title="mail" placeholder="mail"></input>
                <input autocomplete="new-password" type="text" name="username" title="username" placeholder="username"></input>
                <input autocomplete="new-password" type="password" name="password" title="password" placeholder="password"></input>
                <input autocomplete="new-password" type="password" name="repeat_password" title="repeat password" placeholder="repeator password"></input>
                <input type="button" value="update" ref={this.userUpdate}></input>
                <label ref={this.message}></label>
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
                    <input type="button" value="edit" ref={this.edit}></input>
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
              <div ref={this.addSource} id="title" className="LRCorner">
                +
              </div>
            </div>
          </div>
      </div>
    );
  }
  componentDidMount(){
    this.userUpdate.current.onclick = this.updating;
    this.addSource.current.onclick = this.addingSource;

    let data = new FormData();
    let userForm = this.userForm.current;
    let message = this.message.current;

    data.append('csrfmiddlewaretoken', this.csrf);
    fetch("/userInfo/", {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    }).then(function(response) {
      if (response.ok) {
        return response.json();           // корректный ответ
      } else {
        throw Error(response.statusText); // ошибка на сервере
      }
    }).then(function(myJson) {
      let json = JSON.parse(JSON.stringify(myJson));

      userForm.elements['username'].value = json['username'];
      userForm.elements['mail'].value = json['mail'];
    }).catch(function(error) {
      message.appendChild(document.createTextNode('error: can not get user\'s data'));
    });
  }

  updating(){
    let data = new FormData(this.userForm.current);
    let updMessage = this.message.current;

    data.append('csrfmiddlewaretoken', this.csrf);

    // удаление сообщений об ошибках
    while (updMessage.firstChild) {
        updMessage.removeChild(updMessage.firstChild);
    }
    // проверяем правильность заполнения формы
    if(this.userForm.current.checkValidity()){
      // обрабатываем POST запрос с формой
      fetch("/userUpdate/", {
          method: 'POST',
          body: data,
          credentials: 'same-origin',
      }).then(function(response) {
        if (response.ok) {
          return response.json();           // корректный ответ
        } else {
          throw Error(response.statusText); // ошибка на сервере
        }
      }).then(function(myJson) {
        let json = JSON.parse(JSON.stringify(myJson));
        // сообщение, что все правильно
        if (!json['mail_error']){
          updMessage.appendChild(document.createTextNode("mail changed; "));
        } else {
          updMessage.appendChild(document.createTextNode(json['mail_error']));
        }

        if (!json['username_error']){
          updMessage.appendChild(document.createTextNode("username changed; "));
        } else {
          updMessage.appendChild(document.createTextNode(json['username_error']));
        }

        if (!json['password_error']){
          updMessage.appendChild(document.createTextNode("password changed; "));
        } else {
          updMessage.appendChild(document.createTextNode(json['password_error']));
        }

      }).catch(function(error) {
        // обработка ошибок
        let message = document.createTextNode((""+error).toLowerCase());
        updMessage.appendChild(message);
      });

    } else {
      // обработка ошибок
      let message = document.createTextNode('error: the form should be filled properly');
      updMessage.appendChild(message);
    }
  }

  addingSource(){
    alert('adding new source');
  }
}

export default PasswordForm;
