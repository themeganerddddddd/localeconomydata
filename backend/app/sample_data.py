from __future__ import annotations

import csv
from pathlib import Path

# Seed values are representative MVP data, not official published observations.
# The ingestion modules are structured to replace this with full public-source pulls.

RAW_DIR = Path(__file__).resolve().parent / "data" / "raw"

STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan",
    "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota",
    "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee",
    "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming", "PR": "Puerto Rico",
}

BASE_COUNTIES = [
    ("01073", "Jefferson County", "Alabama", "AL", 674000, 33.520, -86.802, 3.4, 322000, 61200, 1440, 4.0, [("62", 44500, 1110), ("23", 26000, 1290), ("541", 23800, 1710)]),
    ("04013", "Maricopa County", "Arizona", "AZ", 4587000, 33.448, -112.074, 3.5, 2440000, 81593, 1339, 3.9, [("23", 179000, 1424), ("722", 185000, 503), ("621", 167500, 1167)]),
    ("06037", "Los Angeles County", "California", "CA", 9663000, 34.052, -118.244, 5.3, 4890000, 82700, 1568, 1.3, [("722", 392000, 612), ("541", 355000, 2240), ("621", 341000, 1334)]),
    ("06075", "San Francisco County", "California", "CA", 808000, 37.775, -122.419, 3.7, 566000, 136700, 2480, 1.8, [("541", 109000, 3420), ("5112", 38500, 4200), ("72", 61200, 735)]),
    ("08031", "Denver County", "Colorado", "CO", 716000, 39.739, -104.990, 3.8, 492000, 94800, 1660, 2.8, [("541", 61500, 2310), ("72", 50500, 650), ("52", 34000, 2190)]),
    ("11001", "District of Columbia", "District of Columbia", "DC", 679000, 38.907, -77.037, 5.2, 389000, 108210, 2057, 2.0, [("92", 233000, 1873), ("541", 127000, 2562), ("813", 73500, 1329)]),
    ("12086", "Miami-Dade County", "Florida", "FL", 2690000, 25.761, -80.191, 2.7, 1390000, 68100, 1215, 3.2, [("72", 132000, 628), ("48", 94400, 1180), ("621", 103000, 1095)]),
    ("12095", "Orange County", "Florida", "FL", 1490000, 28.538, -81.379, 3.1, 846000, 74500, 1120, 4.4, [("72", 121000, 575), ("561", 68500, 830), ("621", 64000, 1040)]),
    ("13121", "Fulton County", "Georgia", "GA", 1080000, 33.749, -84.388, 3.4, 660000, 91700, 1610, 3.6, [("541", 99000, 2180), ("52", 60500, 2105), ("621", 52000, 1115)]),
    ("17031", "Cook County", "Illinois", "IL", 5087000, 41.878, -87.630, 4.9, 2680000, 75800, 1505, 1.2, [("621", 229000, 1240), ("541", 218000, 2095), ("722", 181000, 570)]),
    ("18097", "Marion County", "Indiana", "IN", 969000, 39.768, -86.158, 3.6, 514000, 63200, 1190, 2.1, [("62", 78000, 1120), ("48", 45500, 1035), ("541", 38200, 1620)]),
    ("25025", "Suffolk County", "Massachusetts", "MA", 768000, 42.360, -71.059, 3.0, 548000, 94600, 1960, 2.4, [("621", 94500, 1390), ("541", 86000, 2570), ("611", 61500, 1565)]),
    ("24031", "Montgomery County", "Maryland", "MD", 1052000, 39.136, -77.204, 2.2, 575000, 125583, 1650, 3.0, [("541", 96200, 2295), ("621", 54800, 1166), ("5417", 23100, 2738)]),
    ("26163", "Wayne County", "Michigan", "MI", 1752000, 42.331, -83.046, 5.7, 815000, 56600, 1285, 0.9, [("336", 61500, 1710), ("62", 82500, 1102), ("48", 43000, 1088)]),
    ("27053", "Hennepin County", "Minnesota", "MN", 1260000, 44.977, -93.265, 2.8, 778000, 92300, 1618, 2.2, [("541", 87500, 2190), ("52", 72100, 2155), ("621", 69500, 1225)]),
    ("29095", "Jackson County", "Missouri", "MO", 717000, 39.099, -94.578, 3.2, 382000, 64200, 1242, 1.7, [("62", 53500, 1110), ("541", 29500, 1665), ("722", 28600, 520)]),
    ("32003", "Clark County", "Nevada", "NV", 2336000, 36.169, -115.140, 5.6, 1210000, 68200, 1118, 4.9, [("72", 278000, 670), ("713", 73500, 815), ("561", 71000, 830)]),
    ("36061", "New York County", "New York", "NY", 1597000, 40.783, -73.971, 4.3, 1120000, 101900, 2465, 1.5, [("52", 358000, 3650), ("541", 302000, 2970), ("722", 151000, 710)]),
    ("37183", "Wake County", "North Carolina", "NC", 1180000, 35.779, -78.639, 3.0, 702000, 96914, 1422, 5.1, [("541", 81100, 1802), ("3254", 12100, 2644), ("621", 50200, 1100)]),
    ("39035", "Cuyahoga County", "Ohio", "OH", 1236000, 41.499, -81.694, 4.1, 632000, 61100, 1225, 1.0, [("62", 101000, 1125), ("541", 54200, 1720), ("52", 38500, 1815)]),
    ("41051", "Multnomah County", "Oregon", "OR", 795000, 45.515, -122.679, 3.9, 492000, 83400, 1455, 1.6, [("541", 52500, 1985), ("722", 36500, 625), ("621", 33800, 1140)]),
    ("42101", "Philadelphia County", "Pennsylvania", "PA", 1550000, 39.952, -75.165, 4.7, 744000, 57200, 1320, 0.8, [("621", 118000, 1250), ("611", 84800, 1380), ("541", 78200, 1880)]),
    ("47037", "Davidson County", "Tennessee", "TN", 716000, 36.162, -86.781, 2.9, 438000, 76400, 1310, 3.8, [("72", 47200, 610), ("62", 66200, 1130), ("541", 38500, 1760)]),
    ("48201", "Harris County", "Texas", "TX", 4835000, 29.760, -95.370, 4.0, 2520000, 71000, 1450, 2.5, [("211", 52000, 3120), ("541", 225000, 2190), ("23", 201000, 1450)]),
    ("48453", "Travis County", "Texas", "TX", 1341000, 30.267, -97.743, 3.3, 785000, 92591, 1566, 4.7, [("541", 139500, 2217), ("5112", 46200, 3147), ("722", 68700, 500)]),
    ("49035", "Salt Lake County", "Utah", "UT", 1190000, 40.760, -111.891, 2.7, 702000, 84200, 1375, 4.2, [("541", 64200, 1820), ("52", 50500, 1860), ("48", 44800, 1120)]),
    ("51059", "Fairfax County", "Virginia", "VA", 1148000, 38.835, -77.276, 2.4, 640000, 134115, 1752, 3.0, [("541", 139000, 2418), ("518", 23800, 2457), ("621", 44900, 1201)]),
    ("53033", "King County", "Washington", "WA", 2271000, 47.606, -122.332, 3.6, 1390000, 115500, 2085, 2.6, [("5112", 124000, 3950), ("541", 201000, 2680), ("48", 84000, 1250)]),
    ("55079", "Milwaukee County", "Wisconsin", "WI", 918000, 43.038, -87.906, 3.5, 468000, 58100, 1180, 1.4, [("62", 70500, 1120), ("541", 31300, 1580), ("336", 17800, 1605)]),
    ("22071", "Orleans Parish", "Louisiana", "LA", 364000, 29.951, -90.072, 4.1, 181000, 54245, 1166, 4.3, [("72", 41700, 587), ("711", 7400, 1030), ("62", 31600, 1066)]),
]

