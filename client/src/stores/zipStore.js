import { types as t } from 'mobx-state-tree';
import { Counter, Settings, Arr } from './models';
// import makeInspectable from 'mobx-devtools-mst';
// import { catchAPIError, filterProviders } from './storeUtils';

// import DEFAULT from '../appConfig';
// import providers from './data/providers.json';
// import customers from './data/customers.json';
// import products from './data/products.json';
// import productsCatalog from './data/productsCatalog.json';
// import cards from './data/cards.json';

// const getProviders = () =>
// new Promise(r => r((window.datashared && window.datashared.providers) || providers));
// const getUser = () => new Promise(r => r(window.datashared && window.datashared.user));
// const getProductsData = () => new Promise(r => r(products));
// const getProductCatalogData = () => new Promise(r => r(productsCatalog));
// const getCardsData = () => new Promise(r => r(cards));

const model = t
  .model({
    settings: Settings,
    arr: Arr,
    counter: Counter
  })
  .views(state => ({
    get getCount() {
      return state.counter.count;
    }
  }))
  .actions(state => {
    const plusCount = () => {
      state.counter.count++;
    };

    const addArr = () => {
      state.arr.push({
        name: getString(),
        subname: getString()
      });
    };

    const minusCount = () => {
      if (state.counter.count !== 0) state.counter.count--;
    };

    const updateSet1 = val => {
      state.counter.count++;
      state.settings.set1 = val;
    };

    return {
      addArr,
      plusCount,
      minusCount,
      updateSet1
    };
  });

const Store = model.create({
  counter: {
    count: 0
  },
  arr: [{ name: 'test', subname: 'test' }],
  settings: {
    set1: '',
    set2: {
      name: 'name',
      option: 'option'
    }
  }
});

function getString() {
  return Math.random()
    .toString(36)
    .replace('0.', '');
}

export default Store;
