const Xray = require('x-ray');
const flatAsync = require('flatasync');
const Cacheman = require('cacheman');
const cache = new Cacheman({ ttl: 600, engine: 'redis' });
const util = require('util');
const now = new Date();
const fs = require('fs');
const cheerio = require('cheerio');
const fsWriteFile = util.promisify(fs.writeFile);

const cacheKey = 'MD-Providers-Data';

const x = Xray({
	filters: {
		trim: function(value) {
			return typeof value === 'string' ? value.trim() : value;
		},
		reverse: function(value) {
			return typeof value === 'string'
				? value
						.split('')
						.reverse()
						.join('')
				: value;
		},
		slice: function(value, start, end) {
			return typeof value === 'string' ? value.slice(start, end) : value;
		}
	}
});
const makeDriver = require('request-x-ray');
const mdProviders = require('./md-providers-list-2018-9-27.json');

console.log('mdProviders', mdProviders.length);
// console.log('mdProviders', mdProviders[1]);
// process.exit();
// const CacheRedis = require('cacheman-redis');
// const cache = new CacheRedis({ port: null, host: null });

const options = {
	method: 'GET', //Set HTTP method
	jar: true, //Enable cookies
	rejectUnauthorized: false,
	headers: {
		//Set headers
		'User-Agent': 'Firefox/48.0'
	}
};

const driver = makeDriver(options); //Create driver
x.driver(driver);

function urlVisit(id) {
	return `https://www.checkccmd.org/FacilityDetail.aspx?ft=&fn=&sn=&z=&c=&co=&fi=${id}`;
}

const runX = async function() {
	await cache.clear(cacheKey);
	for (let i = 0; i <= mdProviders.length; i++) {
		if (mdProviders[i] === undefined) continue;
		const id = mdProviders[i].id;
		const res = await x(urlVisit(id), ['.providerinfo .providerinfo@html']);
		const $table1 = cheerio.load(`<table>${res[0]}</table>`);
		const $table2 = cheerio.load(`<table>${res[1]}</table>`);

		const prividerData = {
			name: getData($table1, 0),
			facilityName: canBeNull(getData($table1, 1)),
			license: checkLabel($table1, 2, 'License') ? getData($table1, 2, true) : null,
			registration: checkLabel($table1, 2, 'Registration') ? getData($table1, 2, true) : null,
			county: getData($table1, 3),
			status: getData($table1, 4),
			capacity: getSplitCellData($table1, 5),
			approvedEducationProgram: getData($table1, 6),
			phone: getData($table2, 0),
			email: getData($table2, 1),
			approvedFor: getSplitCellData($table2, 2)
		};

		const inspections = await x(urlVisit(id), '.listViewGrid@html');
		const $insp = cheerio.load(`<table>${inspections}</table>`);

		let prividerInspectionsData = [];
		$insp('tr').each((i, elem) => {
			if ($insp(elem).find('td').eq(0).text() === '') return;
			prividerInspectionsData.push({
				date: $insp(elem).find('td').eq(0).text(),
				inspectionType: $insp(elem).find('td').eq(1).text(),
				regulations: $insp(elem).find('td').eq(2).text(),
				finding: $insp(elem).find('td').eq(3).text(),
				status: $insp(elem).find('td').eq(4).text()
			});
		});

		const data = {
			id,
			data: prividerData,
			inspectionsData: prividerInspectionsData
		};

		let cacheProvidersData = (await cache.get(cacheKey)) || [];
		cacheProvidersData.push(data);
		const [err] = await flatAsync(cache.set(cacheKey, cacheProvidersData));
		if (err) console.error(err);

		console.log(`Getting data on provider with id ${id}`);
	}

	// all done lets write all data from redis to json
	const file = `./md-providers-data-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}.json`;
	const data = await cache.get(cacheKey);
	await fsWriteFile(file, JSON.stringify(data, null, 2), 'utf8');
	console.log(`Total of ${data.length} Maryland Providers Data Saved To: `, file);
	process.exit();
};

runX();

function getSplitCellData($, index) {
	const val = $('tr').eq(index).find('td').eq(1).find('span').html();
	return val && val.includes('<br>') ? val.split('<br>') : val;
}

function getData($, index, isInt = false) {
	const val = $('tr').eq(index).find('td').eq(1).text().trim();
	return isInt ? parseInt(val, 10) : val;
}

function checkLabel($, index, label) {
	return $('tr').eq(index).text().includes(label);
}

function canBeNull(val) {
	return val ? val : null; 
}