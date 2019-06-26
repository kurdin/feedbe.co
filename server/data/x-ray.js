const Xray = require('x-ray');
const x = Xray();
const makeDriver = require('request-x-ray');

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

function urlVisit(page) {
	return `https://www.lapl.org/whats-on/calendar?page=${page}`;
}

const runX = async function () {
	for (let page = 1; page <= 3; page++) {
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