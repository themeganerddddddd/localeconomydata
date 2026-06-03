import { publicMetrics } from "./publicMetrics.generated";
import { countyRegistry, countyRegistryBySlug, type CountyRegistryEntry } from "./countyRegistry";

export type IndustryKey =
  | "life_sciences"
  | "federal_contracting"
  | "software_ai"
  | "logistics"
  | "advanced_manufacturing"
  | "healthcare_services"
  | "professional_services"
  | "education_research"
  | "finance_insurance"
  | "energy_infrastructure";

export type County = {
  slug: string;
  fips?: string;
  name: string;
  state: string;
  stateAbbr?: string;
  region: string;
  population: number;
  laborForce: number;
  employed?: number;
  unemployed?: number;
  unemploymentRate: number;
  medianHouseholdIncome: number;
  bachelorsOrHigher: number;
  povertyRate?: number;
  medianWageEstimate: number;
  mapShapePath?: string;
  gdpMillions?: number;
  personalIncomeMillions?: number;
  perCapitaPersonalIncome?: number;
  dataVintage?: {
    blsLausPeriod?: string;
    censusAcsYear?: string;
    beaGdpYear?: string;
    beaIncomeYear?: string;
    updatedAt?: string;
  };
  dataQuality?: {
    census: "real" | "missing" | "fallback";
    blsLaus: "real" | "missing" | "fallback";
    qcew: "real" | "missing" | "fallback";
    bea?: "real" | "missing" | "fallback";
    shape: "real" | "missing" | "fallback";
  };
  topIndustries: string[];
  vacancyProxy?: number;
  marketAccessScore: number;
  industryScores: Record<IndustryKey, number>;
  strengths: string[];
  risks: string[];
  strengthDetails?: { title: string; description: string }[];
  riskDetails?: { title: string; description: string }[];
  nearby: string[];
  summary: string;
  laborAnalysis: string;
  costAnalysis: string;
  industryAnalysis: string;
};

const scores = (
  life_sciences: number,
  federal_contracting: number,
  software_ai: number,
  logistics: number,
  advanced_manufacturing: number,
  healthcare_services: number,
  professional_services: number
  , education_research = Math.round((healthcare_services + professional_services) / 2)
  , finance_insurance = Math.round((professional_services + software_ai) / 2)
  , energy_infrastructure = Math.round((logistics + advanced_manufacturing) / 2)
): Record<IndustryKey, number> => ({
  life_sciences,
  federal_contracting,
  software_ai,
  logistics,
  advanced_manufacturing,
  healthcare_services,
  professional_services,
  education_research,
  finance_insurance,
  energy_infrastructure
});

