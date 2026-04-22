// Load airports data directly from the JSON shipped in the iata-airports package
import airportsData from "iata-airports";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export const getAirports = (): Airport[] =>
  (airportsData as Airport[]).filter(
    (a) => a.iata && a.city && a.country
  );
