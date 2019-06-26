#!/usr/local/bin/python3
import pandas as pd
from urllib import request
import ssl

context = ssl._create_unverified_context()

dfs = []

# PAGES 0 - 3 SCRAPE
url = 'https://www.lapl.org/whats-on/calendar?page={}'
for i in range(4):    
		response = request.urlopen(url.format(i), context=context)
		html = response.read()

		dframe = pd.read_html(html, header=None)[0]\
			.rename(columns={0:'Date', 1:'Topic', 2:'Location', 3:'People', 4:'Category'})           
		dfs.append(dframe)

finaldf = pd.concat(dfs)              
finaldf.to_csv('output.csv')
