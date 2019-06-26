import { types as t } from 'mobx-state-tree';

const Counter = t.model('Counter', {
  count: t.number
});

const ArrItem = t.model('Item', {
  name: t.string,
  subname: t.string
});

const Arr = t.array(ArrItem);

const Settings = t.model('Settings', {
  set1: t.string,
  set2: t.model({
    name: t.maybeNull(t.string),
    option: t.maybeNull(t.string)
  })
});
// const BookMark = t.model('BookMark', {
//   id: t.identifier,
//   providerId: t.string
// });

// const User = t.model('User', {
//   id: t.identifier,
//   name: t.string,
//   email: t.string,
//   isAdmin: t.boolean,
//   isProvider: t.boolean,
//   lastLogin: t.string,
//   bookmarks: t.maybeNull(t.array(BookMark))
// });

// const CustomAttribute = t.model('CustomAttribute', {
//   id: t.identifier,
//   name: t.string,
//   type: t.string
// });

// const Provider = t.model('Provider', {
//   $loki: t.identifier,
//   userId: t.string,
//   name: t.string,
//   description: t.string,
//   address: t.string,
//   phone: t.string,
//   zip: t.number,
//   hideExactAddress: t.boolean,
//   cost: t.string,
//   status: t.enumeration(['active', 'tempclosed', 'closed', 'moved']),
//   faciltyType: t.enumeration([
//     'day care',
//     'private apartment',
//     'private house',
//     'after school',
//     'private townhouse',
//     'kids zone',
//     'sport club',
//     'commercial property',
//     'public place'
//   ]),
//   nextEventId: t.maybeNull(t.string),
//   meals: t.maybeNull(t.boolean),
//   image: t.maybeNull(t.string),
//   yearsOfOperations: t.maybeNull(t.string),
//   website: t.maybeNull(t.string),
//   images: t.maybeNull(t.array(t.string)),
//   email: t.maybeNull(t.string),
//   languages: t.maybeNull(t.array(t.string)),
//   categories: t.maybeNull(t.array(t.string)),
//   ages: t.maybeNull(t.array(t.string)),
//   capacity: t.maybeNull(t.number),
//   custom: t.maybeNull(t.array(CustomAttribute))
// });

// const Event = t.model('Event', {
//   id: t.identifier,
//   provider: t.reference(Provider),
//   name: t.string,
//   description: t.string,
//   date: t.string,
//   hours: t.string,
//   duration: t.string,
//   activites: t.maybeNull(t.string),
//   meal: t.maybeNull(t.string),
//   cost: t.string,
//   status: t.enumeration(['available', 'unavailable', 'full', 'call for availability']),
//   image: t.maybeNull(t.string),
//   images: t.maybeNull(t.array(t.string)),
//   email: t.maybeNull(t.string),
//   languages: t.maybeNull(t.array(t.string)),
//   categories: t.maybeNull(t.array(t.string)),
//   ages: t.maybeNull(t.array(t.string)),
//   capacity: t.maybeNull(t.number),
//   custom: t.maybeNull(t.array(CustomAttribute))
// });

// const Filter = t.model('Filter', {
//   searchTerm: t.string
// });

export { Counter, Settings, Arr };
