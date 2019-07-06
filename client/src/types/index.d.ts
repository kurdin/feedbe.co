import { Attributes } from 'react';
import { cssProp } from 'styled-components/cssprop';

declare module 'react' {
	interface Attributes extends Attributes {
		class?: string;
		css?: cssProp;
	}
}