const baseCounties: County[] = [
  {
    slug: "montgomery-county-md",
    name: "Montgomery County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 1052000,
    laborForce: 575000,
    unemploymentRate: 2.8,
    medianHouseholdIncome: 125000,
    bachelorsOrHigher: 59,
    medianWageEstimate: 79000,
    topIndustries: ["Life sciences", "Professional services", "Healthcare", "Federal research"],
    vacancyProxy: 4.2,
    marketAccessScore: 87,
    industryScores: scores(96, 84, 88, 57, 62, 87, 91),
    strengths: ["NIH and federal research proximity", "Highly educated workforce", "Established biotech corridor", "Strong executive and professional services base"],
    risks: ["High operating costs", "Competitive hiring market", "Lab and specialized space constraints", "Permitting and site availability can vary by submarket"],
    nearby: ["fairfax-county-va", "district-of-columbia", "frederick-county-md", "howard-county-md"],
    summary: "Montgomery County is one of the DC region's strongest expansion markets for life sciences, federal research-adjacent firms, healthcare, and professional services. Its appeal comes from a deep educated workforce, proximity to federal agencies and research institutions, and an existing base of companies that understand regulated technical markets.",
    laborAnalysis: "The county's labor market is a premium talent market rather than a low-cost labor pool. A large labor force, high educational attainment, and access to commuters from the broader Washington region make Montgomery attractive for companies that need scientists, analysts, software talent, project managers, policy experts, clinical staff, and experienced executives. Low unemployment signals strength but also means hiring plans should include compensation discipline, university partnerships, hybrid work flexibility, and specialized recruiting.",
    costAnalysis: "Montgomery County is not the region's cheapest expansion option. Median household income and wage estimates point to a higher-cost operating environment, especially for employers competing for technical and professional labor. The tradeoff is quality: companies receive access to a dense knowledge workforce, strong public infrastructure, high-income customers, and a business ecosystem already shaped around health, research, and government-facing activity.",
    industryAnalysis: "Life sciences is the clearest fit, especially for firms that benefit from proximity to federal research, specialized contractors, clinical partnerships, and executive talent. Professional services, software, healthcare administration, and research support also score well. Logistics and large-footprint manufacturing are weaker fits because land costs and site constraints reduce the advantage compared with outer counties."
  },
  {
    slug: "prince-georges-county-md",
    name: "Prince George's County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 967000,
    laborForce: 514000,
    unemploymentRate: 3.5,
    medianHouseholdIncome: 93600,
    bachelorsOrHigher: 35,
    medianWageEstimate: 61000,
    topIndustries: ["Logistics", "Healthcare", "Federal facilities", "Construction"],
    vacancyProxy: 5.1,
    marketAccessScore: 91,
    industryScores: scores(72, 82, 68, 89, 71, 80, 73),
    strengths: ["Excellent regional access", "Large workforce", "Relative cost advantage inside the DC market", "Strategic position near federal facilities and transportation corridors"],
    risks: ["Educational attainment varies by submarket", "Some office submarkets need repositioning", "Infrastructure and permitting conditions can differ widely", "Brand perception may lag actual opportunity"],
    nearby: ["montgomery-county-md", "district-of-columbia", "anne-arundel-county-md", "howard-county-md"],
    summary: "Prince George's County is a practical expansion market for companies that want DC-region access without the highest cost profile. It offers a large workforce, strong transportation connectivity, and a mix of urban, suburban, and industrial locations that can support logistics, healthcare, construction, public-sector vendors, and back-office operations.",
    laborAnalysis: "The county's labor force is large and diverse, with access to both local residents and commuters across the Washington-Baltimore corridor. It is especially relevant for employers that need operational teams, healthcare workers, project staff, administrative talent, construction labor, and public-sector support roles. For highly specialized technical hiring, firms may need to recruit regionally rather than relying only on the immediate county pool.",
    costAnalysis: "Compared with Montgomery, Fairfax, Arlington, and DC, Prince George's offers more cost flexibility. That can matter for businesses with space needs, workforce scale, or margin-sensitive operations. The county's value proposition is strongest when a company can benefit from market access while keeping real estate and wage pressures below the most expensive inner-core locations.",
    industryAnalysis: "Logistics, healthcare services, construction, federal support, and professional operations are strong fits. Life sciences and software can work in specific nodes, especially when tied to university or federal activity, but those industries generally require more careful submarket selection and talent strategy."
  },
  {
    slug: "frederick-county-md",
    name: "Frederick County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 288000,
    laborForce: 157000,
    unemploymentRate: 2.9,
    medianHouseholdIncome: 110600,
    bachelorsOrHigher: 43,
    medianWageEstimate: 65000,
    topIndustries: ["Life sciences", "Advanced manufacturing", "Logistics", "Healthcare"],
    vacancyProxy: 4.8,
    marketAccessScore: 78,
    industryScores: scores(91, 69, 71, 81, 84, 76, 70),
    strengths: ["Life sciences and biomanufacturing identity", "Lower costs than inner DC counties", "I-270 corridor access", "Room for specialized facilities"],
    risks: ["Smaller labor pool than core counties", "Commute distance from some regional talent clusters", "Infrastructure needs can be site-specific", "Growth management constraints can affect availability"],
    nearby: ["montgomery-county-md", "howard-county-md", "washington-county-md", "loudoun-county-va"],
    summary: "Frederick County is one of the most compelling DC-region options for life sciences companies that need more space, lower costs, and a corridor connection to Montgomery County and federal research activity. It combines a specialized industry story with a more flexible site-selection environment.",
    laborAnalysis: "Frederick's labor market is smaller than Montgomery or Fairfax, but it can support specialized growth when firms recruit across the I-270 corridor. The county is particularly relevant for lab operations, biomanufacturing, advanced production, logistics support, healthcare, and technical roles that do not require every employee to be in the urban core. Hiring plans should include regional commuting analysis and partnerships with training institutions.",
    costAnalysis: "Frederick offers a better cost-to-capability balance than many inner DC markets. Wages and real estate are not low in an absolute sense, but they are more manageable for firms needing wet-lab, production, flex, or industrial space. For companies graduating out of expensive core submarkets, Frederick can preserve regional access while improving operating economics.",
    industryAnalysis: "Life sciences and advanced manufacturing are the standout fits. Logistics also performs well because of highway access and comparatively better space availability. Federal contracting and software are viable but less dominant than in Fairfax, Arlington, Montgomery, or DC."
  },
  {
    slug: "howard-county-md",
    name: "Howard County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 337000,
    laborForce: 188000,
    unemploymentRate: 2.7,
    medianHouseholdIncome: 139500,
    bachelorsOrHigher: 57,
    medianWageEstimate: 76000,
    topIndustries: ["Professional services", "Software", "Healthcare", "Education"],
    vacancyProxy: 3.7,
    marketAccessScore: 86,
    industryScores: scores(82, 81, 88, 72, 69, 82, 90),
    strengths: ["Highly educated residents", "Strong Baltimore-Washington access", "Attractive executive and knowledge-worker location", "Balanced business environment"],
    risks: ["High household income reflects cost pressure", "Limited scale compared with larger counties", "Tight labor market", "Competition from both Baltimore and DC nodes"],
    nearby: ["montgomery-county-md", "anne-arundel-county-md", "baltimore-county-md", "frederick-county-md"],
    summary: "Howard County is a high-quality expansion market for professional services, software, healthcare, education-related services, and companies that need access to both the Baltimore and Washington labor markets. It is not the largest county in the region, but it is unusually well positioned for high-skill suburban operations.",
    laborAnalysis: "Howard's workforce profile is defined by education, household income, and cross-market access. Employers can draw from local residents while also reaching talent in Baltimore, Montgomery, Prince George's, Anne Arundel, and DC. The county is a strong fit for firms where productivity and workforce quality matter more than finding the absolute lowest wage environment.",
    costAnalysis: "Costs are elevated because Howard is a desirable residential and business location. Companies choosing Howard are often buying reliability, workforce quality, and regional access. For cost-sensitive operations, the county may be better suited to headquarters, client-facing offices, technical teams, and specialized operations than to large labor-intensive facilities.",
    industryAnalysis: "Professional services and software are the strongest fits. Healthcare and education-oriented services are also credible. The county can support life sciences and advanced manufacturing in targeted sites, but it is less specialized than Montgomery or Frederick for those use cases."
  },
  {
    slug: "anne-arundel-county-md",
    name: "Anne Arundel County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 598000,
    laborForce: 328000,
    unemploymentRate: 3.0,
    medianHouseholdIncome: 108700,
    bachelorsOrHigher: 43,
    medianWageEstimate: 65000,
    topIndustries: ["Logistics", "Federal facilities", "Healthcare", "Professional services"],
    vacancyProxy: 4.9,
    marketAccessScore: 84,
    industryScores: scores(68, 76, 70, 86, 73, 78, 75),
    strengths: ["BWI airport access", "Baltimore-Washington location", "Defense and public-sector adjacency", "Strong logistics and service economy"],
    risks: ["Submarket variation is significant", "Traffic and corridor constraints", "Competition for workers across two metros", "Specialized life sciences depth is thinner"],
    nearby: ["howard-county-md", "prince-georges-county-md", "baltimore-county-md", "baltimore-city-md"],
    summary: "Anne Arundel County is a corridor market with strong transportation access, public-sector adjacency, and a balanced workforce. It works especially well for firms that need proximity to Baltimore, Washington, BWI Airport, defense-related facilities, and a mixed base of professional, logistics, and service workers.",
    laborAnalysis: "The labor market is broad enough to support operations, healthcare, logistics, professional services, and public-sector vendors. Because the county sits between major employment centers, employers can recruit from several directions. The hiring challenge is that workers also have many options in nearby counties, so firms should be realistic about compensation and commute patterns.",
    costAnalysis: "Anne Arundel is not a bargain market, but it offers a middle-ground cost profile compared with the most expensive DC core counties. For companies that value airport access and regional reach, the cost premium may be justified. Site selection should distinguish carefully between office, flex, industrial, and waterfront or amenity-driven submarkets.",
    industryAnalysis: "Logistics, federal support, healthcare services, and professional services are the best fits. Advanced manufacturing can work in appropriate industrial locations. Life sciences is less central, although certain suppliers, service firms, and health-adjacent companies may find opportunities."
  },
  {
    slug: "baltimore-county-md",
    name: "Baltimore County",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 846000,
    laborForce: 437000,
    unemploymentRate: 3.4,
    medianHouseholdIncome: 86400,
    bachelorsOrHigher: 39,
    medianWageEstimate: 59000,
    topIndustries: ["Healthcare", "Education", "Logistics", "Professional services"],
    vacancyProxy: 5.3,
    marketAccessScore: 80,
    industryScores: scores(70, 64, 66, 82, 72, 86, 72),
    strengths: ["Large workforce", "Healthcare and education anchors", "Relative cost advantage", "Suburban and industrial site variety"],
    risks: ["Competition with Baltimore City and DC suburbs", "Some older commercial stock", "Talent depth varies by occupation", "Market perception can be uneven"],
    nearby: ["baltimore-city-md", "howard-county-md", "anne-arundel-county-md", "frederick-county-md"],
    summary: "Baltimore County is a large, practical expansion market for healthcare, education, logistics, back-office operations, and professional services firms that want Maryland scale without inner-DC costs. Its strengths are workforce size, institutional anchors, and real estate variety.",
    laborAnalysis: "The county has enough labor force depth to support both professional and operational hiring. Healthcare, education, logistics, construction, administration, and business support roles are especially relevant. Employers needing very specialized venture-backed technology talent may need a regional strategy that includes Baltimore City, Howard County, and the DC suburbs.",
    costAnalysis: "Baltimore County's cost profile is one of its advantages. Median income and wage estimates are lower than many DC suburbs, making it more attractive for companies with larger teams or more price-sensitive operations. The tradeoff is that firms should select submarkets carefully based on customer access, workforce commute sheds, and facility quality.",
    industryAnalysis: "Healthcare services is the strongest fit, followed by logistics, education-related services, professional services, and selected manufacturing. Life sciences and software can work where they connect to institutional anchors, but the county is more broadly operational than narrowly specialized."
  },
  {
    slug: "baltimore-city-md",
    name: "Baltimore City",
    state: "Maryland",
    region: "DC / Maryland / Virginia",
    population: 565000,
    laborForce: 286000,
    unemploymentRate: 5.4,
    medianHouseholdIncome: 58400,
    bachelorsOrHigher: 36,
    medianWageEstimate: 56000,
    topIndustries: ["Healthcare", "Education", "Port logistics", "Professional services"],
    vacancyProxy: 7.2,
    marketAccessScore: 82,
    industryScores: scores(76, 63, 72, 83, 66, 91, 78),
    strengths: ["Major healthcare and university anchors", "Port and logistics assets", "Urban talent and lower relative costs", "Strong civic and institutional ecosystem"],
    risks: ["Public safety and perception issues", "Neighborhood-level variation", "Workforce barriers require planning", "Real estate and permitting complexity can vary"],
    nearby: ["baltimore-county-md", "anne-arundel-county-md", "howard-county-md", "prince-georges-county-md"],
    summary: "Baltimore City is a differentiated expansion market with strong healthcare, education, port, logistics, and urban innovation assets. It is not a generic low-risk suburban market, but for the right company it can offer talent access, institutional partnerships, lower relative costs, and a distinctive urban operating environment.",
    laborAnalysis: "The labor market includes major anchor institutions, a large healthcare workforce, university-linked talent, operational workers, and a meaningful pool of residents who can benefit from employer training partnerships. Companies should plan for workforce development, neighborhood selection, and retention strategy rather than assuming hiring will be frictionless.",
    costAnalysis: "Baltimore City's cost profile can be attractive compared with DC and affluent suburbs, particularly for office, healthcare, nonprofit, education, creative, and logistics-adjacent operations. Lower costs come with greater execution complexity. Site selection, security, transit access, and partnership strategy matter more here than in simpler suburban expansions.",
    industryAnalysis: "Healthcare services is the dominant fit. Education, port logistics, professional services, social-impact ventures, and certain life-sciences or digital health companies can also perform well. The city is strongest when firms connect to anchors rather than operating as isolated stand-alone facilities."
  },
  {
    slug: "fairfax-county-va",
    name: "Fairfax County",
    state: "Virginia",
    region: "DC / Maryland / Virginia",
    population: 1148000,
    laborForce: 640000,
    unemploymentRate: 2.6,
    medianHouseholdIncome: 134000,
    bachelorsOrHigher: 61,
    medianWageEstimate: 84000,
    topIndustries: ["Federal contracting", "Software", "Cybersecurity", "Professional services"],
    vacancyProxy: 4.1,
    marketAccessScore: 94,
    industryScores: scores(75, 98, 94, 69, 70, 78, 93),
    strengths: ["Exceptional federal contracting ecosystem", "Large high-skill workforce", "Dulles corridor access", "Strong technology and cybersecurity base"],
    risks: ["High labor and real estate costs", "Tight hiring market", "Competition from Arlington and Loudoun", "Large-county averages hide submarket differences"],
    nearby: ["arlington-county-va", "loudoun-county-va", "prince-william-county-va", "montgomery-county-md"],
    summary: "Fairfax County is one of the premier expansion markets in the United States for federal contracting, cybersecurity, software, analytics, and professional services. It is a high-cost market, but the concentration of customers, contractors, technical workers, and executive talent can justify the premium for firms that sell into government and enterprise markets.",
    laborAnalysis: "Fairfax's labor market is deep, educated, and highly competitive. Employers can recruit technical, managerial, engineering, security-cleared, consulting, and business development talent at scale. The key challenge is not whether talent exists; it is whether a company can afford, attract, and retain it in a market where workers have many strong alternatives.",
    costAnalysis: "Fairfax is expensive across wages, housing, and many commercial submarkets. Cost-sensitive firms may prefer Prince William, Prince George's, Frederick, or Baltimore County. Fairfax is most compelling when proximity to customers, prime contractors, specialized talent, or Dulles corridor assets produces enough revenue or productivity upside to offset costs.",
    industryAnalysis: "Federal contracting and software are the signature fits. Cybersecurity, AI, analytics, professional services, and enterprise technology also score extremely well. Life sciences is less central than in Montgomery or Frederick, although health technology and data-intensive federal health work can be attractive."
  },
  {
    slug: "arlington-county-va",
    name: "Arlington County",
    state: "Virginia",
    region: "DC / Maryland / Virginia",
    population: 235000,
    laborForce: 170000,
    unemploymentRate: 2.4,
    medianHouseholdIncome: 132400,
    bachelorsOrHigher: 76,
    medianWageEstimate: 91000,
    topIndustries: ["Federal contracting", "Software", "Professional services", "Headquarters"],
    vacancyProxy: 5.6,
    marketAccessScore: 96,
    industryScores: scores(68, 96, 92, 55, 48, 70, 95),
    strengths: ["Dense high-education workforce", "Immediate DC access", "Headquarters and consulting environment", "Transit-rich urban nodes"],
    risks: ["Very high costs", "Limited large-footprint space", "Tight labor market", "Not ideal for industrial or logistics-heavy users"],
    nearby: ["district-of-columbia", "alexandria-city-va", "fairfax-county-va", "montgomery-county-md"],
    summary: "Arlington County is a premium urban-suburban market for headquarters, federal contractors, software firms, consulting practices, and organizations that need immediate access to Washington, DC. It is not the lowest-cost choice, but it is one of the strongest places for high-skill, client-facing, and government-adjacent operations.",
    laborAnalysis: "Arlington's labor force is smaller than Fairfax or Montgomery but exceptionally educated. It is well suited for teams that need policy fluency, technical skill, consulting experience, sales leadership, product talent, and access to decision-makers. Hiring large operational teams may be more difficult, but high-value knowledge roles are a strong match.",
    costAnalysis: "Arlington's cost structure is among the highest in the region. Real estate, wages, and competition for talent can be intense. The county makes sense when proximity, brand, transit access, and talent density create measurable value. It is less attractive for back-office, logistics, manufacturing, or large-footprint cost-sensitive expansion.",
    industryAnalysis: "Federal contracting, software, AI, consulting, professional services, headquarters, and public-sector strategy firms are the best fits. Healthcare and life sciences can work in administrative or digital-health formats, but space-intensive wet-lab operations are better suited elsewhere."
  },
  {
    slug: "alexandria-city-va",
    name: "Alexandria City",
    state: "Virginia",
    region: "DC / Maryland / Virginia",
    population: 155000,
    laborForce: 101000,
    unemploymentRate: 2.7,
    medianHouseholdIncome: 112200,
    bachelorsOrHigher: 65,
    medianWageEstimate: 76000,
    topIndustries: ["Professional services", "Federal support", "Healthcare", "Associations"],
    vacancyProxy: 4.4,
    marketAccessScore: 90,
    industryScores: scores(62, 86, 80, 58, 50, 76, 88),
    strengths: ["Close-in DC access", "Educated workforce", "Association and professional-services environment", "Strong quality-of-place appeal"],
    risks: ["Small scale", "High costs", "Limited industrial space", "Competition from Arlington, DC, and Fairfax"],
    nearby: ["arlington-county-va", "fairfax-county-va", "district-of-columbia", "prince-georges-county-md"],
    summary: "Alexandria City is a close-in professional services and federal support market with strong access to Washington, DC, Arlington, and Northern Virginia. It is best for smaller high-value teams, associations, consulting practices, health administration, and firms that value proximity and quality of place over large-scale expansion economics.",
    laborAnalysis: "The city's labor force is educated but not large. Employers should view Alexandria as part of a broader regional labor market rather than a self-contained hiring pool. It performs well for professional, administrative, policy, client-service, and specialized teams. It is less suitable for employers needing hundreds of lower-cost workers on-site.",
    costAnalysis: "Alexandria is a premium location. Costs are high relative to outer counties, and available space may not match every use. The value case is strongest for organizations that need client access, executive convenience, transit, and a polished location rather than maximum cost efficiency.",
    industryAnalysis: "Professional services, associations, federal support, healthcare administration, and selected software or consulting firms are good fits. Logistics, manufacturing, and lab-intensive life sciences are weaker because the city lacks the space and cost structure those uses often need."
  },
  {
    slug: "loudoun-county-va",
    name: "Loudoun County",
    state: "Virginia",
    region: "DC / Maryland / Virginia",
    population: 448000,
    laborForce: 252000,
    unemploymentRate: 2.5,
    medianHouseholdIncome: 170300,
    bachelorsOrHigher: 59,
    medianWageEstimate: 88000,
    topIndustries: ["Data centers", "Software infrastructure", "Federal contracting", "Logistics"],
    vacancyProxy: 3.9,
    marketAccessScore: 88,
    industryScores: scores(66, 91, 91, 82, 74, 67, 82),
    strengths: ["Data-center and cloud infrastructure concentration", "Dulles access", "High-income workforce", "Fast-growing business base"],
    risks: ["Very high income and housing costs", "Infrastructure and land-use constraints", "Tight labor market", "Community concerns around data-center growth"],
    nearby: ["fairfax-county-va", "prince-william-county-va", "frederick-county-md", "montgomery-county-md"],
    summary: "Loudoun County is a strong expansion market for cloud infrastructure, software infrastructure, data-related services, federal contractors, and companies that benefit from Dulles corridor access. It is wealthy, fast-growing, and infrastructure-rich, but also increasingly expensive and constrained.",
    laborAnalysis: "Loudoun's labor market combines affluent residents, technical workers, and access to the broader Northern Virginia corridor. It is good for engineering, infrastructure operations, management, and federal-adjacent technology roles. Employers should expect competition for talent and should not assume lower costs simply because the county is farther from DC.",
    costAnalysis: "Loudoun is not a low-cost alternative anymore. High household incomes and strong growth indicate purchasing power but also wage and housing pressure. Companies choosing Loudoun should have a clear reason, such as data infrastructure, Dulles access, Northern Virginia customers, or specific real estate requirements.",
    industryAnalysis: "Software infrastructure, federal contracting, cloud operations, and logistics are strong fits. Advanced manufacturing can work in selected sites. Life sciences is possible but less central than Montgomery or Frederick."
  },
  {
    slug: "prince-william-county-va",
    name: "Prince William County",
    state: "Virginia",
    region: "DC / Maryland / Virginia",
    population: 493000,
    laborForce: 274000,
    unemploymentRate: 3.0,
    medianHouseholdIncome: 121200,
    bachelorsOrHigher: 42,
    medianWageEstimate: 63000,
    topIndustries: ["Logistics", "Construction", "Federal support", "Advanced manufacturing"],
    vacancyProxy: 5.0,
    marketAccessScore: 82,
    industryScores: scores(59, 77, 68, 88, 80, 70, 69),
    strengths: ["More cost-flexible Northern Virginia option", "Large and growing workforce", "Industrial and data-related site potential", "Access to DC and Dulles corridor"],
    risks: ["Commute congestion", "Educational attainment lower than Fairfax or Arlington", "Submarket selection is important", "Competition from Loudoun and Stafford/Fredericksburg corridor"],
    nearby: ["fairfax-county-va", "loudoun-county-va", "alexandria-city-va", "district-of-columbia"],
    summary: "Prince William County is one of the region's better options for companies that want Northern Virginia access with more cost flexibility than Fairfax, Arlington, or Loudoun. It is well suited for logistics, construction-related firms, public-sector support, selected manufacturing, and operations that need workforce scale.",
    laborAnalysis: "The county has a sizable and growing labor force. It is attractive for operational, logistics, construction, administrative, public-sector support, and middle-skill technical roles. Companies needing elite software or security-cleared talent can still recruit regionally, but may need to compete with Fairfax, Loudoun, Arlington, and DC employers.",
    costAnalysis: "Prince William's advantage is relative affordability inside the Northern Virginia orbit. It can support larger facilities and teams that would be harder to justify in higher-cost counties. However, transportation and commute considerations are essential, especially for operations requiring predictable shift coverage.",
    industryAnalysis: "Logistics, construction, advanced manufacturing, federal support, and data-related infrastructure are the strongest fits. Software and professional services can work for cost-sensitive teams, while life sciences is less natural unless tied to specific facilities or regional partnerships."
  },
  {
    slug: "district-of-columbia",
    name: "District of Columbia",
    state: "District of Columbia",
    region: "DC / Maryland / Virginia",
    population: 679000,
    laborForce: 389000,
    unemploymentRate: 5.2,
    medianHouseholdIncome: 108200,
    bachelorsOrHigher: 64,
    medianWageEstimate: 88000,
    topIndustries: ["Federal government", "Professional services", "Policy", "Hospitality"],
    vacancyProxy: 6.4,
    marketAccessScore: 99,
    industryScores: scores(64, 94, 86, 52, 40, 78, 96),
    strengths: ["Unmatched federal and policy access", "Dense professional ecosystem", "High education levels", "Strong brand for public affairs and advisory firms"],
    risks: ["High costs", "Limited industrial suitability", "Public-sector exposure", "Neighborhood and office-market variation"],
    nearby: ["arlington-county-va", "alexandria-city-va", "montgomery-county-md", "prince-georges-county-md"],
    summary: "The District of Columbia is the region's central market for federal access, policy, advocacy, consulting, associations, professional services, and headquarters functions. It is expensive and not ideal for every use, but for companies whose customers, regulators, partners, or talent are tied to the capital, DC offers unmatched proximity.",
    laborAnalysis: "DC's labor force is highly educated and deeply connected to public-sector, legal, policy, nonprofit, consulting, media, and professional-services work. Employers can hire strong knowledge workers, but compensation expectations and competition are high. Operational hiring is possible but varies sharply by occupation and neighborhood.",
    costAnalysis: "DC's cost profile requires a clear strategic reason. Office users may find opportunities in a changing market, but wages, housing, and operating expenses remain high. The city is most compelling when access to federal decision-making, clients, institutions, or urban talent produces enough value to offset costs.",
    industryAnalysis: "Federal contracting, public affairs, consulting, associations, professional services, software tied to civic or government markets, and healthcare administration are strong fits. Logistics, manufacturing, and large-footprint operations are weak fits because of land, cost, and operational constraints."
  }
];

