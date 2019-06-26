import { Component } from 'react';
import { addOne } from '../utils/math';
import { Visualizer } from './Visualizer';

import './Incrementer.scss';

type Props = {
	name: string;
};

type State = {
	value: number;
};

/*
 * The first interface defines prop shape
 * The second interface defines state shape
 */
export class Incrementer extends Component<Props, State> {
	state = {
		value: 1
	};

	doMath = () => {
		this.setState({
			value: addOne(this.state.value)
		});
	};

	render() {
		// uncomment: example of type verification
		//
		// this.props.name = 1;
		// this.props.name = 1;

		return (
			<div>
				{this.props.name}
				<button className="my-button" onClick={this.doMath}>
					Increment
				</button>
				<Visualizer value={this.state.value + 'THIS SHOULD FAIL ( npm run check )!'} />
			</div>
		);
	}
}
