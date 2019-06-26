// Properties main filter method
export function filterProviders(providers, filters) {
	return providers;
	const buildingTypesSelectedId = filters.buildingTypes.map(type => type.id);
	return providers.filter(
		l =>
			l.address.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
			(buildingTypesSelectedId.length ? buildingTypesSelectedId.includes(l.buildingType.id) : l) &&
			(l.beds >= filters.beds && l.beds <= (filters.max.beds !== null ? filters.max.beds : Number.MAX_VALUE)) &&
			(l.baths >= filters.baths && l.baths <= (filters.max.baths !== null ? filters.max.baths : Number.MAX_VALUE))
	);
}

// Helper function, types of loaded data not always correct
export function correctingTypes(locations) {
	return locations.map(location => {
		if (!location.baths) location.baths = 0;
		if (typeof location.beds === 'string') location.beds = parseInt(location.beds, 10);
		return location;
	});
}

export function getUniqueArraySorted(arr, key) {
	return [...new Set(arr.map(item => item[key]))].sort();
}

export function catchAPIError(err) {
	throw new Error(err);
};
