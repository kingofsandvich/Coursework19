import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Forms.css';


class AuthForm extends Component {
  constructor(props){
      super(props);

      this.addUpdate    = this.addUpdate.bind(this);
      this.deleteSource    = this.deleteSource.bind(this);

      this.update_source = props.update_source;
      props.create_auth;
      this.delete = props.delete;

      this.csrf = props.csrf;

      this.message = React.createRef();
      this.source = React.createRef();
      this.username = React.createRef();
      this.password = React.createRef();
      this.in_use = React.createRef();
      this.code = React.createRef();

      this.state = {
        message: props.message,
        id: props.id,
        source: props.source,
        username: props.username,
        is_actve: props.is_actve,
        in_use: props.in_use,
        is_filled: props.is_filled,
        title: props.is_filled ? props.title : "New account",
        step: props.step,
        user_id : props.user_id,
      };
  }

  componentWillReceiveProps(props) {
    const { refresh, id } = this.props;
      this.state = {
        message: props.message,
        id: props.id,
        source: props.source, // ok
        username: props.username, // ok
        is_actve: props.is_actve, // ok
        in_use: props.in_use, // ok
        is_filled: props.is_filled,
        title: props.is_filled ? props.title : "New account",
        step: props.step,
        user_id : props.user_id,
      };
  }

  deleteSource(){
    this.delete(this.state.id)
  }

  addUpdate(){
    this.state['message'] = '';
    this.setState(this.state);

    let update_source = this.update_source;

    let id = this.state.id;
    let username = this.username.current.value;
    let password = this.password.current.value;
    let in_use = this.state.in_use;
    let source = this.source.current.options[this.source.current.selectedIndex].value;
    let code = this.code.current.value;

    let data = new FormData();
    let state = this;
    let curState = this.state;
    let step = this.state.step;

    data.append('csrfmiddlewaretoken', this.csrf);
    data.append('username', username);
    data.append('password', password);
    data.append('in_use', in_use);
    data.append('source', source);
    data.append('step', step);
    data.append('code', code);

    fetch("/setSource/", {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    }).then(function(response) {

      if (response.ok) { return response.json(); } // корректный ответ
      else { throw Error(response.statusText); }   // ошибка на сервере

    }).then(function(myJson) {
      let json = JSON.parse(JSON.stringify(myJson));
      if (json['error']){

        curState['message'] = json['error'];
        state.setState(curState);

      } else {
        // аутентификация прошла успешно
        if (json['step'] == 1) {
          state.update_source(id,
                             json['username'],
                             json['is_actve'],
                             json['in_use'],
                             json['source']);
         curState['message'] = 'account modified successfully';
         curState['step'] = 1;
         state.setState(curState);
         // второй шаг аутентификации
        } else if (json['step'] == 2) {
          curState['message'] = 'please enter code';
          curState['step'] = 2 ;
          state.setState(curState);
        }
      }
    }).catch(function (error) {
      curState['message'] = error.message.toLowerCase();
      state.setState(curState);
    });
  }

  check() {
    this.setState({in_use: !this.state.in_use});
  }

  changePass(event) {
    this.setState({password: event.target.value});
  }

  changeUser(event) {
    this.setState({username: event.target.value});
  }

  render() {
    return (
      <div className="AuthForm">
        <div className="APIform form_content">
          <form>
            <h4>{this.state.title}</h4>
            {this.state.is_filled ?
              <label>аккаунт {this.state.is_actve ? ('') : ('не')}доступен</label>
              : ''
            }

            <select ref={this.source} name="source">
              <option value="fb">fb.com</option>
              <option value="google">google.com</option>
              <option selected={(this.state.source == 'vk') ? "selected" : ''} value="vk">vk.com</option>
            </select>
            <input autoComplete="new-password" ref={this.username} type="text" onChange={this.changeUser.bind(this)} title="username" placeholder="username" value={this.state.username} required></input>
            <input autoComplete="new-password" ref={this.password} type="password" onChange={this.changePass.bind(this)} title="password" placeholder="password" required></input>

            <input autoComplete="new-password" ref={this.code} style={{display: this.state.step == 2 ? 'block' : 'none' }} type="text" title="password" placeholder="code"></input>

            <br/>
            <label class="brand_checkbox">
              использовать аккаунт
              <input ref={this.in_use} checked={this.state.in_use} onChange={this.check.bind(this)} type="checkbox"></input>
              <span class="checked"></span>
            </label>
            <input type="button" onClick={this.addUpdate} value={this.state.is_filled ? "edit" : "add"} ref={this.edit}></input>
            {this.state.is_filled ?
              <input type="button" value="delete" onClick={this.deleteSource}></input>
              : ''
            }
            <label>{this.state.message}</label>
          </form>
        </div>
      </div>
    );
  }
  componentDidMount(){

  }
}

export default AuthForm;