type ExpandedCountyConfig = {
  slug: string;
  name: string;
  state: string;
  region: string;
  population: number;
  laborForce: number;
  unemploymentRate: number;
  medianHouseholdIncome: number;
  bachelorsOrHigher: number;
  medianWageEstimate: number;
  topIndustries: string[];
  marketAccessScore: number;
  industryScores: Record<IndustryKey, number>;
  strengths: string[];
  risks: string[];
  nearby: string[];
  role: string;
  costPosition: string;
};

function buildExpandedCounty(config: ExpandedCountyConfig): County {
  const topIndustryText = config.topIndustries.slice(0, 3).join(", ");
  return {
    ...config,
    vacancyProxy: Math.max(3.2, Math.min(7.8, 8 - config.unemploymentRate)),
    strengthDetails: config.strengths.map((title) => ({
      title,
      description: `${title} gives ${config.name} a practical expansion advantage for companies evaluating ${topIndustryText.toLowerCase()} activity.`
    })),
    riskDetails: config.risks.map((title) => ({
      title,
      description: `${title} should be tested with current site availability, occupation-level hiring data, commute patterns, and local permitting conditions.`
    })),
    summary: `${config.name}, ${config.state} is a ${config.role} expansion market with particular relevance for ${topIndustryText.toLowerCase()}. It offers a ${config.costPosition} operating profile relative to larger coastal metros, while still giving companies access to labor, customers, institutions, and transportation corridors that matter for growth. The county is best understood as a screening candidate: its headline score points to opportunity, but the right decision depends on the company's industry, facility needs, hiring plan, customer geography, and tolerance for cost and execution complexity.`,
    laborAnalysis: `${config.name}'s labor market should be evaluated through both scale and fit. A labor force of about ${config.laborForce.toLocaleString("en-US")} gives the county a meaningful workforce base, while an unemployment rate near ${config.unemploymentRate.toFixed(1)}% shows the current balance between labor availability and market tightness. For headquarters, professional services, software, healthcare, logistics, manufacturing, or contracting uses, the key question is whether the county has the specific occupations required rather than simply enough workers overall. Companies should compare local hiring pipelines with nearby counties, regional commute sheds, community colleges, universities, military transition populations, and existing employers. Employers with specialized needs should verify salary expectations, hybrid-work preferences, licensing constraints, shift coverage, and recruiting competition before treating the county as a final labor market.`,
    costAnalysis: `${config.name}'s cost position is best described as ${config.costPosition}. Median household income and wage signals suggest how expensive hiring and retention may be, but they do not replace current commercial real estate review. A company should compare office, lab, industrial, flex, and medical-space availability against the actual operating footprint. Cost-sensitive users should also look at taxes, utilities, insurance, transportation, tenant improvements, parking, and incentives. A higher-cost county can still be the better expansion choice when talent access, customer proximity, speed to market, or ecosystem credibility improves revenue and reduces execution risk. A lower-cost county can outperform when the business needs space, workforce scale, and predictable operations more than elite proximity.`,
    industryAnalysis: `${config.name}'s strongest industry signals are ${topIndustryText.toLowerCase()}. These sectors fit the county because of its workforce profile, regional access, and existing business context. For life sciences, the main questions are specialized labor, lab or production space, research links, and regulatory talent. For federal contracting, companies should test customer access, cleared or clearance-adjacent workers, and teaming partners. For software and AI, the concern is whether technical talent can be recruited at the target compensation level. For logistics and manufacturing, the county must be checked for site control, truck access, utilities, and permitting. The score is a way to prioritize diligence, not a substitute for it.`
  };
}

