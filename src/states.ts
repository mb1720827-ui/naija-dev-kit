export type Zone = "North Central" | "North East" | "North West" | "South East" | "South South" | "South West";

export interface State {
  name: string;
  capital: string;
  zone: Zone;
  /** ISO 3166-2 code, e.g. "NG-LA". */
  iso: string;
}

/** The 36 states and the Federal Capital Territory, with their capitals and geopolitical zones. */
export const STATES: readonly State[] = [
  { name: "Abia", capital: "Umuahia", zone: "South East", iso: "NG-AB" },
  { name: "Adamawa", capital: "Yola", zone: "North East", iso: "NG-AD" },
  { name: "Akwa Ibom", capital: "Uyo", zone: "South South", iso: "NG-AK" },
  { name: "Anambra", capital: "Awka", zone: "South East", iso: "NG-AN" },
  { name: "Bauchi", capital: "Bauchi", zone: "North East", iso: "NG-BA" },
  { name: "Bayelsa", capital: "Yenagoa", zone: "South South", iso: "NG-BY" },
  { name: "Benue", capital: "Makurdi", zone: "North Central", iso: "NG-BE" },
  { name: "Borno", capital: "Maiduguri", zone: "North East", iso: "NG-BO" },
  { name: "Cross River", capital: "Calabar", zone: "South South", iso: "NG-CR" },
  { name: "Delta", capital: "Asaba", zone: "South South", iso: "NG-DE" },
  { name: "Ebonyi", capital: "Abakaliki", zone: "South East", iso: "NG-EB" },
  { name: "Edo", capital: "Benin City", zone: "South South", iso: "NG-ED" },
  { name: "Ekiti", capital: "Ado-Ekiti", zone: "South West", iso: "NG-EK" },
  { name: "Enugu", capital: "Enugu", zone: "South East", iso: "NG-EN" },
  { name: "Federal Capital Territory", capital: "Abuja", zone: "North Central", iso: "NG-FC" },
  { name: "Gombe", capital: "Gombe", zone: "North East", iso: "NG-GO" },
  { name: "Imo", capital: "Owerri", zone: "South East", iso: "NG-IM" },
  { name: "Jigawa", capital: "Dutse", zone: "North West", iso: "NG-JI" },
  { name: "Kaduna", capital: "Kaduna", zone: "North West", iso: "NG-KD" },
  { name: "Kano", capital: "Kano", zone: "North West", iso: "NG-KN" },
  { name: "Katsina", capital: "Katsina", zone: "North West", iso: "NG-KT" },
  { name: "Kebbi", capital: "Birnin Kebbi", zone: "North West", iso: "NG-KE" },
  { name: "Kogi", capital: "Lokoja", zone: "North Central", iso: "NG-KO" },
  { name: "Kwara", capital: "Ilorin", zone: "North Central", iso: "NG-KW" },
  { name: "Lagos", capital: "Ikeja", zone: "South West", iso: "NG-LA" },
  { name: "Nasarawa", capital: "Lafia", zone: "North Central", iso: "NG-NA" },
  { name: "Niger", capital: "Minna", zone: "North Central", iso: "NG-NI" },
  { name: "Ogun", capital: "Abeokuta", zone: "South West", iso: "NG-OG" },
  { name: "Ondo", capital: "Akure", zone: "South West", iso: "NG-ON" },
  { name: "Osun", capital: "Osogbo", zone: "South West", iso: "NG-OS" },
  { name: "Oyo", capital: "Ibadan", zone: "South West", iso: "NG-OY" },
  { name: "Plateau", capital: "Jos", zone: "North Central", iso: "NG-PL" },
  { name: "Rivers", capital: "Port Harcourt", zone: "South South", iso: "NG-RI" },
  { name: "Sokoto", capital: "Sokoto", zone: "North West", iso: "NG-SO" },
  { name: "Taraba", capital: "Jalingo", zone: "North East", iso: "NG-TA" },
  { name: "Yobe", capital: "Damaturu", zone: "North East", iso: "NG-YO" },
  { name: "Zamfara", capital: "Gusau", zone: "North West", iso: "NG-ZA" },
];

const ALIASES: Record<string, string> = { fct: "NG-FC", abuja: "NG-FC" };

/** Finds a state by name, ISO code ("NG-LA" or "LA") or common alias ("FCT", "Abuja"), ignoring case. */
export function findState(query: string): State | undefined {
  const q = query.trim().toLowerCase().replace(/\s+state$/, "");
  const iso = ALIASES[q] ?? (q.startsWith("ng-") ? q : `ng-${q}`).toUpperCase();
  return STATES.find((s) => s.name.toLowerCase() === q || s.iso === iso);
}

export const statesInZone = (zone: Zone) => STATES.filter((s) => s.zone === zone);
