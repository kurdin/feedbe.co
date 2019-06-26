import './Visualizer.css';

/*
 * This is example of Inferno functional component
 * Functional components provide great performance but does not have state
 */

interface VisualizerProps {
	value: number;
}

export type Test = {
	test1: number;
	test: 2;
	test2: string[];
};

type Test2 = {
	xxx: string[];
};

export function Visualizer(props: VisualizerProps) {
	return <div className="visualizer">{props.value}</div>;
}
