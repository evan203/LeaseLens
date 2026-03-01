#set page(paper: "us-letter", margin: 1.5cm, flipped: true)

#show heading.where(level: 1): it => block(smallcaps(it), below: 1em)
#show heading.where(level: 2): it => block(it, below: 0.8em, above: 1.5em)

= Theme: Social Good and Sustainability
_A framework for transparent renting and tenant empowerment._

== 1. Landlord Details & Management
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Landlord Rating],
  [Overall quality of management and ethics],
  [Average of subcategories],
  [Aggregated User Data],
  [UI Dashboard Ranking],

  [Portfolio Mapping],
  [Scale and entity structure of ownership],
  [Number of units owned; single vs. org],
  [Scraped / Assessor / Self-Report],
  [Color-coded locations; Shell de-masking],

  [Eviction Rates],
  [Frequency of tenant displacement],
  [Eviction filings per year],
  [Public Court Records (e.g., CCAP)],
  [Landlord risk filtering],

  [Code Enforcement],
  [Legal and safety compliance],
  [Violations, missed inspections, complaints],
  [City Databases (e.g., ELAM)],
  [Warning flags on property listings],

  [Security Deposit Withholding],
  [Rate of unreturned or disputed deposits],
  [Percentage of deposit withheld vs. returned],
  [Self-Report / Court Records],
  [Risk percentage metric displayed],
)

== 2. Maintenance Statistics
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Speed of Response],
  [Time taken to address a maintenance request],
  [Hours since maintenance posting],
  [Self-Report],
  [Averages displayed per property],

  [Quality of Work],
  [Durability and longevity of the repair],
  [Time duration until same request is repeated],
  [Self-Report],
  [Longevity / "Band-Aid" metric],

  [Quality of Service],
  [Professionalism and demeanor of staff],
  [Qualitative Likert scale (Niceness vs. Rudeness)],
  [Self-Report],
  [Subjective rating distribution],
)

== 3. Rent Reporting & Financial Transparency
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Rent Control/Stabilization],
  [Protection against rent hikes],
  [Legal stabilization status],
  [City/State Laws (TBD)],
  [Badge on listing],

  [Unexpected Fees],
  [Hidden monthly living costs (e.g., Laundry)],
  [Estimated additional monthly cost in USD],
  [Self-Report],
  [Added to "Real Cost" calculation],

  [Included Utilities],
  [Services bundled in base rent],
  [Checklist: Trash, Water, WiFi, etc.],
  [Self-Report / Lease Uploads],
  [UI amenity checklist],

  [Cost of Utilities],
  [Actual energy/water burden on tenant],
  [12-month average utility calculation],
  [MGE Estimator / TBD],
  [Price integration mapping],

  [Posted vs "Real Cost"],
  [Financial discrepancy in advertising],
  [(Posted Rent + Fees + Utilities) - Posted],
  [Calculated Statistic],
  ["True Cost" bolded dynamically in UI],
)

== 4. Living Conditions & Sustainability
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Energy Efficiency],
  [Building energy footprint and systems],
  [HERS/EPC ratings; Gas vs. Electric],
  [City Records / Self-Report],
  [Green efficiency score],

  [Resource Conservation],
  [Water and waste management],
  [Rate of recycling vs trash; water fixture type],
  [Self-Report / City Data],
  [Green score component],

  [Environmental Health],
  [Indoor living quality],
  [Air quality monitoring; Acoustic transparency],
  [Self-Report (sound ratings)],
  [Wellness badge],

  [Appliance & Furnishing Level],
  [Quality and age of unit amenities],
  [Age of appliances; Dishwasher; In-unit Washer/Dryer],
  [Scraped / Self-Report],
  [Listing tags and filters],

  [Internet Quality],
  [Reliability and speed of provided network],
  [Reported download/upload speeds],
  [Self-Report],
  [Speed rating overlay],
)

== 5. Mobility & Neighborhood Context
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Walk-Ability Score],
  [Proximity to essentials (pharmacy, grocery, gym, campus)],
  [Distance in miles to key POIs],
  [Geospatial API / Bare-bones Walkscore],
  [Color gradient map of distances],

  [Public Transportation Score],
  [Access to public transit],
  [Distance to bus lines + Average wait time (min)],
  [Transit Authority (e.g., Madison Metro)],
  [Map symbols for wait times],

  [Neighborhood Statistics],
  [Economic and utility access distribution],
  [By price; "undervalued"; "underserved" zones],
  [City Indicators],
  [Map overlays and neighborhood hubs],
)

== 6. Tenant Advocacy & Action
#table(
  columns: (1fr, 1.5fr, 1.2fr, 1.2fr, 1.5fr),
  inset: 8pt,
  align: horizon,
  table.header([*Factor*], [*Operationalized Definition*], [*Measurement*], [*Data Source*], [*Implementation*]),
  [Lease Stipulations],
  [Obscure, non-standard, or hidden legal clauses],
  [Presence of unexpected addendums],
  [Uploaded Leases],
  [AI wrapper for automated lease scanning],

  [Renter Strike / Union],
  [Collective bargaining and coordination],
  [Anonymous polling; Building-wide communication],
  [User Interactions],
  [Encrypted tenant DAO / portal],

  [Data Privacy],
  [Smart-home data collection by property],
  [What data the landlord collects (locks, thermostats)],
  [Lease Analysis / Self-Report],
  [Privacy transparency rating],
)
