const Xray = require('x-ray');
const xRayChrome = require('x-ray-chrome').default;

let pageCount;

const options = {
  cl: async (page, ctx)=> {

            await page.waitForSelector('.tableheader-processed');
            await page.screenshot({path: `./screenshot-page${pageCount}.jpg`});
  },
  navigationOptions:{
        timeout: 30000,
  }
};

const x = Xray().driver(xRayChrome(options));

function urlVisit(page) {
	return `https://www.lapl.org/whats-on/calendar?page=${page}`;
}

const runX = async function () {
	for (let page = 1; page <= 3; page++) {
		pageCount = page;
		const res = await x(urlVisit(page), '.tableheader-processed', {
				items: x('tr', [
					{
						date: 'td:nth-of-type(1)',
						description: 'td:nth-of-type(2)'
					}
				])
			});
		console.log(`res on page ${page}`, res);
	}
};

runX();