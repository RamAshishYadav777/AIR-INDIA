declare module "iata-airports" {
  interface Airport {
    iata: string;
    name: string;
    city: string;
    country: string;
    lat?: number;
    lon?: number;
  }

  const airports: Airport[];
  export default airports;
}