BASE_COUNTIES.extend(
    [
        ("24003", "Anne Arundel County", "Maryland", "MD", 598000, 39.006, -76.603, 2.5, 328000, 108700, 1360, 2.6, [("62", 36200, 1115), ("541", 33500, 1850), ("92", 28500, 1520), ("23", 19400, 1310), ("722", 21400, 520), ("48", 12800, 1060)]),
        ("24005", "Baltimore County", "Maryland", "MD", 846000, 39.401, -76.602, 3.0, 437000, 86400, 1268, 1.9, [("62", 62200, 1118), ("611", 41500, 1120), ("541", 35900, 1710), ("722", 28200, 510), ("44", 26500, 690), ("23", 18400, 1240)]),
        ("24510", "Baltimore City", "Maryland", "MD", 565000, 39.290, -76.612, 5.4, 286000, 58400, 1286, 0.7, [("62", 74200, 1200), ("611", 31200, 1280), ("72", 23800, 540), ("541", 21300, 1680), ("92", 17600, 1420), ("48", 11200, 1040)]),
        ("24013", "Carroll County", "Maryland", "MD", 176000, 39.563, -77.015, 2.7, 96000, 101200, 1045, 1.3, [("23", 6800, 1180), ("62", 7200, 1040), ("44", 6100, 650), ("541", 4900, 1510), ("722", 4200, 500), ("11", 1600, 720)]),
        ("24015", "Cecil County", "Maryland", "MD", 104000, 39.574, -75.946, 3.2, 54000, 81500, 1115, 2.0, [("48", 7200, 1045), ("23", 3900, 1190), ("62", 4100, 1008), ("44", 3600, 640), ("722", 2500, 495), ("31", 2200, 1320)]),
        ("24017", "Charles County", "Maryland", "MD", 170000, 38.522, -76.981, 3.1, 92000, 112500, 1065, 2.8, [("92", 8100, 1490), ("62", 6100, 1040), ("44", 5300, 650), ("23", 4700, 1210), ("541", 4100, 1570), ("722", 3300, 500)]),
        ("24019", "Dorchester County", "Maryland", "MD", 33000, 38.415, -76.178, 4.2, 15500, 59000, 890, 0.5, [("31", 2100, 980), ("72", 1200, 490), ("62", 1300, 930), ("11", 900, 700), ("44", 850, 610), ("23", 720, 1040)]),
        ("24021", "Frederick County", "Maryland", "MD", 288000, 39.414, -77.410, 2.8, 157000, 110600, 1240, 3.4, [("541", 15200, 1715), ("62", 14200, 1055), ("23", 9100, 1230), ("44", 8500, 660), ("722", 6900, 510), ("5417", 2600, 2150)]),
        ("24025", "Harford County", "Maryland", "MD", 264000, 39.583, -76.363, 2.9, 139000, 97300, 1165, 2.1, [("92", 14200, 1500), ("62", 11900, 1030), ("23", 7200, 1215), ("44", 6900, 650), ("541", 6100, 1580), ("722", 5200, 500)]),
        ("24027", "Howard County", "Maryland", "MD", 337000, 39.287, -76.964, 2.3, 188000, 139500, 1588, 3.2, [("541", 24500, 2130), ("62", 15100, 1125), ("611", 10200, 1120), ("518", 5300, 2350), ("722", 7800, 520), ("23", 6400, 1320)]),
        ("24033", "Prince George's County", "Maryland", "MD", 967000, 38.784, -76.872, 3.5, 514000, 93600, 1208, 2.4, [("92", 51500, 1490), ("62", 46800, 1040), ("48", 31200, 1060), ("722", 25800, 505), ("541", 23600, 1680), ("23", 22100, 1230)]),
        ("24037", "St. Mary's County", "Maryland", "MD", 114000, 38.301, -76.640, 3.0, 61000, 104800, 1235, 1.8, [("92", 9100, 1510), ("541", 5200, 1690), ("62", 3600, 1020), ("44", 2800, 650), ("722", 2300, 500), ("23", 2100, 1205)]),
        ("24043", "Washington County", "Maryland", "MD", 155000, 39.642, -77.720, 3.4, 78000, 70400, 1042, 1.2, [("48", 8400, 1040), ("62", 7600, 1005), ("44", 4900, 630), ("31", 4200, 1210), ("722", 3300, 490), ("23", 3100, 1160)]),
        ("24045", "Wicomico County", "Maryland", "MD", 105000, 38.365, -75.594, 4.0, 52000, 63800, 930, 1.1, [("62", 5200, 980), ("611", 4700, 1010), ("72", 3600, 490), ("44", 3200, 620), ("31", 2600, 1050), ("23", 1900, 1080)]),
        ("51013", "Arlington County", "Virginia", "VA", 235000, 38.879, -77.106, 2.1, 170000, 132400, 2160, 2.7, [("541", 42000, 2500), ("92", 20500, 1540), ("52", 12200, 2210), ("722", 10800, 560), ("621", 8500, 1210), ("518", 4300, 2490)]),
        ("51107", "Loudoun County", "Virginia", "VA", 448000, 39.076, -77.653, 2.2, 252000, 170300, 1880, 5.6, [("518", 32000, 2600), ("541", 30500, 2200), ("23", 12800, 1360), ("621", 9600, 1130), ("44", 8400, 670), ("722", 7600, 520)]),
        ("51153", "Prince William County", "Virginia", "VA", 493000, 38.784, -77.607, 2.6, 274000, 121200, 1168, 3.5, [("23", 17800, 1300), ("62", 14300, 1050), ("44", 13200, 650), ("48", 11800, 1080), ("541", 10200, 1640), ("722", 8900, 500)]),
        ("51510", "Alexandria City", "Virginia", "VA", 155000, 38.804, -77.047, 2.5, 101000, 112200, 1555, 2.0, [("541", 16400, 2110), ("92", 7200, 1490), ("621", 6100, 1120), ("722", 5400, 515), ("52", 4100, 1990), ("813", 3800, 1210)]),
        ("51760", "Richmond City", "Virginia", "VA", 230000, 37.541, -77.436, 3.8, 128000, 67400, 1260, 2.3, [("52", 17600, 2050), ("62", 18800, 1060), ("541", 14900, 1760), ("72", 10300, 505), ("92", 8200, 1420), ("611", 7600, 1060)]),
        ("06073", "San Diego County", "California", "CA", 3287000, 32.716, -117.161, 4.2, 1710000, 89600, 1465, 2.2, [("541", 153000, 2140), ("621", 142000, 1210), ("72", 128000, 605), ("5417", 28200, 2530), ("23", 80400, 1330), ("48", 52200, 1130)]),
        ("06059", "Orange County", "California", "CA", 3135000, 33.717, -117.831, 3.9, 1640000, 106700, 1580, 2.0, [("541", 151000, 2240), ("621", 132000, 1220), ("52", 91000, 2140), ("722", 112000, 610), ("23", 73500, 1350), ("44", 82000, 720)]),
        ("12057", "Hillsborough County", "Florida", "FL", 1540000, 27.951, -82.458, 3.0, 843000, 78900, 1218, 3.9, [("541", 68200, 1740), ("52", 50200, 1830), ("621", 65500, 1070), ("722", 54500, 510), ("48", 40200, 1015), ("23", 38800, 1190)]),
        ("12011", "Broward County", "Florida", "FL", 1948000, 26.123, -80.137, 3.2, 1030000, 73500, 1165, 3.0, [("72", 80200, 520), ("621", 76500, 1060), ("541", 61200, 1640), ("48", 45200, 1000), ("44", 51800, 650), ("23", 37200, 1160)]),
        ("53061", "Snohomish County", "Washington", "WA", 844000, 47.979, -122.202, 4.0, 462000, 101200, 1430, 2.9, [("336", 30500, 1780), ("23", 25200, 1350), ("62", 27400, 1080), ("44", 21200, 670), ("541", 18800, 1800), ("48", 14800, 1120)]),
    ]
)

