import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import { Account } from './components/Account';

const logUpdate = () => console.log;

const AccountRoute = ({ component: Component, path, exact, ...rest }) => (
	<Route
		{...{ exact, path }}
		onChange={logUpdate}
		render={props => {
			return <Component {...props} {...rest} />;
		}}
	/>
);

const AccountRoutes = props => (
	<Switch>
		<AccountRoute path="/" exact component={Account} {...props} activeTab="my-websites" />
		<AccountRoute path="/my-websites" exact component={Account} {...props} activeTab="my-websites" />
		<AccountRoute path="/settings" exact component={Account} {...props} activeTab="settings" />
		<AccountRoute path="/profile" exact component={Account} {...props} activeTab="profile" />
		<AccountRoute path="/advanced" exact component={Account} {...props} activeTab="advanced" />
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
