import uniqolor from 'uniqolor';
import { BROWSER } from 'esm-env';
export function setHtmlClassList(val: string, arr: string[]) {
	if (BROWSER) {
		const { classList } = document.querySelector('html') as HTMLElement;
		const classArr = arr;
		classList.remove(...classArr);
		classList.add(val);
	}
}
export function createLabel(number: number, titles: string[]) {
	const cases = [2, 0, 1, 1, 1, 2];
	return `${
		titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]]
	}`;
}

export function deepEqual(obj1: { [key: string]: any }, obj2: { [key: string]: any }) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		const val1 = obj1[key];
		const val2 = obj2[key];
		const areObjects = isObject(val1) && isObject(val2);
		if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
			return false;
		}
	}

	return true;
}

export function isObject(obj: any) {
	return obj != null && typeof obj === 'object';
}
// // Examples:

export function isEmpty(val: string | object) {
	if (typeof val === 'string') return val.trim().length === 0;
	if (typeof val === 'object') return Object.keys(val).length === 0;
}

export function getColorByValue(value: string | number) {
	//, hovered?: boolean
	return uniqolor(value, {
		saturation: [60, 70],
		lightness: [35, 80],
		differencePoint: 80
	}).color; // + (!hovered  ? '90' : '70')
}
