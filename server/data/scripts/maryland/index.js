const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const providers = new FileAsync('./md-providers-list-2018-9-27.json');
const providersData = new FileAsync('./md-providers-data-2018-9-27.json');
const alasql = require('alasql');

const data = alasql([
	'SELECT * FROM JSON("./md-providers-list-2018-9-27.json")',
	'SELECT * FROM JSON("./md-providers-data-2018-9-27.json")'
]);

const runLoDbQuery = async () => {
	const providersDb = await low(providers);
	const providersDataDb = await low(providersData);
	// console.log('db', db);
	const found = providersDb.find({ id: 134978 }).value();

	const foundData = providersDataDb.find({ id: found.id }).value();

	return foundData;
	// console.log(found);
	// console.log(foundData);
};

console.time('lowdbtime');
runLoDbQuery().then(res => {
	// console.log(res);
	console.timeEnd('lowdbtime');
});

// return;

/*
const runAlaSQL = async data => {
	// const res = await alasql('SELECT id FROM JSON("./md-providers-list-2018-9-27.json")');
	//     var res = alasql('SELECT * FROM ? arr1 JOIN ? arr2 USING id', [arr1,arr2]);

	return await alasql('SELECT * FROM ? arr1 JOIN ? arr2 USING id WHERE id = 134978', data);
	// console.log(res);
};

console.time('runAlaSQl1');
console.time('runAlaSQl2');
data.then(async d => {
	const res = await runAlaSQL(d);
	console.log(res);
	console.timeEnd('runAlaSQl1');
	const res2 = await runAlaSQL(d);
	console.log(res2);
	console.timeEnd('runAlaSQl2');
});
*/
