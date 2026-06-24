type BarcodeFormat = string;

interface DetectedBarcode {
	rawValue?: string;
}

interface BarcodeDetectorOptions {
	formats?: BarcodeFormat[];
}

declare class BarcodeDetector {
	constructor(options?: BarcodeDetectorOptions);
	detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