def _extend_counties_from_gazetteer() -> None:
    """Load every U.S. county name/FIPS from the cached Census gazetteer when present."""
    gazetteer_path = RAW_DIR / "2024_Gaz_counties_national.txt"
    if not gazetteer_path.exists():
        return

    existing = {row[0] for row in BASE_COUNTIES}
    with gazetteer_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for raw_row in reader:
            row = {key.strip(): value.strip() for key, value in raw_row.items() if key}
            fips = str(row["GEOID"]).zfill(5)
            state_abbr = row["USPS"]
            if fips in existing or state_abbr == "PR":
                continue

            seed = int(fips)
            population = 18_000 + (seed * 37) % 950_000
            labor_force = max(7_500, round(population * (0.42 + (seed % 17) * 0.006)))
            income = 46_000 + (seed * 19) % 92_000
            wage = 850 + (seed * 7) % 1_550
            unemployment = round(2.1 + (seed % 47) / 10, 1)
            growth = round(-0.4 + (seed % 58) / 13, 1)
            BASE_COUNTIES.append(
                (
                    fips,
                    row["NAME"],
                    STATE_NAMES.get(state_abbr, state_abbr),
                    state_abbr,
                    population,
                    float(row["INTPTLAT"]),
                    float(row["INTPTLONG"]),
                    unemployment,
                    labor_force,
                    income,
                    wage,
                    growth,
                    [],
                )
            )


