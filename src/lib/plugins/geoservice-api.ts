import api from './api.js';
const tildaLink = 'https://geoserv.tildacdn.com/api';

interface TildaCity {
	fullName: string;
	[key: string]: unknown;
}

async function postData(url = '', data = {}, noHeaders?: boolean) {
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: !noHeaders
			? {
					'Content-Type': 'application/json'
				}
			: {},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(data)
	});
	return response.json();
}

export const getSuggestCities = async function (cityName: string) {
	const response = await postData(
		`${tildaLink}/city/`,
		{
			lang: 'RU',
			pattern: cityName
		},
		true
	);
	const arr = response.error
		? []
		: (response as TildaCity[]).map((i) => {
				i.fullName = i.fullName
					.replace('область', 'обл.')
					.replace(' г ', ' ')
					.replace(' район,', ' р-н,');
				return i;
			});

	const data = {
		cities: arr,
		cityName: cityName
	};
	return data;
};

export const getPointsRecipientToMap = async function (
	query: { currentCoords: [[number, number], [number, number]] },
	API_BASE: string
) {
	const paramsObj = {
		currentCoords: JSON.stringify(query.currentCoords)
	};
	const params = new URLSearchParams(paramsObj).toString();
	const response = await api.get(`${API_BASE}/delivery/points-to-map?${params}`);
	return response;
};

export default {
	getSuggestCities: getSuggestCities,
	getPointsRecipientToMap: getPointsRecipientToMap
};
