import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AdminOverview from './AdminOverview';
import AdminEvents from './AdminEvents';
import AdminProviders from './AdminProviders';
import AdminUsers from './AdminUsers';
import store from './AdminStore';

const AppRoute = ({ component: Component, path, exact, ...rest }) => (
	<Route
		{...{ exact, path }}
		render={props => {
			return <Component {...props} {...rest} />;
		}}
	/>
);

const AdminRoutes = props => {
	return (
		<Switch>
			<AppRoute path="/" exact component={AdminOverview} {...props} />
			<AppRoute path="/users" exact component={AdminUsers} {...props} />
			<AppRoute path="/users/new" exact component={AdminUsers} {...props} isNew={true} />
			<AppRoute path="/users/:id" component={AdminUsers} {...props} />
			<AppRoute path="/providers" exact component={AdminProviders} {...props} />
			<AppRoute path="/providers/new" exact component={AdminProviders} {...props} isNew={true} />
			<AppRoute path="/providers/:id" component={AdminProviders} {...props} />
			<AppRoute path="/events" exact component={AdminEvents} {...props} />
			<AppRoute path="/events/new" exact component={AdminEvents} {...props} isNew={true} />
			<AppRoute path="/events/:id" component={AdminEvents} {...props} />
		</Switch>
	);
};

const AdminRouter = () => {
	return (
		<BrowserRouter basename={'/admin'}>
			<AdminRoutes {...{ store }} />
		</BrowserRouter>
	);
};

export { AdminRoutes, AdminRouter };