_extend_counties_from_gazetteer()

INDUSTRY_TITLES = {
    "10": "Total, all industries",
    "11": "Agriculture, forestry, fishing and hunting",
    "111": "Crop production",
    "112": "Animal production and aquaculture",
    "113": "Forestry and logging",
    "21": "Mining, quarrying, and oil and gas extraction",
    "211": "Oil and gas extraction",
    "212": "Mining, except oil and gas",
    "22": "Utilities",
    "221": "Utilities",
    "23": "Construction",
    "236": "Construction of buildings",
    "237": "Heavy and civil engineering construction",
    "238": "Specialty trade contractors",
    "31": "Manufacturing",
    "311": "Food manufacturing",
    "312": "Beverage and tobacco product manufacturing",
    "321": "Wood product manufacturing",
    "322": "Paper manufacturing",
    "323": "Printing and related support activities",
    "324": "Petroleum and coal products manufacturing",
    "325": "Chemical manufacturing",
    "3254": "Pharmaceutical and medicine manufacturing",
    "326": "Plastics and rubber products manufacturing",
    "327": "Nonmetallic mineral product manufacturing",
    "331": "Primary metal manufacturing",
    "332": "Fabricated metal product manufacturing",
    "333": "Machinery manufacturing",
    "334": "Computer and electronic product manufacturing",
    "335": "Electrical equipment and appliance manufacturing",
    "336": "Transportation equipment manufacturing",
    "337": "Furniture and related product manufacturing",
    "339": "Miscellaneous manufacturing",
    "42": "Wholesale trade",
    "423": "Merchant wholesalers, durable goods",
    "424": "Merchant wholesalers, nondurable goods",
    "44": "Retail trade",
    "445": "Food and beverage retailers",
    "452": "General merchandise retailers",
    "48": "Transportation and warehousing",
    "481": "Air transportation",
    "484": "Truck transportation",
    "493": "Warehousing and storage",
    "51": "Information",
    "511": "Publishing industries",
    "48": "Transportation and warehousing",
    "5112": "Software publishers",
    "516": "Broadcasting and content providers",
    "517": "Telecommunications",
    "518": "Data processing and hosting",
    "52": "Finance and insurance",
    "521": "Monetary authorities-central bank",
    "522": "Credit intermediation and related activities",
    "523": "Securities, commodity contracts, and investments",
    "524": "Insurance carriers and related activities",
    "53": "Real estate and rental and leasing",
    "531": "Real estate",
    "532": "Rental and leasing services",
    "541": "Professional, scientific, and technical services",
    "5413": "Architectural and engineering services",
    "5415": "Computer systems design and related services",
    "5417": "Scientific research and development services",
    "55": "Management of companies and enterprises",
    "551": "Management of companies and enterprises",
    "56": "Administrative and support services",
    "561": "Administrative and support services",
    "562": "Waste management and remediation services",
    "61": "Educational services",
    "611": "Educational services",
    "62": "Health care and social assistance",
    "621": "Ambulatory health care services",
    "622": "Hospitals",
    "623": "Nursing and residential care facilities",
    "624": "Social assistance",
    "71": "Arts, entertainment, and recreation",
    "711": "Performing arts and spectator sports",
    "713": "Amusement, gambling, and recreation",
    "72": "Accommodation and food services",
    "721": "Accommodation",
    "722": "Food services and drinking places",
    "81": "Other services",
    "813": "Religious, grantmaking, civic, professional organizations",
    "811": "Repair and maintenance",
    "812": "Personal and laundry services",
    "92": "Public administration",
}

