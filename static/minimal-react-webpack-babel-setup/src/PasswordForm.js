import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Forms.css';
import AuthForm from './AuthForm';

class PasswordForm extends Component {
  constructor(props){
      super(props);

      this.edit   = React.createRef();
      this.userUpdate = React.createRef();

      this.addSource = React.createRef();
      this.userForm = React.createRef();
      this.message = React.createRef();

      this.updating    = this.updating.bind(this);
      this.addingSource    = this.addingSource.bind(this);

      // this.update_auth
      // this.create_auth
      // this.delete

      // console.table(this.state)

      this.state = {
        accounts: []
      };
      // console.table(this.state)


      this.csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
  }


  // вызывается после успешного создания или редактирования источника
  update_source(id, username, is_actve, in_use, source){
    this.state[id] = {
      message: '',
      id: id,
      source: source,
      username: username,
      is_actve: is_actve,
      in_use: in_use,
      is_filled: true,
      step: 1,
    };
    state.setState(this.state[id]);
    // let data = new FormData();
    // let state = this;
    // const { accounts } = this.state;
    //
    // data.append('csrfmiddlewaretoken', this.csrf);
    // data.append('username', username);
    // data.append('password', password);
    // data.append('in_use', in_use);
    // data.append('source', source);
    //
    // fetch("/setSource/", {
    //     method: 'POST',
    //     body: data,
    //     credentials: 'same-origin',
    // }).then(function(response) {
    //   if (response.ok) {
    //     return response.json();           // корректный ответ
    //   } else {
    //     throw Error(response.statusText); // ошибка на сервере
    //   }
    // }).then(function(myJson) {
    //   let json = JSON.parse(JSON.stringify(myJson));
    //
    //   if (json['error']){
    //     console.log('not ok');
    //
    //     accounts[id]['message'] = json['error'];
    //     state.setState({
    //       accounts: accounts
    //     });
    //
    //   } else {
    //     console.log('ok');
    //
    //     accounts[id] = {
    //       message: '',
    //       id: id,
    //       source: json['source'], // ok
    //       username: json['username'], // ok
    //       is_actve: json['is_actve'], // ok
    //       in_use: json['in_use'], // ok
    //       is_filled: true,
    //       title: json['source'] + ': ' + json['username'],
    //     };
    //     state.setState({
    //       accounts: accounts
    //     });
    //   }
    // }).catch(function(error) {
    //   accounts[id]['message'] = 'error: can not process request';
    //   state.setState({
    //     accounts: accounts
    //   });
    // });
  }

  create_auth(id){

  }

  delete(id){
    // alert(id);
    let user_id = this.state.accounts[id]['user_id']
    let source = this.state.accounts[id]['source']

    let data = new FormData();
    data.append('csrfmiddlewaretoken', this.csrf);
    data.append('user_id', user_id);
    data.append('source', source);

    let cur = this;


    // if (accounts.length > 0) {
    //   accounts = accounts.map((account, i) => account.id = i);
    // } else {
    //   accounts = [undefined, undefined,undefined]
    // }
    // console.table(accounts);

    console.table(this.state.accounts);

    fetch("/deleteSource/", {
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
      let accounts = cur.state.accounts;

      if (json['error']) {
        accounts[id]['message'] = json['error'];
      } else {
        accounts = accounts.filter((el, i) => {
          return i !== id;
        }).map((el, i) => {
          el.id = i;
          return el;
        });
      }

      cur.setState({
        accounts : accounts,
      });
      // console.log(json['accounts']);
      // state.setState({
      //   accounts: json['accounts']
      // });
      // alert(state.state.accounts[0]['is_filled']);
      // userForm.elements['username'].value = json['username'];
      // userForm.elements['mail'].value = json['mail'];
    }).catch(function(error) {
      // message.appendChild(document.createTextNode('error: can not get user\'s data'));
    });

    // accounts = accounts.map()

  }

  render() {
    return (
      <div className="PasswordForm">
          <div className="form_header">
            <div className="ULCorner">
              Profile
            </div>
          </div>
          <div className="form_content scroller">
            <div id="login" className="tablink active">
              <form ref={this.userForm}>
                <input autoComplete="new-password" type="text" name="mail" title="mail" placeholder="mail"></input>
                <input autoComplete="new-password" type="text" name="username" title="username" placeholder="username"></input>
                <input autoComplete="new-password" type="password" name="password" title="password" placeholder="password"></input>
                <input autoComplete="new-password" type="password" name="repeat_password" title="repeat password" placeholder="repeator password"></input>
                <input type="button" value="update" ref={this.userUpdate}></input>
                <label ref={this.message}></label>
              </form>
              <div className="APIs">
                { this.state.accounts.map(
                    (account, i) =>
                    <AuthForm update_source={this.update_source.bind(this)}
                             create_auth={this.create_auth.bind(this)}
                             delete={this.delete.bind(this)}
                             title={account.source + ': ' + account.username}
                             message={account.message}
                             id={i}
                             source={account.source}
                             username={account.username}
                             is_actve={account.is_actve}
                             in_use={account.in_use}
                             is_filled={account.is_filled}
                             csrf={this.csrf}
                             step={account.step}
                             user_id={account.user_id}/>
                )}
              </div>
            </div>
          </div>
          <div ref={this.addSource} id="title" className="LRCorner">
            +
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
    let state = this;

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

      // console.log(json['accounts']);
      state.setState({
        accounts: json['accounts']
      });
      // alert(state.state.accounts[0]['is_filled']);
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
    let canAdd = true;
    for (var i = 0; i < this.state.accounts.length; i++) {
      if (!this.state.accounts[i]['is_filled']) {
        canAdd = false;
        break;
      }
    }

    if (canAdd) {
      this.setState(state => {
        const accounts = state.accounts.concat({
          title: 'New account',
          message: '',
          id: state.accounts.length,
          source: 'vk',
          username: '',
          is_actve: false,
          in_use: false,
          is_filled: false,
          step: 1,
          user_id: -1
        });
        return {accounts};
      });
    }
  }
}

export default PasswordForm;