const expandedCounties: County[] = [
  buildExpandedCounty({ slug: "charles-county-md", name: "Charles County", state: "Maryland", region: "Southern Maryland", population: 170000, laborForce: 88000, unemploymentRate: 4.2, medianHouseholdIncome: 112000, bachelorsOrHigher: 34, medianWageEstimate: 62000, topIndustries: ["Federal support", "Logistics", "Healthcare"], marketAccessScore: 72, industryScores: scores(45, 76, 54, 78, 67, 69, 62), strengths: ["Southern Maryland growth corridor", "DC access with more cost flexibility", "Workforce connection to federal and defense activity", "Room for logistics and operations"], risks: ["Longer commutes to core federal customers", "Less specialized technical depth", "Infrastructure varies by site", "Submarket selection matters"], nearby: ["prince-georges-county-md", "prince-william-county-va", "stafford-county-va"], role: "cost-flexible Southern Maryland", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "harford-county-md", name: "Harford County", state: "Maryland", region: "Northeast Maryland", population: 265000, laborForce: 139000, unemploymentRate: 3.7, medianHouseholdIncome: 105000, bachelorsOrHigher: 35, medianWageEstimate: 61000, topIndustries: ["Defense support", "Advanced manufacturing", "Logistics"], marketAccessScore: 74, industryScores: scores(50, 78, 56, 75, 82, 63, 61), strengths: ["Aberdeen Proving Ground proximity", "I-95 corridor access", "Manufacturing and defense-support fit", "More cost flexibility than inner metros"], risks: ["Specialized labor can be competitive", "Less urban customer density", "Site-by-site infrastructure variation", "Federal exposure risk"], nearby: ["baltimore-county-md", "baltimore-city-md"], role: "defense-adjacent and manufacturing-oriented", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "carroll-county-md", name: "Carroll County", state: "Maryland", region: "Central Maryland", population: 176000, laborForce: 96000, unemploymentRate: 3.5, medianHouseholdIncome: 108000, bachelorsOrHigher: 37, medianWageEstimate: 60000, topIndustries: ["Construction", "Healthcare", "Professional services"], marketAccessScore: 67, industryScores: scores(42, 58, 53, 61, 65, 68, 64), strengths: ["Stable workforce base", "Lower-cost Central Maryland option", "Access to Baltimore and Frederick markets", "Quality-of-life appeal"], risks: ["Limited large-scale office ecosystem", "Smaller labor pool", "Less direct transit access", "Specialized site availability may be limited"], nearby: ["frederick-county-md", "baltimore-county-md", "howard-county-md"], role: "stable Central Maryland", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "washington-county-md", name: "Washington County", state: "Maryland", region: "Western Maryland", population: 155000, laborForce: 76000, unemploymentRate: 4.1, medianHouseholdIncome: 72000, bachelorsOrHigher: 24, medianWageEstimate: 50000, topIndustries: ["Logistics", "Manufacturing", "Healthcare"], marketAccessScore: 70, industryScores: scores(35, 50, 38, 84, 78, 62, 45), strengths: ["I-81 and I-70 logistics access", "Lower operating costs", "Industrial and distribution fit", "Regional workforce availability"], risks: ["Lower education signal", "Distance from coastal customer centers", "Specialized technical recruiting limits", "Growth depends on site execution"], nearby: ["frederick-county-md"], role: "logistics and industrial corridor", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "wicomico-county-md", name: "Wicomico County", state: "Maryland", region: "Eastern Shore", population: 105000, laborForce: 52000, unemploymentRate: 4.4, medianHouseholdIncome: 67000, bachelorsOrHigher: 27, medianWageEstimate: 47000, topIndustries: ["Healthcare", "Food production", "Logistics"], marketAccessScore: 58, industryScores: scores(38, 42, 34, 68, 70, 70, 44), strengths: ["Eastern Shore hub role", "Healthcare and education anchors", "Lower-cost operations", "Food production and logistics fit"], risks: ["Smaller labor pool", "Limited specialized technical depth", "Distance from major metros", "Transportation constraints for some users"], nearby: ["anne-arundel-county-md"], role: "Eastern Shore regional hub", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "queen-annes-county-md", name: "Queen Anne's County", state: "Maryland", region: "Maryland", population: 52000, laborForce: 28500, unemploymentRate: 3.6, medianHouseholdIncome: 104000, bachelorsOrHigher: 36, medianWageEstimate: 59000, topIndustries: ["Logistics", "Healthcare", "Professional services"], marketAccessScore: 66, industryScores: scores(38, 44, 42, 72, 58, 62, 58), strengths: ["Chesapeake Bay bridge corridor", "Access to Annapolis and Eastern Shore markets", "Quality-of-life appeal", "Moderate operating profile"], risks: ["Small labor pool", "Limited specialized industry depth", "Bridge and commute constraints", "Site availability varies"], nearby: ["anne-arundel-county-md", "talbot-county-md", "wicomico-county-md"], role: "Eastern Shore gateway", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "calvert-county-md", name: "Calvert County", state: "Maryland", region: "Maryland", population: 94000, laborForce: 50000, unemploymentRate: 3.8, medianHouseholdIncome: 118000, bachelorsOrHigher: 36, medianWageEstimate: 64000, topIndustries: ["Energy & Infrastructure", "Healthcare", "Federal support"], marketAccessScore: 64, industryScores: scores(38, 62, 42, 52, 60, 64, 56, 54, 50, 78), strengths: ["Southern Maryland workforce connection", "Energy and infrastructure relevance", "High household income signal", "DC-region adjacency"], risks: ["Smaller employment base", "Limited large-scale office ecosystem", "Commute constraints", "Specialized labor can be regional"], nearby: ["charles-county-md", "st-marys-county-md", "prince-georges-county-md"], role: "Southern Maryland infrastructure-adjacent", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "st-marys-county-md", name: "St. Mary's County", state: "Maryland", region: "Maryland", population: 115000, laborForce: 59000, unemploymentRate: 3.6, medianHouseholdIncome: 103000, bachelorsOrHigher: 34, medianWageEstimate: 62000, topIndustries: ["Federal support", "Defense aviation", "Advanced manufacturing"], marketAccessScore: 68, industryScores: scores(42, 86, 52, 56, 78, 58, 60), strengths: ["Patuxent River defense ecosystem", "Aviation and systems workforce", "Federal contracting relevance", "More cost flexibility than inner DC"], risks: ["Distance from DC core", "Customer concentration risk", "Small specialized labor pool", "Site-by-site infrastructure variation"], nearby: ["calvert-county-md", "charles-county-md"], role: "defense aviation and federal-support market", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "talbot-county-md", name: "Talbot County", state: "Maryland", region: "Maryland", population: 38000, laborForce: 19500, unemploymentRate: 3.5, medianHouseholdIncome: 83000, bachelorsOrHigher: 39, medianWageEstimate: 56000, topIndustries: ["Healthcare", "Tourism", "Professional services"], marketAccessScore: 55, industryScores: scores(36, 36, 38, 48, 42, 68, 58), strengths: ["Quality-of-life and visitor economy", "Healthcare and local services base", "Eastern Shore professional niche", "Moderate income signal"], risks: ["Very small labor force", "Limited large-scale expansion fit", "Seasonality", "Distance from major metros"], nearby: ["queen-annes-county-md", "wicomico-county-md"], role: "small Eastern Shore services market", costPosition: "mixed-cost" }),
  buildExpandedCounty({ slug: "stafford-county-va", name: "Stafford County", state: "Virginia", region: "Northern Virginia / Fredericksburg", population: 165000, laborForce: 86000, unemploymentRate: 3.3, medianHouseholdIncome: 123000, bachelorsOrHigher: 37, medianWageEstimate: 68000, topIndustries: ["Federal support", "Logistics", "Professional services"], marketAccessScore: 78, industryScores: scores(45, 82, 58, 76, 69, 62, 66), strengths: ["Northern Virginia access with more space", "Defense and federal workforce connections", "I-95 corridor position", "Growth market dynamics"], risks: ["Commute congestion", "Less mature office ecosystem", "Competition with Fairfax and Prince William", "Infrastructure timing matters"], nearby: ["prince-william-county-va", "spotsylvania-county-va"], role: "growth-corridor Northern Virginia", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "spotsylvania-county-va", name: "Spotsylvania County", state: "Virginia", region: "Fredericksburg Region", population: 148000, laborForce: 76000, unemploymentRate: 3.5, medianHouseholdIncome: 98000, bachelorsOrHigher: 31, medianWageEstimate: 56000, topIndustries: ["Logistics", "Healthcare", "Construction"], marketAccessScore: 72, industryScores: scores(38, 62, 44, 80, 67, 65, 53), strengths: ["I-95 access", "More affordable growth corridor", "Operations and healthcare fit", "Regional workforce growth"], risks: ["Longer distance to DC core", "Specialized labor depth is thinner", "Transportation bottlenecks", "Site readiness varies"], nearby: ["stafford-county-va", "prince-william-county-va"], role: "cost-flexible growth corridor", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "henrico-county-va", name: "Henrico County", state: "Virginia", region: "Richmond Region", population: 340000, laborForce: 180000, unemploymentRate: 3.4, medianHouseholdIncome: 85000, bachelorsOrHigher: 41, medianWageEstimate: 59000, topIndustries: ["Professional services", "Logistics", "Healthcare"], marketAccessScore: 82, industryScores: scores(55, 64, 68, 83, 70, 76, 78), strengths: ["Richmond metro access", "Airport and interstate logistics", "Balanced cost and talent profile", "Healthcare and corporate services base"], risks: ["Competition from Richmond and Chesterfield", "Specialized tech depth varies", "Submarket choice matters", "Wage pressure in high-skill roles"], nearby: ["richmond-city-va", "chesterfield-county-va"], role: "balanced Richmond metro", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "chesterfield-county-va", name: "Chesterfield County", state: "Virginia", region: "Richmond Region", population: 375000, laborForce: 197000, unemploymentRate: 3.4, medianHouseholdIncome: 92000, bachelorsOrHigher: 39, medianWageEstimate: 58000, topIndustries: ["Advanced manufacturing", "Logistics", "Healthcare"], marketAccessScore: 80, industryScores: scores(45, 55, 58, 80, 84, 70, 66), strengths: ["Manufacturing and industrial fit", "Richmond metro labor access", "Cost-flexible compared with larger metros", "Strong growth corridor"], risks: ["Specialized corporate talent competition", "Infrastructure varies by site", "Less federal customer proximity", "Workforce fit depends on occupation"], nearby: ["richmond-city-va", "henrico-county-va"], role: "industrial and operations-focused Richmond metro", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "richmond-city-va", name: "Richmond City", state: "Virginia", region: "Richmond Region", population: 230000, laborForce: 125000, unemploymentRate: 4.0, medianHouseholdIncome: 65000, bachelorsOrHigher: 43, medianWageEstimate: 61000, topIndustries: ["Professional services", "Finance", "Healthcare"], marketAccessScore: 86, industryScores: scores(52, 58, 72, 62, 50, 77, 86), strengths: ["Urban talent and institutions", "Finance and professional services base", "Healthcare and university anchors", "Strong regional brand"], risks: ["Neighborhood variation", "Parking and site constraints", "Higher urban execution complexity", "Industrial users may prefer suburbs"], nearby: ["henrico-county-va", "chesterfield-county-va"], role: "urban professional-services hub", costPosition: "mixed-cost" }),
  buildExpandedCounty({ slug: "virginia-beach-city-va", name: "Virginia Beach City", state: "Virginia", region: "Hampton Roads", population: 455000, laborForce: 242000, unemploymentRate: 3.2, medianHouseholdIncome: 89000, bachelorsOrHigher: 38, medianWageEstimate: 57000, topIndustries: ["Defense support", "Healthcare", "Professional services"], marketAccessScore: 78, industryScores: scores(42, 82, 55, 65, 58, 75, 70), strengths: ["Military and defense ecosystem", "Large coastal workforce", "Quality-of-life recruiting appeal", "Healthcare and services base"], risks: ["Coastal risk and insurance considerations", "Less direct access to DC customers", "Tourism seasonality in some labor segments", "Specialized site needs vary"], nearby: ["norfolk-city-va"], role: "defense and coastal services market", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "norfolk-city-va", name: "Norfolk City", state: "Virginia", region: "Hampton Roads", population: 235000, laborForce: 116000, unemploymentRate: 4.1, medianHouseholdIncome: 61000, bachelorsOrHigher: 31, medianWageEstimate: 52000, topIndustries: ["Defense support", "Logistics", "Healthcare"], marketAccessScore: 80, industryScores: scores(38, 84, 44, 82, 62, 72, 58), strengths: ["Port and Navy ecosystem", "Logistics and maritime fit", "Healthcare and institutional anchors", "Lower relative cost"], risks: ["Coastal resilience concerns", "Urban poverty and neighborhood variation", "Specialized white-collar depth varies", "Site constraints for some users"], nearby: ["virginia-beach-city-va"], role: "port and defense logistics hub", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "albemarle-county-va", name: "Albemarle County", state: "Virginia", region: "Virginia", population: 114000, laborForce: 62000, unemploymentRate: 3.2, medianHouseholdIncome: 93000, bachelorsOrHigher: 55, medianWageEstimate: 64000, topIndustries: ["Education & Research", "Healthcare", "Professional services"], marketAccessScore: 70, industryScores: scores(62, 44, 68, 46, 48, 72, 76, 90, 64, 48), strengths: ["University of Virginia proximity", "High education signal", "Healthcare and research anchors", "Quality-of-life recruiting appeal"], risks: ["Smaller labor pool", "Housing and cost pressure", "Limited industrial fit", "Specialized site constraints"], nearby: ["charlottesville-city-va", "richmond-city-va"], role: "university-adjacent research market", costPosition: "higher-cost" }),
  buildExpandedCounty({ slug: "roanoke-county-va", name: "Roanoke County", state: "Virginia", region: "Virginia", population: 97000, laborForce: 50500, unemploymentRate: 3.4, medianHouseholdIncome: 76000, bachelorsOrHigher: 36, medianWageEstimate: 53000, topIndustries: ["Healthcare", "Logistics", "Advanced manufacturing"], marketAccessScore: 66, industryScores: scores(40, 38, 42, 70, 72, 76, 56), strengths: ["Roanoke regional labor access", "Healthcare and logistics fit", "Lower cost than coastal metros", "Mountain region quality-of-life appeal"], risks: ["Smaller specialized talent base", "Less direct customer density", "Limited elite tech ecosystem", "Site-specific diligence needed"], nearby: ["roanoke-city-va"], role: "regional healthcare and operations market", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "roanoke-city-va", name: "Roanoke City", state: "Virginia", region: "Virginia", population: 100000, laborForce: 52000, unemploymentRate: 4.1, medianHouseholdIncome: 56000, bachelorsOrHigher: 32, medianWageEstimate: 50000, topIndustries: ["Healthcare", "Logistics", "Professional services"], marketAccessScore: 68, industryScores: scores(42, 40, 46, 72, 60, 82, 62), strengths: ["Healthcare anchor institutions", "Regional services hub", "Lower operating costs", "Transportation corridor access"], risks: ["Urban poverty variation", "Smaller high-skill pool", "Less coastal customer access", "Perception and site selection matter"], nearby: ["roanoke-county-va"], role: "regional urban services hub", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "charlottesville-city-va", name: "Charlottesville City", state: "Virginia", region: "Virginia", population: 46000, laborForce: 27000, unemploymentRate: 3.3, medianHouseholdIncome: 67000, bachelorsOrHigher: 58, medianWageEstimate: 62000, topIndustries: ["Education & Research", "Healthcare", "Software & AI"], marketAccessScore: 69, industryScores: scores(66, 42, 78, 40, 44, 74, 76, 92, 62, 42), strengths: ["University and medical anchors", "High education concentration", "Startup and research relevance", "Quality-of-life brand"], risks: ["Small labor force", "High housing pressure", "Limited large-site inventory", "Urban constraints"], nearby: ["albemarle-county-va", "richmond-city-va"], role: "small university innovation market", costPosition: "higher-cost" }),
  buildExpandedCounty({ slug: "frederick-county-va", name: "Frederick County", state: "Virginia", region: "Virginia", population: 93000, laborForce: 50000, unemploymentRate: 3.2, medianHouseholdIncome: 87000, bachelorsOrHigher: 31, medianWageEstimate: 54000, topIndustries: ["Logistics", "Manufacturing", "Professional services"], marketAccessScore: 73, industryScores: scores(36, 50, 44, 82, 76, 56, 58), strengths: ["I-81 corridor access", "Northern Shenandoah growth", "Cost-flexible operations", "Manufacturing and logistics fit"], risks: ["Smaller specialized labor pool", "Distance from DC core", "Infrastructure varies by site", "Education signal is moderate"], nearby: ["winchester-city-va", "loudoun-county-va"], role: "Shenandoah logistics and operations corridor", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "winchester-city-va", name: "Winchester City", state: "Virginia", region: "Virginia", population: 28500, laborForce: 15500, unemploymentRate: 3.5, medianHouseholdIncome: 64000, bachelorsOrHigher: 30, medianWageEstimate: 50000, topIndustries: ["Healthcare", "Logistics", "Professional services"], marketAccessScore: 70, industryScores: scores(34, 42, 42, 72, 58, 70, 58), strengths: ["Northern Shenandoah service hub", "I-81 corridor access", "Lower-cost operations", "Healthcare and local services base"], risks: ["Small city labor base", "Limited specialized depth", "Site scale constraints", "Regional rather than national customer access"], nearby: ["frederick-county-va", "loudoun-county-va"], role: "small regional corridor hub", costPosition: "lower-cost" }),
  buildExpandedCounty({ slug: "philadelphia-county-pa", name: "Philadelphia County", state: "Pennsylvania", region: "Pennsylvania / Delaware / New Jersey", population: 1550000, laborForce: 735000, unemploymentRate: 5.0, medianHouseholdIncome: 65000, bachelorsOrHigher: 36, medianWageEstimate: 61000, topIndustries: ["Healthcare", "Life sciences", "Professional services"], marketAccessScore: 95, industryScores: scores(90, 58, 74, 72, 55, 94, 88), strengths: ["Major metro labor scale", "University and hospital anchors", "Life sciences and healthcare ecosystem", "Northeast corridor access"], risks: ["Urban cost and execution complexity", "Neighborhood variation", "Higher unemployment in some labor segments", "Permitting and site constraints"], nearby: ["delaware-county-pa", "camden-county-nj", "new-castle-county-de"], role: "large Northeast metro", costPosition: "mixed-cost" }),
  buildExpandedCounty({ slug: "delaware-county-pa", name: "Delaware County", state: "Pennsylvania", region: "Pennsylvania / Delaware / New Jersey", population: 575000, laborForce: 305000, unemploymentRate: 3.8, medianHouseholdIncome: 86000, bachelorsOrHigher: 39, medianWageEstimate: 61000, topIndustries: ["Healthcare", "Logistics", "Professional services"], marketAccessScore: 88, industryScores: scores(62, 50, 58, 82, 58, 82, 72), strengths: ["Philadelphia access", "Airport and corridor logistics", "Healthcare and suburban workforce base", "Balanced cost profile"], risks: ["Dense suburban site constraints", "Competition with Philadelphia", "Industrial availability varies", "Commuting patterns are complex"], nearby: ["philadelphia-county-pa", "new-castle-county-de", "montgomery-county-pa"], role: "Philadelphia-adjacent suburban", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "montgomery-county-pa", name: "Montgomery County", state: "Pennsylvania", region: "Pennsylvania / Delaware / New Jersey", population: 865000, laborForce: 468000, unemploymentRate: 3.4, medianHouseholdIncome: 111000, bachelorsOrHigher: 52, medianWageEstimate: 70000, topIndustries: ["Life sciences", "Professional services", "Healthcare"], marketAccessScore: 90, industryScores: scores(88, 54, 76, 68, 62, 82, 86), strengths: ["High-talent suburban workforce", "Life sciences and pharma corridor", "Philadelphia market access", "Strong income and customer base"], risks: ["Higher cost profile", "Competitive specialized hiring", "Site constraints in mature suburbs", "Less industrial flexibility"], nearby: ["philadelphia-county-pa", "bucks-county-pa", "delaware-county-pa"], role: "high-talent Philadelphia suburban", costPosition: "higher-cost" }),
  buildExpandedCounty({ slug: "bucks-county-pa", name: "Bucks County", state: "Pennsylvania", region: "Pennsylvania / Delaware / New Jersey", population: 650000, laborForce: 348000, unemploymentRate: 3.5, medianHouseholdIncome: 104000, bachelorsOrHigher: 43, medianWageEstimate: 65000, topIndustries: ["Manufacturing", "Healthcare", "Professional services"], marketAccessScore: 86, industryScores: scores(62, 46, 58, 72, 76, 74, 70), strengths: ["Northeast corridor position", "Suburban workforce quality", "Manufacturing and services mix", "Access to Philadelphia and New Jersey"], risks: ["High housing and wage pressure", "Fragmented submarkets", "Less urban density", "Site availability can be limited"], nearby: ["montgomery-county-pa", "mercer-county-nj", "philadelphia-county-pa"], role: "Northeast corridor suburban", costPosition: "higher-cost" }),
  buildExpandedCounty({ slug: "new-castle-county-de", name: "New Castle County", state: "Delaware", region: "Pennsylvania / Delaware / New Jersey", population: 575000, laborForce: 295000, unemploymentRate: 4.0, medianHouseholdIncome: 84000, bachelorsOrHigher: 37, medianWageEstimate: 59000, topIndustries: ["Finance", "Logistics", "Life sciences"], marketAccessScore: 86, industryScores: scores(72, 48, 62, 82, 65, 70, 80), strengths: ["I-95 corridor and port access", "Delaware business climate", "Finance and corporate services base", "Lower cost than Philadelphia suburbs"], risks: ["Smaller specialized labor pool than major metros", "Competition from Philadelphia region", "Submarket variation", "Industry concentration risk"], nearby: ["delaware-county-pa", "philadelphia-county-pa", "camden-county-nj"], role: "Delaware corporate and logistics corridor", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "camden-county-nj", name: "Camden County", state: "New Jersey", region: "Pennsylvania / Delaware / New Jersey", population: 525000, laborForce: 270000, unemploymentRate: 4.6, medianHouseholdIncome: 82000, bachelorsOrHigher: 34, medianWageEstimate: 57000, topIndustries: ["Healthcare", "Logistics", "Professional services"], marketAccessScore: 84, industryScores: scores(58, 44, 52, 78, 58, 78, 68), strengths: ["Philadelphia access", "Healthcare anchors", "More cost flexibility than many NJ markets", "Logistics and redevelopment potential"], risks: ["Municipal variation is significant", "Perception and site diligence matter", "Specialized labor competition", "Regulatory complexity"], nearby: ["philadelphia-county-pa", "new-castle-county-de", "mercer-county-nj"], role: "Philadelphia-adjacent New Jersey", costPosition: "moderate-cost" }),
  buildExpandedCounty({ slug: "mercer-county-nj", name: "Mercer County", state: "New Jersey", region: "Pennsylvania / Delaware / New Jersey", population: 385000, laborForce: 205000, unemploymentRate: 3.8, medianHouseholdIncome: 97000, bachelorsOrHigher: 45, medianWageEstimate: 68000, topIndustries: ["Professional services", "Life sciences", "Government"], marketAccessScore: 88, industryScores: scores(80, 60, 72, 62, 58, 76, 84), strengths: ["Princeton and state-government anchors", "High education signal", "Northeast corridor access", "Professional and research ecosystem"], risks: ["Higher cost profile", "Limited industrial flexibility", "Competition from NYC and Philadelphia regions", "Specialized real estate constraints"], nearby: ["bucks-county-pa", "camden-county-nj", "montgomery-county-pa"], role: "research and professional-services corridor", costPosition: "higher-cost" }),
  buildExpandedCounty({ slug: "wake-county-nc", name: "Wake County", state: "North Carolina", region: "North Carolina", population: 1180000, laborForce: 675000, unemploymentRate: 3.4, medianHouseholdIncome: 97000, bachelorsOrHigher: 55, medianWageEstimate: 67000, topIndustries: ["Software & AI", "Life sciences", "Professional services"], marketAccessScore: 92, industryScores: scores(88, 52, 92, 70, 72, 82, 88), strengths: ["Research Triangle talent depth", "High-growth software and life sciences ecosystem", "Strong education signal", "Business-friendly expansion reputation"], risks: ["Rising costs and housing pressure", "Competitive technical hiring", "Infrastructure strain in growth corridors", "Submarket choice matters"], nearby: ["durham-county-nc", "mecklenburg-county-nc", "guilford-county-nc"], role: "high-growth Research Triangle", costPosition: "increasing-cost" }),
  buildExpandedCounty({ slug: "durham-county-nc", name: "Durham County", state: "North Carolina", region: "North Carolina", population: 335000, laborForce: 185000, unemploymentRate: 3.6, medianHouseholdIncome: 82000, bachelorsOrHigher: 52, medianWageEstimate: 64000, topIndustries: ["Life sciences", "Software & AI", "Healthcare"], marketAccessScore: 90, industryScores: scores(94, 48, 86, 58, 65, 84, 78), strengths: ["Duke and Research Triangle anchors", "Life sciences and startup ecosystem", "High education signal", "Strong innovation brand"], risks: ["Rising cost pressure", "Smaller labor force than Wake", "Lab and office submarket competition", "Equity and neighborhood variation"], nearby: ["wake-county-nc", "guilford-county-nc"], role: "innovation and life-sciences hub", costPosition: "increasing-cost" }),
  buildExpandedCounty({ slug: "mecklenburg-county-nc", name: "Mecklenburg County", state: "North Carolina", region: "North Carolina", population: 1170000, laborForce: 680000, unemploymentRate: 3.7, medianHouseholdIncome: 85000, bachelorsOrHigher: 45, medianWageEstimate: 62000, topIndustries: ["Finance", "Software & AI", "Logistics"], marketAccessScore: 93, industryScores: scores(58, 52, 86, 86, 70, 76, 90), strengths: ["Charlotte metro scale", "Finance and corporate services base", "Airport and logistics access", "Large workforce"], risks: ["Growth-driven congestion", "Rising labor costs", "Competition for technical talent", "Submarket cost variation"], nearby: ["wake-county-nc", "guilford-county-nc"], role: "large Sun Belt corporate metro", costPosition: "moderate-to-increasing-cost" }),
  buildExpandedCounty({ slug: "guilford-county-nc", name: "Guilford County", state: "North Carolina", region: "North Carolina", population: 550000, laborForce: 285000, unemploymentRate: 4.0, medianHouseholdIncome: 64000, bachelorsOrHigher: 34, medianWageEstimate: 51000, topIndustries: ["Advanced manufacturing", "Logistics", "Healthcare"], marketAccessScore: 82, industryScores: scores(42, 40, 48, 88, 86, 72, 58), strengths: ["Piedmont Triad logistics position", "Manufacturing workforce base", "Lower cost than Raleigh or Charlotte", "Regional airport and interstate access"], risks: ["Lower education signal", "Less elite software talent depth", "Wage advantages must be balanced with skills", "Growth narrative is less flashy"], nearby: ["wake-county-nc", "durham-county-nc", "mecklenburg-county-nc"], role: "cost-competitive logistics and manufacturing market", costPosition: "lower-cost" })
];