DEFAULT_INDUSTRY_MIX = [
    ("11", 0.018, 0.50),
    ("111", 0.007, 0.48),
    ("112", 0.006, 0.50),
    ("21", 0.006, 1.72),
    ("211", 0.004, 2.10),
    ("22", 0.009, 1.38),
    ("23", 0.055, 0.88),
    ("236", 0.018, 0.92),
    ("237", 0.012, 1.05),
    ("238", 0.028, 0.84),
    ("31", 0.052, 1.06),
    ("311", 0.012, 0.86),
    ("325", 0.009, 1.62),
    ("3254", 0.004, 1.92),
    ("332", 0.008, 1.08),
    ("333", 0.007, 1.18),
    ("334", 0.009, 1.55),
    ("336", 0.010, 1.18),
    ("42", 0.048, 1.02),
    ("423", 0.027, 1.12),
    ("424", 0.021, 0.96),
    ("44", 0.060, 0.48),
    ("445", 0.016, 0.45),
    ("452", 0.014, 0.46),
    ("48", 0.045, 0.72),
    ("481", 0.004, 1.30),
    ("484", 0.014, 0.78),
    ("493", 0.010, 0.86),
    ("51", 0.032, 1.42),
    ("511", 0.011, 1.55),
    ("5112", 0.006, 2.05),
    ("517", 0.010, 1.38),
    ("518", 0.007, 1.70),
    ("52", 0.040, 1.28),
    ("522", 0.017, 1.30),
    ("523", 0.010, 1.82),
    ("524", 0.013, 1.26),
    ("53", 0.028, 0.96),
    ("531", 0.020, 0.92),
    ("541", 0.070, 1.34),
    ("5413", 0.015, 1.38),
    ("5415", 0.022, 1.55),
    ("5417", 0.008, 1.84),
    ("55", 0.018, 1.72),
    ("551", 0.018, 1.72),
    ("56", 0.050, 0.58),
    ("561", 0.044, 0.58),
    ("562", 0.006, 0.72),
    ("61", 0.045, 0.76),
    ("611", 0.045, 0.76),
    ("62", 0.085, 0.74),
    ("621", 0.046, 0.80),
    ("622", 0.020, 0.88),
    ("623", 0.012, 0.58),
    ("624", 0.007, 0.52),
    ("71", 0.018, 0.55),
    ("711", 0.006, 0.62),
    ("713", 0.008, 0.58),
    ("72", 0.065, 0.40),
    ("721", 0.014, 0.48),
    ("722", 0.051, 0.38),
    ("81", 0.030, 0.54),
    ("811", 0.010, 0.64),
    ("812", 0.011, 0.45),
    ("813", 0.009, 0.66),
    ("92", 0.050, 0.94),
]


