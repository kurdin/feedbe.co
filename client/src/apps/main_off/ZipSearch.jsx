/*globals window, Array */
/*Messages Main JSX Compoment*/

import { Component } from 'react';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import flatAsync from 'flatasync';
import Animate from 'inferno4-animate-css';

import { observer, inject } from 'inferno-mobx';

// import Clipboard from 'clipboard';
import noScroll from '../../shared/noScroll';
import API from '../../APIs';
import Select from 'shared/inferno-select/src/SelectZip.js';
import 'shared/inferno-select/src/example.css';

const componentName = 'Zip Search';
const UsaCanadaZipValidation = /^([A-Z][0-9][A-Z])\s*|([0-9]{5})$/;

// const uniqueArr = (arrArg, key) =>
// 	arrArg.filter(
// 		(elem, pos, arr) =>
// 			arr.findIndex(t => {
// 				return key ? t[key] === elem[key] : t === elem;
// 			}) === pos
// 	);

// inject('store')(observer(Customers));

// const Count = inject('store')(
// 	observer(({ store }) => {
// 		const { getCount, getSettings, addArr } = store;
// 		const setSettings = () => {
// 			store.updateSet1(store.getArr[store.arr.length - 1].name);
// 		};
// 		return (
// 			<div>
// 				<button onClick={store.minusCount}>-</button>
// 				<b>{getCount}</b>
// 				<b>{getSettings}</b>
// 				<button onClick={store.plusCount}>+</button>
// 				<button onClick={setSettings}>Change Settings</button>
// 				<ul>
// 					{store.getArr.map(m => (
// 						<li>
// 							{m.name} - {m.subname}
// 						</li>
// 					))}
// 					<button onClick={addArr}>add to arr</button>
// 				</ul>
// 			</div>
// 		);
// 	})
// );

@inject('store')
@observer
class ZipSearch extends Component {
	static displayName = componentName;

	constructor(props) {
		super(props);
		// this.store = props.store;
		this.state = {
			zip: props.zip || '',
			autoCompleteZips: props.autoCompleteZips || [],
			test: 'examples'
		};
		this.autocompleteZipDebounce = debounce(this.getZipAutoComplete, 300);
	}

	handleSearchClick = e => {
		e.preventDefault();
		this.gotoZip();
	};

	handleKeyDownSearch = e => {
		var intKey = window.Event ? e.which : e.keyCode;
		if (intKey === 13) {
			this.gotoZip();
		}
	};

	gotoZip() {
		const { zip } = this.state;
		if (zip && UsaCanadaZipValidation.test(zip)) {
			this.setState(
				{
					zipError: false
				},
				() => {
					location.href = '/' + zip;
				}
			);
		} else {
			this.setState({
				zipError: true
			});
		}
	}

	handleZipSelect = zip => {
		this.setState(
			{
				zip: zip && zip.value ? zip.value : '',
				zipError: false
			},
			() => {
				if (this.state.zip && this.searchBtn) {
					this.searchBtn.focus();
				}
			}
		);
	};

	getZipAutoComplete = async zip => {
		if (!zip) {
			return this.setState({
				autoCompleteZips: []
			});
		}
		let [err, result] = await flatAsync(API.getZipsAutoComplete({ zip }));
		if (!err && result && Array.isArray(result)) {
			if (!isEqual(result, this.state.autoCompleteZips)) {
				this.setState({
					autoCompleteZips: result
				});
			}
		}
	};

	removeKeysEvent() {
		noScroll.off();
		// window.removeEventListener('keydown', this.handleKeyDown, false);
	}

	addKeysEvent() {
		noScroll.on();
		// window.addEventListener('keydown', this.handleKeyDown, false);
	}

	handleInputZip = zip => {
		this.setState(
			{
				zipError: false,
				zip
			},
			() => {
				this.autocompleteZipDebounce(this.state.zip);
			}
		);
	};

	render({ store }) {
		let { zip, autoCompleteZips, zipError } = this.state;
		const autoCompleteZipsSelector = autoCompleteZips.map(zip => ({
			value: zip.zip,
			label: `${zip.city} ${zip.state} ${zip.zip}`
		}));

		const zipSelected = autoCompleteZips.reduce((obj, z) => {
			if (z.zip === zip)
				obj = {
					value: zip,
					label: `${z.city} ${z.state} ${z.zip}`
				};
			return obj;
		}, {});

		// const { getCount, getSettings, addArr } = store;
		return (
			<div class="column main-home-text">
				<h2>Find Parents Night Out Providers</h2>
				{zipError ? (
					<Animate
						component="h6"
						class="is-danger"
						appear="pulse"
						change="pulse"
						durationAppear={300}
						durationChange={300}
					>
						<b>Enter Valid Zip keyCode</b>
					</Animate>
				) : (
					<h6>Expolore best providers in your area, filter by cost, kids age, preferred languages and availability</h6>
				)}
				<div class="main-home-search">
					<div class="location-icon">
						<span />
					</div>
					<Select
						options={autoCompleteZipsSelector}
						class="search-input"
						clearable={true}
						isLoading={false}
						value={zip}
						selectedValue={zipSelected}
						multi={false}
						menuStyle={{
							'max-height': '215px'
						}}
						menuContainerStyle={{
							top: '45px'
						}}
						autofocus={zipSelected && zipSelected.value ? false : true}
						onInputChange={this.handleInputZip}
						onChange={this.handleZipSelect}
						searchable={true}
						required={false}
						placeholder="Enter Your Zip Code or City to Find Local Providers"
					/>
					<button
						class="button is-medium is-primary is-home-search"
						onKeyDown={this.handleKeyDownSearch}
						onClick={this.handleSearchClick}
						ref={ref => (this.searchBtn = ref)}
					>
						SEARCH
					</button>
				</div>
			</div>
		);
	}
}

export default ZipSearch;
