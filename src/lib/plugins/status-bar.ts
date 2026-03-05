/**
 * The StatusBar API Provides methods for configuring the
 * style of the Status Bar, along with showing or hiding it.
 * https://capacitorjs.com/docs/apis/status-bar
 */
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';

async function checkMobile() {
	const info = await Device.getInfo();
	if (info?.platform) {
		return info.platform === 'ios' || info.platform === 'android';
	} else {
		return false;
	}
}

const setStyleDark = async (val: boolean) => {
	const isMobile = await checkMobile();
	if (isMobile) {
		try {
			if (StatusBar.setStyle) StatusBar.setStyle({ style: val ? Style.Dark : Style.Light });
		} catch (err) {
			console.error(err);
		}
	}
};

const show = async (val: boolean) => {
	const isMobile = await checkMobile();
	if (isMobile) {
		try {
			if (val) await StatusBar.show();
			else await StatusBar.hide();
		} catch (err) {
			console.error(err);
		}
	}
};

export default {
	setStyleDark: setStyleDark,
	show: show
};