function buildRegistryBackfillCounty(entry: CountyRegistryEntry): County {
  const profile = getRegionalProfile(entry);
  return buildExpandedCounty({
    slug: entry.slug,
    name: entry.name,
    state: entry.state,
    region: entry.region,
    population: profile.population,
    laborForce: Math.round(profile.population * profile.laborForceRatio),
    unemploymentRate: profile.unemploymentRate,
    medianHouseholdIncome: profile.medianHouseholdIncome,
    bachelorsOrHigher: profile.bachelorsOrHigher,
    medianWageEstimate: profile.medianWageEstimate,
    topIndustries: [...profile.topIndustries],
    marketAccessScore: profile.marketAccessScore,
    industryScores: profile.industryScores,
    strengths: [
      `${entry.metro ?? entry.region} market access`,
      `${profile.topIndustries[0]} expansion relevance`,
      "County-level workforce and customer base",
      "Comparable public-data profile for early screening"
    ],
    risks: [
      "Local submarket conditions need verification",
      "Occupation-level hiring depth may vary",
      "Real estate and infrastructure readiness are site-specific",
      "Public data can lag current business conditions"
    ],
    nearby: [...profile.nearby],
    role: profile.role,
    costPosition: profile.costPosition
  });
}

function getRegionalProfile(entry: CountyRegistryEntry) {
  const profiles = {
    "Northeast Corridor": {
      population: 900000,
      laborForceRatio: 0.53,
      unemploymentRate: 4.0,
      medianHouseholdIncome: 98000,
      bachelorsOrHigher: 47,
      medianWageEstimate: 69000,
      topIndustries: ["Professional services", "Healthcare", "Finance"],
      marketAccessScore: 91,
      industryScores: scores(72, 54, 78, 70, 58, 82, 88, 76, 90, 56),
      nearby: ["new-york-county-ny", "middlesex-county-ma", "philadelphia-county-pa"],
      role: "Northeast corridor knowledge-economy",
      costPosition: "higher-cost"
    },
    "Southeast Growth Markets": {
      population: 950000,
      laborForceRatio: 0.54,
      unemploymentRate: 3.8,
      medianHouseholdIncome: 79000,
      bachelorsOrHigher: 39,
      medianWageEstimate: 57000,
      topIndustries: ["Logistics", "Healthcare", "Professional services"],
      marketAccessScore: 87,
      industryScores: scores(55, 48, 70, 88, 68, 78, 76, 62, 70, 64),
      nearby: ["fulton-county-ga", "orange-county-fl", "hillsborough-county-fl"],
      role: "Sun Belt growth and operations",
      costPosition: "moderate-to-increasing-cost"
    },
    "Texas Triangle": {
      population: 1300000,
      laborForceRatio: 0.55,
      unemploymentRate: 3.9,
      medianHouseholdIncome: 84000,
      bachelorsOrHigher: 40,
      medianWageEstimate: 61000,
      topIndustries: ["Energy & Infrastructure", "Logistics", "Software & AI"],
      marketAccessScore: 90,
      industryScores: scores(58, 50, 84, 88, 76, 74, 82, 62, 78, 92),
      nearby: ["travis-county-tx", "dallas-county-tx", "harris-county-tx"],
      role: "large Texas growth corridor",
      costPosition: "moderate-to-increasing-cost"
    },
    "Mountain West": {
      population: 800000,
      laborForceRatio: 0.55,
      unemploymentRate: 3.7,
      medianHouseholdIncome: 88000,
      bachelorsOrHigher: 44,
      medianWageEstimate: 64000,
      topIndustries: ["Software & AI", "Professional services", "Logistics"],
      marketAccessScore: 84,
      industryScores: scores(62, 48, 86, 78, 70, 72, 82, 66, 74, 70),
      nearby: ["denver-county-co", "maricopa-county-az", "pima-county-az"],
      role: "Mountain West talent and growth",
      costPosition: "moderate-to-increasing-cost"
    },
    "West Coast": {
      population: 1500000,
      laborForceRatio: 0.54,
      unemploymentRate: 4.1,
      medianHouseholdIncome: 105000,
      bachelorsOrHigher: 49,
      medianWageEstimate: 76000,
      topIndustries: ["Software & AI", "Life sciences", "Logistics"],
      marketAccessScore: 92,
      industryScores: scores(84, 46, 94, 80, 72, 80, 86, 78, 82, 66),
      nearby: ["santa-clara-county-ca", "king-county-wa", "los-angeles-county-ca"],
      role: "West Coast innovation and trade",
      costPosition: "higher-cost"
    },
    "Great Lakes / Midwest": {
      population: 900000,
      laborForceRatio: 0.52,
      unemploymentRate: 4.2,
      medianHouseholdIncome: 76000,
      bachelorsOrHigher: 37,
      medianWageEstimate: 56000,
      topIndustries: ["Advanced manufacturing", "Logistics", "Healthcare"],
      marketAccessScore: 84,
      industryScores: scores(50, 44, 62, 84, 90, 76, 68, 58, 70, 72),
      nearby: ["cook-county-il", "wayne-county-mi", "franklin-county-oh"],
      role: "Midwest industrial and services",
      costPosition: "moderate-cost"
    }
  } as const;
  return profiles[entry.region as keyof typeof profiles] ?? {
    population: 450000,
    laborForceRatio: 0.53,
    unemploymentRate: 3.8,
    medianHouseholdIncome: 85000,
    bachelorsOrHigher: 40,
    medianWageEstimate: 60000,
    topIndustries: ["Healthcare", "Professional services", "Logistics"],
    marketAccessScore: 78,
    industryScores: scores(55, 58, 64, 72, 66, 74, 76),
    nearby: ["montgomery-county-md", "fairfax-county-va", "wake-county-nc"],
    role: "general county economy",
    costPosition: "moderate-cost"
  };
}

