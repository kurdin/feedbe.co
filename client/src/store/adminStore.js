import { types as t, flow } from 'mobx-state-tree';
import { User, Provider, Filter, Event } from './models';
import { catchAPIError, filterProviders } from './storeUtils';

import DEFAULT from '../appConfig';
import providers from './data/providers.json';
// import customers from './data/customers.json';
// import products from './data/products.json';
// import productsCatalog from './data/productsCatalog.json';
// import cards from './data/cards.json';

const getProviders = () => new Promise(r => r((window.datashared && window.datashared.providers) || providers));
const getUser = () => new Promise(r => r(window.datashared && window.datashared.user));
// const getProductsData = () => new Promise(r => r(products));
// const getProductCatalogData = () => new Promise(r => r(productsCatalog));
// const getCardsData = () => new Promise(r => r(cards));

const model = t
  .model({
    filter: Filter,
    isLoaded: t.boolean,
    user: t.maybeNull(User),
    provider: t.maybeNull(Provider),
    providers: t.array(Provider)
  })
  .views(state => ({

    get isProvidersFiltered() {
      return state.providersList.length !== state.providers.length;
    },

    get providersTotal() {
      return state.providers.length;
    },

    get selectedProvider() {
      return state.customers.find(customer => customer.id === state.customerId);
    },

    get providersList() {
      return filterProviders(state.providers, state.filters);
    },

  }))
  .actions(state => {

    const loadData = flow(function*() {
      try {
        // let fake call to api with load import
        const providers = yield getProviders().catch(catchAPIError);
        const user = yield getUser().catch(catchAPIError);

        // const productsCatalog = productsCatalogData.map(catalog => {
        //   let c = {...catalog};
        //   c.products = [...products];
        //   return c;
        // });

        state.providers = providers;
        // state.user = user;
        // state.customers = customers;
        // state.productsCatalog = productsCatalog;
        // state.cards = cards;        

        console.log('state.providers', state.providers.toJSON());
        // console.log('state.user', state.user.toJSON());
        state.isLoaded = true;
      } catch (err) {
        console.error('Failed to Load Data', err);
        state.loadingError = `Failed To Load ${err.message}`;
      }
    });

    const removeProvidersFilter = () => {
     state.filters = DEFAULT.filters;
    }

    function handleSelectProvider(id) {
      const customer = state.customers.find(c => c.id === id);
      state.customerId = customer.id;
    }

    // function handleSelectCustomerView(view) {
    //   const customer = state.selectedCustomer;
    //   customer.view = view;
    // }

    function handleSearchTerm(e) {
      state.filters.searchTerm = e.target.value;
    }

    return {
      loadData,
      handleSelectProvider,
      removeProvidersFilter,
      handleSearchTerm
    };
  });

const AdminStore = model.create({
  filter: DEFAULT.filters,
  user: null,
  providers: [],
  isLoaded: false
});

export default AdminStore;
