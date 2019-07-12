import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

const LoginRoute = ({ component: Component, path, exact, ...rest }) => (
	<Route
		{...{ exact, path }}
		render={props => {
			return <Component {...props} {...rest} />;
		}}
	/>
);

export const LoginRoutes = props => (
	<Switch>
		<LoginRoute path="/" exact component={Login} {...props} />
		<LoginRoute path="/reset-password" exact component={ResetPassword} {...props} />
		<Redirect from="/*" to="/" />
	</Switch>
);

export const LoginRouter = props => {
	return (
		<BrowserRouter basename="/login">
			<LoginRoutes {...props} />
		</BrowserRouter>
	);
};
