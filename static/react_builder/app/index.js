var React = require('react');
var ReactDOM = require('react-dom');
var path = require('path');
require('./index.css');

class App extends React.Component{
	render(){
		return(
			<div>
				Hello world!
			</div>
			)
	}
}

ReactDOM.render(
	<App/>,
	document.getElementById('App')
)

