/*eslint no-loop-func: 0*/
/*eslint no-script-url: 0*/
/*eslint no-eval: 0*/

const fs = require('fs');
const Xray = require('x-ray');
const xRayChrome = require('x-ray-chrome').default;
const flatAsync = require('flatasync');
const Cacheman = require('cacheman');
const cache = new Cacheman({ ttl: 300, engine: 'redis' });
const util = require('util');
const now = new Date();
const fsWriteFile = util.promisify(fs.writeFile);
const cacheKey = 'MD-Providers-List';

const PAGES_TOTAL = 99999;
let nextPageJS = null;

const $x = new Xray();

const options = {
	cl: async (page, ctx) => {
		page.on('console', msg => {
			console.log(msg._text);
		});

		for (let p = 1; p <= PAGES_TOTAL; p++) {
			if (nextPageJS === 404) break;

			if (nextPageJS) {
				await page.evaluate(nextPageJS => {
					try {
						eval(nextPageJS);
					} catch (err) {
						console.log('Err in Eval', err);
					}
				}, nextPageJS);
			}
			
			await page.waitForSelector('.listViewGrid');

			console.log('Page N', p);

			const table = await page.$('.listViewGrid');
			const tableHtml = await page.evaluate(table => table.innerHTML, table);

			const providers = await $x(tableHtml, {
				items: $x('tr', [
					{
						id: 'td:nth-of-type(1) a@href',
						name: 'td:nth-of-type(1) a',
						facilityName: 'td:nth-of-type(2)',
						address: 'td:nth-of-type(3)',
						county: 'td:nth-of-type(4)',
						schoolName: 'td:nth-of-type(5)',
						programType: 'td:nth-of-type(6)'
					}
				])
			});

			if (providers.items && providers.items.length && providers.items[0].id) {
				const p = providers.items.map(provider => {
					if (typeof provider.id === 'string' && provider.id) {
						let id = provider.id.match(/fi=(\d+)/);
						provider.id = id && parseInt(id[1], 10);
						return provider;
					}
					return null;
				}).filter(provider => provider && provider.id !== null);

				const cacheProviders = (await cache.get(cacheKey)) || [];
				const [err,] = await flatAsync(cache.set(cacheKey, [...cacheProviders, ...p]));

				if (err) console.error(err);
			} else {
				console.error('No providers data for page', p);
			}

			const pages = await $x(tableHtml, {
				numbers: $x('.dataPager', ['a@href'])
			});

			nextPageJS = 404;

			if (pages.numbers.length) {
				pages.numbers.forEach(number => {
					if (number.includes('Page$' + (p + 1))) {
						nextPageJS = number.split('javascript:')[1];
					}
				});
			}

			await table.dispose();
		}
		// await page.screenshot({path: `./screenshot-page-md${pageCount}.jpg`});
	},
	navigationOptions: {
		timeout: 30000
	},
	headless: true,
	slowMo: 0
};

const xrChrome = Xray().driver(xRayChrome(options));

function urlVisit() {
	return 'https://www.checkccmd.org/SearchResults.aspx?ft=&fn=&sn=&z=&c=&co=';
}

const runX = async function() {
	await cache.clear(cacheKey);
	const [err, res] = await flatAsync(xrChrome(urlVisit(), '.listViewGrid'));

	if (err) {
		console.error('error on crawler execution', err);
		process.exit(1);
	}

	if (res) console.log('We are done with crawling...');

	// all done lets write all data from redis to json
	const file = `./md-providers-list-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}.json`;
	const data = await cache.get(cacheKey);
	await fsWriteFile(file, JSON.stringify(data, null, 2), 'utf8');
	console.log(`Total of ${data.length} Maryland Providers Saved To: `, file);
	process.exit();
};

runX();
