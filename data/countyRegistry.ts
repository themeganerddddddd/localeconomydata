export type CountyRegion =
  | "DC Region"
  | "Maryland"
  | "Virginia"
  | "Pennsylvania / Delaware / New Jersey"
  | "North Carolina"
  | "Northeast Corridor"
  | "Southeast Growth Markets"
  | "Great Lakes / Midwest"
  | "Texas Triangle"
  | "Mountain West"
  | "West Coast";

export type CountyRegistryEntry = {
  fips: string;
  name: string;
  state: string;
  stateAbbr: string;
  slug: string;
  region: CountyRegion;
  metro?: string;
};

export const countyRegistry: CountyRegistryEntry[] = [
  { fips: "24031", name: "Montgomery County", state: "Maryland", stateAbbr: "MD", slug: "montgomery-county-md", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "24033", name: "Prince George's County", state: "Maryland", stateAbbr: "MD", slug: "prince-georges-county-md", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "24021", name: "Frederick County", state: "Maryland", stateAbbr: "MD", slug: "frederick-county-md", region: "Maryland", metro: "Washington-Baltimore" },
  { fips: "24027", name: "Howard County", state: "Maryland", stateAbbr: "MD", slug: "howard-county-md", region: "Maryland", metro: "Baltimore-Columbia-Towson" },
  { fips: "24003", name: "Anne Arundel County", state: "Maryland", stateAbbr: "MD", slug: "anne-arundel-county-md", region: "Maryland", metro: "Baltimore-Columbia-Towson" },
  { fips: "24005", name: "Baltimore County", state: "Maryland", stateAbbr: "MD", slug: "baltimore-county-md", region: "Maryland", metro: "Baltimore-Columbia-Towson" },
  { fips: "24510", name: "Baltimore City", state: "Maryland", stateAbbr: "MD", slug: "baltimore-city-md", region: "Maryland", metro: "Baltimore-Columbia-Towson" },
  { fips: "51059", name: "Fairfax County", state: "Virginia", stateAbbr: "VA", slug: "fairfax-county-va", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "51013", name: "Arlington County", state: "Virginia", stateAbbr: "VA", slug: "arlington-county-va", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "51510", name: "Alexandria City", state: "Virginia", stateAbbr: "VA", slug: "alexandria-city-va", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "51107", name: "Loudoun County", state: "Virginia", stateAbbr: "VA", slug: "loudoun-county-va", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "51153", name: "Prince William County", state: "Virginia", stateAbbr: "VA", slug: "prince-william-county-va", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "11001", name: "District of Columbia", state: "District of Columbia", stateAbbr: "DC", slug: "district-of-columbia", region: "DC Region", metro: "Washington-Arlington-Alexandria" },
  { fips: "24017", name: "Charles County", state: "Maryland", stateAbbr: "MD", slug: "charles-county-md", region: "Maryland" },
  { fips: "24025", name: "Harford County", state: "Maryland", stateAbbr: "MD", slug: "harford-county-md", region: "Maryland" },
  { fips: "24013", name: "Carroll County", state: "Maryland", stateAbbr: "MD", slug: "carroll-county-md", region: "Maryland" },
  { fips: "24043", name: "Washington County", state: "Maryland", stateAbbr: "MD", slug: "washington-county-md", region: "Maryland" },
  { fips: "24045", name: "Wicomico County", state: "Maryland", stateAbbr: "MD", slug: "wicomico-county-md", region: "Maryland" },
  { fips: "24035", name: "Queen Anne's County", state: "Maryland", stateAbbr: "MD", slug: "queen-annes-county-md", region: "Maryland" },
  { fips: "24009", name: "Calvert County", state: "Maryland", stateAbbr: "MD", slug: "calvert-county-md", region: "Maryland" },
  { fips: "24037", name: "St. Mary's County", state: "Maryland", stateAbbr: "MD", slug: "st-marys-county-md", region: "Maryland" },
  { fips: "24041", name: "Talbot County", state: "Maryland", stateAbbr: "MD", slug: "talbot-county-md", region: "Maryland" },
  { fips: "51179", name: "Stafford County", state: "Virginia", stateAbbr: "VA", slug: "stafford-county-va", region: "Virginia" },
  { fips: "51177", name: "Spotsylvania County", state: "Virginia", stateAbbr: "VA", slug: "spotsylvania-county-va", region: "Virginia" },
  { fips: "51087", name: "Henrico County", state: "Virginia", stateAbbr: "VA", slug: "henrico-county-va", region: "Virginia" },
  { fips: "51041", name: "Chesterfield County", state: "Virginia", stateAbbr: "VA", slug: "chesterfield-county-va", region: "Virginia" },
  { fips: "51760", name: "Richmond City", state: "Virginia", stateAbbr: "VA", slug: "richmond-city-va", region: "Virginia" },
  { fips: "51810", name: "Virginia Beach City", state: "Virginia", stateAbbr: "VA", slug: "virginia-beach-city-va", region: "Virginia" },
  { fips: "51710", name: "Norfolk City", state: "Virginia", stateAbbr: "VA", slug: "norfolk-city-va", region: "Virginia" },
  { fips: "51003", name: "Albemarle County", state: "Virginia", stateAbbr: "VA", slug: "albemarle-county-va", region: "Virginia" },
  { fips: "51161", name: "Roanoke County", state: "Virginia", stateAbbr: "VA", slug: "roanoke-county-va", region: "Virginia" },
  { fips: "51770", name: "Roanoke City", state: "Virginia", stateAbbr: "VA", slug: "roanoke-city-va", region: "Virginia" },
  { fips: "51540", name: "Charlottesville City", state: "Virginia", stateAbbr: "VA", slug: "charlottesville-city-va", region: "Virginia" },
  { fips: "51069", name: "Frederick County", state: "Virginia", stateAbbr: "VA", slug: "frederick-county-va", region: "Virginia" },
  { fips: "51840", name: "Winchester City", state: "Virginia", stateAbbr: "VA", slug: "winchester-city-va", region: "Virginia" },
  { fips: "42101", name: "Philadelphia County", state: "Pennsylvania", stateAbbr: "PA", slug: "philadelphia-county-pa", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "42045", name: "Delaware County", state: "Pennsylvania", stateAbbr: "PA", slug: "delaware-county-pa", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "42091", name: "Montgomery County", state: "Pennsylvania", stateAbbr: "PA", slug: "montgomery-county-pa", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "42017", name: "Bucks County", state: "Pennsylvania", stateAbbr: "PA", slug: "bucks-county-pa", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "10003", name: "New Castle County", state: "Delaware", stateAbbr: "DE", slug: "new-castle-county-de", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "34007", name: "Camden County", state: "New Jersey", stateAbbr: "NJ", slug: "camden-county-nj", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "34021", name: "Mercer County", state: "New Jersey", stateAbbr: "NJ", slug: "mercer-county-nj", region: "Pennsylvania / Delaware / New Jersey" },
  { fips: "37183", name: "Wake County", state: "North Carolina", stateAbbr: "NC", slug: "wake-county-nc", region: "North Carolina" },
  { fips: "37063", name: "Durham County", state: "North Carolina", stateAbbr: "NC", slug: "durham-county-nc", region: "North Carolina" },
  { fips: "37119", name: "Mecklenburg County", state: "North Carolina", stateAbbr: "NC", slug: "mecklenburg-county-nc", region: "North Carolina" },
  { fips: "37081", name: "Guilford County", state: "North Carolina", stateAbbr: "NC", slug: "guilford-county-nc", region: "North Carolina" },
  { fips: "13121", name: "Fulton County", state: "Georgia", stateAbbr: "GA", slug: "fulton-county-ga", region: "Southeast Growth Markets", metro: "Atlanta-Sandy Springs-Roswell" },
  { fips: "13135", name: "Gwinnett County", state: "Georgia", stateAbbr: "GA", slug: "gwinnett-county-ga", region: "Southeast Growth Markets", metro: "Atlanta-Sandy Springs-Roswell" },
  { fips: "13067", name: "Cobb County", state: "Georgia", stateAbbr: "GA", slug: "cobb-county-ga", region: "Southeast Growth Markets", metro: "Atlanta-Sandy Springs-Roswell" },
  { fips: "13051", name: "Chatham County", state: "Georgia", stateAbbr: "GA", slug: "chatham-county-ga", region: "Southeast Growth Markets", metro: "Savannah" },
  { fips: "12086", name: "Miami-Dade County", state: "Florida", stateAbbr: "FL", slug: "miami-dade-county-fl", region: "Southeast Growth Markets", metro: "Miami-Fort Lauderdale-West Palm Beach" },
  { fips: "12095", name: "Orange County", state: "Florida", stateAbbr: "FL", slug: "orange-county-fl", region: "Southeast Growth Markets", metro: "Orlando-Kissimmee-Sanford" },
  { fips: "12057", name: "Hillsborough County", state: "Florida", stateAbbr: "FL", slug: "hillsborough-county-fl", region: "Southeast Growth Markets", metro: "Tampa-St. Petersburg-Clearwater" },
  { fips: "12103", name: "Pinellas County", state: "Florida", stateAbbr: "FL", slug: "pinellas-county-fl", region: "Southeast Growth Markets", metro: "Tampa-St. Petersburg-Clearwater" },
  { fips: "12031", name: "Duval County", state: "Florida", stateAbbr: "FL", slug: "duval-county-fl", region: "Southeast Growth Markets", metro: "Jacksonville" },
  { fips: "48201", name: "Harris County", state: "Texas", stateAbbr: "TX", slug: "harris-county-tx", region: "Texas Triangle", metro: "Houston-The Woodlands-Sugar Land" },
  { fips: "48113", name: "Dallas County", state: "Texas", stateAbbr: "TX", slug: "dallas-county-tx", region: "Texas Triangle", metro: "Dallas-Fort Worth-Arlington" },
  { fips: "48439", name: "Tarrant County", state: "Texas", stateAbbr: "TX", slug: "tarrant-county-tx", region: "Texas Triangle", metro: "Dallas-Fort Worth-Arlington" },
  { fips: "48453", name: "Travis County", state: "Texas", stateAbbr: "TX", slug: "travis-county-tx", region: "Texas Triangle", metro: "Austin-Round Rock" },
  { fips: "48029", name: "Bexar County", state: "Texas", stateAbbr: "TX", slug: "bexar-county-tx", region: "Texas Triangle", metro: "San Antonio-New Braunfels" },
  { fips: "48085", name: "Collin County", state: "Texas", stateAbbr: "TX", slug: "collin-county-tx", region: "Texas Triangle", metro: "Dallas-Fort Worth-Arlington" },
  { fips: "04013", name: "Maricopa County", state: "Arizona", stateAbbr: "AZ", slug: "maricopa-county-az", region: "Mountain West", metro: "Phoenix-Mesa-Scottsdale" },
  { fips: "04019", name: "Pima County", state: "Arizona", stateAbbr: "AZ", slug: "pima-county-az", region: "Mountain West", metro: "Tucson" },
  { fips: "08031", name: "Denver County", state: "Colorado", stateAbbr: "CO", slug: "denver-county-co", region: "Mountain West", metro: "Denver-Aurora-Lakewood" },
  { fips: "08005", name: "Arapahoe County", state: "Colorado", stateAbbr: "CO", slug: "arapahoe-county-co", region: "Mountain West", metro: "Denver-Aurora-Lakewood" },
  { fips: "08059", name: "Jefferson County", state: "Colorado", stateAbbr: "CO", slug: "jefferson-county-co", region: "Mountain West", metro: "Denver-Aurora-Lakewood" },
  { fips: "06037", name: "Los Angeles County", state: "California", stateAbbr: "CA", slug: "los-angeles-county-ca", region: "West Coast", metro: "Los Angeles-Long Beach-Anaheim" },
  { fips: "06073", name: "San Diego County", state: "California", stateAbbr: "CA", slug: "san-diego-county-ca", region: "West Coast", metro: "San Diego-Carlsbad" },
  { fips: "06059", name: "Orange County", state: "California", stateAbbr: "CA", slug: "orange-county-ca", region: "West Coast", metro: "Los Angeles-Long Beach-Anaheim" },
  { fips: "06085", name: "Santa Clara County", state: "California", stateAbbr: "CA", slug: "santa-clara-county-ca", region: "West Coast", metro: "San Jose-Sunnyvale-Santa Clara" },
  { fips: "06001", name: "Alameda County", state: "California", stateAbbr: "CA", slug: "alameda-county-ca", region: "West Coast", metro: "San Francisco-Oakland-Hayward" },
  { fips: "53033", name: "King County", state: "Washington", stateAbbr: "WA", slug: "king-county-wa", region: "West Coast", metro: "Seattle-Tacoma-Bellevue" },
  { fips: "53061", name: "Snohomish County", state: "Washington", stateAbbr: "WA", slug: "snohomish-county-wa", region: "West Coast", metro: "Seattle-Tacoma-Bellevue" },
  { fips: "41051", name: "Multnomah County", state: "Oregon", stateAbbr: "OR", slug: "multnomah-county-or", region: "West Coast", metro: "Portland-Vancouver-Hillsboro" },
  { fips: "41067", name: "Washington County", state: "Oregon", stateAbbr: "OR", slug: "washington-county-or", region: "West Coast", metro: "Portland-Vancouver-Hillsboro" },
  { fips: "17031", name: "Cook County", state: "Illinois", stateAbbr: "IL", slug: "cook-county-il", region: "Great Lakes / Midwest", metro: "Chicago-Naperville-Elgin" },
  { fips: "17043", name: "DuPage County", state: "Illinois", stateAbbr: "IL", slug: "dupage-county-il", region: "Great Lakes / Midwest", metro: "Chicago-Naperville-Elgin" },
  { fips: "18097", name: "Marion County", state: "Indiana", stateAbbr: "IN", slug: "marion-county-in", region: "Great Lakes / Midwest", metro: "Indianapolis-Carmel-Anderson" },
  { fips: "18057", name: "Hamilton County", state: "Indiana", stateAbbr: "IN", slug: "hamilton-county-in", region: "Great Lakes / Midwest", metro: "Indianapolis-Carmel-Anderson" },
  { fips: "26163", name: "Wayne County", state: "Michigan", stateAbbr: "MI", slug: "wayne-county-mi", region: "Great Lakes / Midwest", metro: "Detroit-Warren-Dearborn" },
  { fips: "26081", name: "Kent County", state: "Michigan", stateAbbr: "MI", slug: "kent-county-mi", region: "Great Lakes / Midwest", metro: "Grand Rapids-Wyoming" },
  { fips: "39049", name: "Franklin County", state: "Ohio", stateAbbr: "OH", slug: "franklin-county-oh", region: "Great Lakes / Midwest", metro: "Columbus" },
  { fips: "39035", name: "Cuyahoga County", state: "Ohio", stateAbbr: "OH", slug: "cuyahoga-county-oh", region: "Great Lakes / Midwest", metro: "Cleveland-Elyria" },
  { fips: "29095", name: "Jackson County", state: "Missouri", stateAbbr: "MO", slug: "jackson-county-mo", region: "Great Lakes / Midwest", metro: "Kansas City" },
  { fips: "36061", name: "New York County", state: "New York", stateAbbr: "NY", slug: "new-york-county-ny", region: "Northeast Corridor", metro: "New York-Newark-Jersey City" },
  { fips: "36047", name: "Kings County", state: "New York", stateAbbr: "NY", slug: "kings-county-ny", region: "Northeast Corridor", metro: "New York-Newark-Jersey City" },
  { fips: "36029", name: "Erie County", state: "New York", stateAbbr: "NY", slug: "erie-county-ny", region: "Northeast Corridor", metro: "Buffalo-Cheektowaga-Niagara Falls" },
  { fips: "36055", name: "Monroe County", state: "New York", stateAbbr: "NY", slug: "monroe-county-ny", region: "Northeast Corridor", metro: "Rochester" },
  { fips: "25017", name: "Middlesex County", state: "Massachusetts", stateAbbr: "MA", slug: "middlesex-county-ma", region: "Northeast Corridor", metro: "Boston-Cambridge-Newton" },
  { fips: "25025", name: "Suffolk County", state: "Massachusetts", stateAbbr: "MA", slug: "suffolk-county-ma", region: "Northeast Corridor", metro: "Boston-Cambridge-Newton" },
  { fips: "09001", name: "Fairfield County", state: "Connecticut", stateAbbr: "CT", slug: "fairfield-county-ct", region: "Northeast Corridor", metro: "Bridgeport-Stamford-Norwalk" }
];

export const countyRegistryBySlug = Object.fromEntries(countyRegistry.map((county) => [county.slug, county]));
export const countyRegistryByFips = Object.fromEntries(countyRegistry.map((county) => [county.fips, county]));