def _establishments(employment: int, divisor: int) -> int:
    return max(1, round(employment / divisor))


COUNTIES = [
    (fips, name, state, abbr, population, lat, lon)
    for fips, name, state, abbr, population, lat, lon, *_ in BASE_COUNTIES
]

LAUS = []
ACS = []
BEA = []
QCEW = []

for index, (fips, name, state, abbr, population, lat, lon, unemployment, labor_force, income, wage, growth, industries) in enumerate(BASE_COUNTIES):
    latest_total_employment = round(labor_force * (0.82 + (index % 5) * 0.018))
    annual_growth = (growth + (index % 11) * 0.09) / 100
    base_employment = round(latest_total_employment / ((1 + annual_growth) ** 10))
    base_labor_force = round(labor_force / ((1 + annual_growth * 0.55) ** 10))
    base_population = round(population / ((1 + annual_growth * 0.42) ** 10))
    base_income = round(income / ((1 + 0.029 + (index % 4) * 0.002) ** 10))
    base_wage = round(wage / ((1 + 0.026 + (index % 5) * 0.002) ** 10))

    for year in range(2014, 2025):
        offset = year - 2014
        cycle = ((index + offset) % 5 - 2) * 0.08
        year_employment = round(base_employment * ((1 + annual_growth) ** offset))
        year_wage = round(base_wage * ((1 + 0.026 + (index % 5) * 0.002) ** offset))
        year_labor_force = round(base_labor_force * ((1 + annual_growth * 0.55) ** offset))
        year_population = round(base_population * ((1 + annual_growth * 0.42) ** offset))
        year_unemployment = max(1.8, round(unemployment + (2024 - year) * 0.035 + cycle, 1))
        year_employed = round(year_labor_force * (1 - year_unemployment / 100))
        year_unemployed = year_labor_force - year_employed

        if year <= 2023:
            year_income = round(base_income * ((1 + 0.029 + (index % 4) * 0.002) ** offset))
            poverty = round(5.8 + (index % 9) * 1.9 + max(0, 2020 - year) * 0.08, 1)
            bachelors = round(29 + (year_income - 55000) / 2800 + offset * 0.22, 1)
            rent = round(910 + year_income / 100 + offset * 16)
            home_value = round(year_income * (4.2 + (index % 4) * 0.32 + offset * 0.025))
            commute = round(23.5 + (index % 8) * 1.25 + offset * 0.04, 1)
            personal_income = year_population * year_income
            gdp = round(year_employment * year_wage * 52 * (1.45 + (index % 6) * 0.08 + offset * 0.01))
            ACS.append((fips, year, year_population, year_income, poverty, bachelors, rent, home_value, commute))
            BEA.append((fips, year, gdp, personal_income, round(personal_income / year_population)))

        for month in range(1, 13):
            monthly_rate = max(1.7, round(year_unemployment + ((month % 6) - 3) * 0.03, 1))
            monthly_labor_force = round(year_labor_force * (1 + (month - 6) * 0.0007))
            monthly_employed = round(monthly_labor_force * (1 - monthly_rate / 100))
            LAUS.append((fips, year, month, monthly_rate, monthly_labor_force, monthly_employed, monthly_labor_force - monthly_employed))

        establishments = _establishments(year_employment, 18)
        QCEW.append((fips, year, "Annual", "5", "10", INDUSTRY_TITLES["10"], establishments, year_employment, year_employment * year_wage * 52, year_wage))

        expanded_industries = {code: (employment, wage) for code, employment, wage in industries}
        for industry_code, share, wage_multiplier in DEFAULT_INDUSTRY_MIX:
            expanded_industries.setdefault(industry_code, (round(latest_total_employment * share), round(wage * wage_multiplier)))

        for industry_code, (industry_employment, industry_wage) in expanded_industries.items():
            industry_share = industry_employment / latest_total_employment
            industry_growth = annual_growth * (0.75 + (len(industry_code) % 4) * 0.12)
            year_industry_employment = round(base_employment * industry_share * ((1 + industry_growth) ** offset))
            year_industry_wage = round((industry_wage / ((1 + 0.024 + (len(industry_code) % 3) * 0.003) ** 10)) * ((1 + 0.024 + (len(industry_code) % 3) * 0.003) ** offset))
            QCEW.append(
                (
                    fips,
                    year,
                    "Annual",
                    "5",
                    industry_code,
                    INDUSTRY_TITLES[industry_code],
                    _establishments(year_industry_employment, 16),
                    year_industry_employment,
                    year_industry_employment * year_industry_wage * 52,
                    year_industry_wage,
                )
            )

    latest_labor_force = round(labor_force * (1 + annual_growth * 0.55 * 0.65))
    latest_unemployment = max(1.7, round(unemployment - 0.1 + (index % 4) * 0.04, 1))
    for month in range(1, 10):
        monthly_rate = max(1.7, round(latest_unemployment + ((month % 5) - 2) * 0.025, 1))
        monthly_labor_force = round(latest_labor_force * (1 + (month - 5) * 0.0008))
        monthly_employed = round(monthly_labor_force * (1 - monthly_rate / 100))
        LAUS.append((fips, 2025, month, monthly_rate, monthly_labor_force, monthly_employed, monthly_labor_force - monthly_employed))
