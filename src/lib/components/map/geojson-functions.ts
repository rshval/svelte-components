import type { LayerSpecification, Map } from 'mapbox-gl';

export const getLayers = (map: Map) => {
	const style = map.getStyle();
	if (style?.layers) {
		const layers: LayerSpecification[] = style?.layers;
		return layers;
	} else {
		return null;
	}
};
