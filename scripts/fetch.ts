import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://www.odata.charities.govt.nz'
const OUT_DIR = path.resolve('api')
const PAGE_SIZE = 1000

interface RawCharity {
  OrganisationId: number
  Name: string
  CharityRegistrationNumber: string
  RegistrationStatus: string
  OrganisationalType: string
  DateRegistered: string
  DeregistrationDate: string | null
  WebSiteURL: string | null
  EMailAddress1: string | null
  StreetAddressLine1: string | null
  StreetAddressLine2: string | null
  StreetAddressSuburb: string | null
  StreetAddressCity: string | null
  StreetAddressPostcode: string | null
  PostalAddressLine1: string | null
  PostalAddressCity: string | null
  PostalAddressPostcode: string | null
  NZBNNumber: string | null
  CompaniesOfficeNumber: string | null
  EndOfYearMonth: number | null
  EndOfYearDayofMonth: number | null
  KaupapaMaoriCharity: boolean | null
  PasifikaCharity: boolean | null
  FacebookName: string | null
  TwitterName: string | null
  ModifiedOn: string
}

interface Charity {
  id: number
  registrationNumber: string
  name: string
  status: string
  type: string
  dateRegistered: string
  dateDeregistered: string | null
  website: string | null
  email: string | null
  address: {
    line1: string | null
    line2: string | null
    suburb: string | null
    city: string | null
    postcode: string | null
  }
  nzbn: string | null
  financialYearEnd: string | null
  kaupapaMaori: boolean | null
  pasifika: boolean | null
  social: {
    facebook: string | null
    twitter: string | null
  }
  lastUpdated: string
}

function transform(raw: RawCharity): Charity {
  const month = raw.EndOfYearMonth
  const day = raw.EndOfYearDayofMonth
  return {
    id: raw.OrganisationId,
    registrationNumber: raw.CharityRegistrationNumber,
    name: raw.Name,
    status: raw.RegistrationStatus,
    type: raw.OrganisationalType,
    dateRegistered: raw.DateRegistered,
    dateDeregistered: raw.DeregistrationDate || null,
    website: raw.WebSiteURL || null,
    email: raw.EMailAddress1 || null,
    address: {
      line1: raw.StreetAddressLine1 || null,
      line2: raw.StreetAddressLine2 || null,
      suburb: raw.StreetAddressSuburb || null,
      city: raw.StreetAddressCity || null,
      postcode: raw.StreetAddressPostcode || null,
    },
    nzbn: raw.NZBNNumber || null,
    financialYearEnd: month && day ? `${day}/${month}` : null,
    kaupapaMaori: raw.KaupapaMaoriCharity ?? null,
    pasifika: raw.PasifikaCharity ?? null,
    social: {
      facebook: raw.FacebookName || null,
      twitter: raw.TwitterName || null,
    },
    lastUpdated: raw.ModifiedOn,
  }
}

async function fetchPage(skip: number): Promise<{ records: RawCharity[]; hasMore: boolean }> {
  const url = `${BASE_URL}/Organisations?$top=${PAGE_SIZE}&$skip=${skip}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as { d: RawCharity[] }
  return { records: data.d, hasMore: data.d.length === PAGE_SIZE }
}

async function fetchAll(): Promise<RawCharity[]> {
  const all: RawCharity[] = []
  let skip = 0
  while (true) {
    console.log(`Fetching records ${skip}–${skip + PAGE_SIZE}...`)
    const { records, hasMore } = await fetchPage(skip)
    all.push(...records)
    if (!hasMore) break
    skip += PAGE_SIZE
  }
  return all
}

async function main() {
  const raw = await fetchAll()
  console.log(`\nFetched ${raw.length} charities total`)

  const charities = raw.map(transform)

  fs.mkdirSync(path.join(OUT_DIR, 'charities'), { recursive: true })

  // Full list
  fs.writeFileSync(
    path.join(OUT_DIR, 'charities.json'),
    JSON.stringify({ count: charities.length, charities }, null, 2)
  )
  console.log(`Wrote api/charities.json`)

  // Individual records
  for (const c of charities) {
    fs.writeFileSync(
      path.join(OUT_DIR, 'charities', `${c.registrationNumber}.json`),
      JSON.stringify(c, null, 2)
    )
  }
  console.log(`Wrote ${charities.length} individual records to api/charities/`)

  // Cities index
  const byCity: Record<string, number> = {}
  for (const c of charities) {
    const city = c.address.city || 'Unknown'
    byCity[city] = (byCity[city] ?? 0) + 1
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'cities.json'),
    JSON.stringify({
      cities: Object.entries(byCity).sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count }))
    }, null, 2)
  )
  console.log(`Wrote api/cities.json`)

  // Status index
  const byStatus: Record<string, number> = {}
  for (const c of charities) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'statuses.json'),
    JSON.stringify({ statuses: byStatus }, null, 2)
  )
  console.log(`Wrote api/statuses.json`)

  console.log('\nDone.')
}

main().catch(err => { console.error(err); process.exit(1) })
