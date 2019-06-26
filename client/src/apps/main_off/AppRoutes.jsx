import { Router, Route, Switch } from 'inferno-router';
import { createBrowserHistory } from 'history';

import App from './App';

const AppRoute = ({ component: Component, ...rest }) => (
	<Route render={props => <Component {...props} {...rest} />} />
);

const AppRoutes = props => (
	<Switch>
		<AppRoute path="/" exact component={App} {...props} name="index" />
		<AppRoute path="/cat/:name" component={App} {...props} doViewCategory={true} />
		<AppRoute path="/tag/:name" component={App} {...props} doViewTag={true} />
		<AppRoute path="/:id" component={App} {...props} doRun={true} />
		<AppRoute path="/:name/:id" component={App} {...props} doView={true} />
	</Switch>
);

const AppRouter = props => {
	props.baseUrl = props.baseUrl || '/';
	const history = createBrowserHistory();
	return (
		<Router history={history}>
			<AppRoutes {...props} />
		</Router>
	);
};

export { AppRoutes, AppRouter };
