//анимация
export const animationDuration = 150;
export const animationDelay = 75;
export const pageMaxWidth = 1160;
export const pageMinWidth = 460;

//Map
export const defaultInitialCenter = { lng: 73.382088, lat: 61.260989 };

//меры
//1 морская миля в метрах
export const mileToMeters = 1852;
export const knotToKmPerHour = 1.852;
//Скорость (в узлах) = Скорость (в км/ч) * 0.53996
export const kmToKnotPerHour = 0.5399568034557235;

//1 километр в метрах
export const kilometerToMeters = 1000;
//1 Кабельтов в метрах
export const cableToMeters = mileToMeters / 10;
// обычная миля в морскую
export const conversionFactorMilesToKnot = 1.15078;
export const cableToMiles = 10;
