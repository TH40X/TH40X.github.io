import { FlightSingleData } from "../pages/flightAnalysis";

export function calculateAngleDifference(p1: FlightSingleData, p2: FlightSingleData, p3: FlightSingleData): number {
    const angle1 = calculateDirection(p1, p2)
    const angle2 = calculateDirection(p2, p3);
    let delta = angle2 - angle1;

    // Normaliser pour éviter les discontinuités lors du passage de π à -π
    while (delta > Math.PI) {
        delta -= 2 * Math.PI;
    }
    while (delta < -Math.PI) {
        delta += 2 * Math.PI;
    }

    return delta;
}

export function calculateDirection(p1: FlightSingleData, p2: FlightSingleData): number {
    return Math.atan2(p2.lat - p1.lat, p2.lon - p1.lon);
}

export function calculateDirection2(p1: {lat: number, lon: number}, p2: {lat: number, lon: number}): number {
    return Math.atan2(p2.lat - p1.lat, p2.lon - p1.lon);
}

export function gpsDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const parseLatitude = (lat: string): number => {
    const degrees = parseInt(lat.slice(0, 2), 10);
    const minutes = parseFloat(lat.slice(2, 7)) / 1000;
    const sign = lat[7] === 'N' ? 1 : -1;
    return sign * (degrees + minutes / 60);
};

export const parseLongitude = (lon: string): number => {
    const degrees = parseInt(lon.slice(0, 3), 10);
    const minutes = parseFloat(lon.slice(3, 8)) / 1000;
    const sign = lon[8] === 'E' ? 1 : -1;
    return sign * (degrees + minutes / 60);
};
