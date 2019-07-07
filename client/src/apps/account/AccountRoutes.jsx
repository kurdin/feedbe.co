import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import { Account } from './components/Account';

const AccountRoute = ({ component: Component, path, exact, ...rest }) => (
	<Route
		{...{ exact, path }}
		render={props => {
			return <Component {...props} {...rest} />;
		}}
	/>
);

const AccountRoutes = props => (
	<Switch>
		<AccountRoute path="/" exact component={Account} {...props} activeTab="my-website" />
		<AccountRoute path="/my-websites" exact component={Account} {...props} activeTab="my-website" />
		<AccountRoute path="/settings" component={Account} {...props} activeTab="account-settings" />
		<AccountRoute path="/profile" component={Account} {...props} activeTab="profile" />
		<AccountRoute path="/advanced" component={Account} {...props} activeTab="advanced" />
		<Redirect from="/*" to="/" />
	</Switch>
);

const AccountRouter = props => {
	return (
		<BrowserRouter basename="/account">
			<AccountRoutes {...props} />
		</BrowserRouter>
	);
};

export { AccountRoutes, AccountRouter };