function withDetailDefaults(county: County): County {
  return {
    ...county,
    strengthDetails: county.strengthDetails ?? county.strengths.map((title) => ({ title, description: `${title} is a meaningful advantage for companies evaluating ${county.name}.` })),
    riskDetails: county.riskDetails ?? county.risks.map((title) => ({ title, description: `${title} should be validated with current source data and site-specific diligence.` }))
  };
}

const configuredSlugs = new Set([...baseCounties, ...expandedCounties].map((county) => county.slug));
const registryBackfillCounties = countyRegistry.filter((entry) => !configuredSlugs.has(entry.slug)).map(buildRegistryBackfillCounty);
const sourceCounties = [...baseCounties, ...expandedCounties, ...registryBackfillCounties].map(withDetailDefaults);

export const counties: County[] = sourceCounties.map((county) => {
  const metrics = publicMetrics[county.slug];
  const registry = countyRegistryBySlug[county.slug];
  return {
    ...county,
    fips: registry?.fips ?? county.fips,
    stateAbbr: registry?.stateAbbr ?? county.stateAbbr,
    region: registry?.region ?? county.region,
    population: metrics?.population ?? county.population,
    laborForce: metrics?.laborForce ?? county.laborForce,
    employed: metrics?.employed ?? county.employed,
    unemployed: metrics?.unemployed ?? county.unemployed,
    unemploymentRate: metrics?.unemploymentRate ?? county.unemploymentRate,
    medianHouseholdIncome: metrics?.medianHouseholdIncome ?? county.medianHouseholdIncome,
    bachelorsOrHigher: metrics?.bachelorsOrHigher ?? county.bachelorsOrHigher,
    povertyRate: metrics?.povertyRate ?? county.povertyRate,
    medianWageEstimate: metrics?.perCapitaPersonalIncome ?? county.medianWageEstimate,
    gdpMillions: metrics?.gdpMillions,
    personalIncomeMillions: metrics?.personalIncomeMillions,
    perCapitaPersonalIncome: metrics?.perCapitaPersonalIncome,
    dataVintage: {
      blsLausPeriod: metrics?.blsLausPeriod,
      censusAcsYear: metrics?.censusAcsYear,
      beaGdpYear: metrics?.beaGdpYear,
      beaIncomeYear: metrics?.beaIncomeYear,
      updatedAt: metrics?.updatedAt
    },
    dataQuality: {
      census: metrics?.population || metrics?.medianHouseholdIncome || metrics?.bachelorsOrHigher ? "real" : "missing",
      blsLaus: metrics?.laborForce || metrics?.unemploymentRate ? "real" : "fallback",
      qcew: "fallback",
      bea: metrics?.gdpMillions || metrics?.personalIncomeMillions ? "real" : "fallback",
      shape: "real"
    }
  };
});
