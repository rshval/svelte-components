type UploadExtraValue = string | number | boolean | Blob | null | undefined;

interface CreateUploadFormDataOptions {
	fieldName: string;
	files: File[];
	extraFields?: Record<string, UploadExtraValue | UploadExtraValue[]>;
}

const appendExtraValue = (formData: FormData, key: string, value: UploadExtraValue) => {
	if (value === null || value === undefined) {
		return;
	}

	if (value instanceof Blob) {
		formData.append(key, value);
		return;
	}

	formData.append(key, String(value));
};

export const createUploadFormData = ({
	fieldName,
	files,
	extraFields = {}
}: CreateUploadFormDataOptions): FormData => {
	const formData = new FormData();

	for (const file of files) {
		formData.append(fieldName, file);
	}

	for (const [key, rawValue] of Object.entries(extraFields)) {
		if (Array.isArray(rawValue)) {
			for (const value of rawValue) {
				appendExtraValue(formData, key, value);
			}
			continue;
		}

		appendExtraValue(formData, key, rawValue);
	}

	return formData;
};

export interface UploadedImagePayload {
	path?: string;
	destination?: string;
	_id?: string;
}

export const extractUploadedImages = (response: unknown): UploadedImagePayload[] => {
	if (!response || typeof response !== 'object') {
		return [];
	}

	const payload = response as {
		image?: UploadedImagePayload | UploadedImagePayload[];
		images?: UploadedImagePayload[];
		data?: {
			image?: UploadedImagePayload | UploadedImagePayload[];
			images?: UploadedImagePayload[];
		};
	};

	const images = payload.images ?? payload.data?.images;
	if (Array.isArray(images)) {
		return images;
	}

	const image = payload.image ?? payload.data?.image;
	if (Array.isArray(image)) {
		return image;
	}

	return image ? [image] : [];
};
