import { Component, render, version } from 'react';
import { Incrementer } from './components/Incrementer';

const container = document.getElementById('app');

class MyComponent extends Component<any, any> {
	tsxVersion: number;

	constructor(props, context) {
		super(props, context);

		this.tsxVersion = '3.21'; /* This is typed value */
	}

	render() {
		return (
			<div>
				<h1>{`Welcome to Inferno ${version} TSX ${this.tsxVersion}`}</h1>
				<Incrementer name={'Crazy button'} />
			</div>
		);
	}
}

render(<MyComponent />, container);
