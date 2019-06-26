import { Route, Switch, BrowserRouter } from 'inferno-router';
import ZipResults from './ZipResults';

const Page404 = ({ baseUrl, location }) => (
	<div>
		<h3>
			404 - no match for path{' '}
			<code>
				{baseUrl}
				{location.pathname}
			</code>
		</h3>
	</div>
);

const ZipRoute = ({ component: Component, path, exact, ...rest }) => (
	<Route {...{ exact, path }} render={props => <Component {...props} {...rest} />} />
);

const ZipRoutes = props => (
	<Switch>
		<ZipRoute path="/" exact component={ZipResults} {...props} name="index" />
		<Route render={router => <Page404 {...router} {...props} />} />
	</Switch>
);

const ZipRouter = props => {
	return (
		<BrowserRouter basename={props.baseUrl || '/'}>
			<ZipRoutes {...props} />
		</BrowserRouter>
	);
};

export { ZipRoutes, ZipRouter };
