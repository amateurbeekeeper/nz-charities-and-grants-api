# nz-charities-api

A free, open, static REST API for every registered charity in New Zealand — all **45,000+** of them.

No auth. No rate limits. No cost. Just JSON.

**Base URL:** `https://amateurbeekeeper.github.io/nz-charities-api`

---

## Endpoints

### All charities
```
GET /api/charities.json
```
Returns all charities with a count.

```json
{
  "count": 45250,
  "charities": [...]
}
```

---

### Single charity by registration number
```
GET /api/charities/{CC_NUMBER}.json
```

```bash
curl https://amateurbeekeeper.github.io/nz-charities-api/api/charities/CC10001.json
```

```json
{
  "id": 12345,
  "registrationNumber": "CC10001",
  "name": "Example Charity Trust",
  "status": "Registered",
  "type": "0",
  "dateRegistered": "2003-01-01T00:00:00Z",
  "dateDeregistered": null,
  "website": "https://example.org.nz",
  "email": null,
  "address": {
    "line1": "123 Main Street",
    "line2": null,
    "suburb": "Ponsonby",
    "city": "Auckland",
    "postcode": "1011"
  },
  "nzbn": "9429000000000",
  "financialYearEnd": "31/3",
  "kaupapaMaori": false,
  "pasifika": false,
  "social": {
    "facebook": null,
    "twitter": null
  },
  "lastUpdated": "2024-06-01T00:00:00Z"
}
```

---

### Charities by city (index)
```
GET /api/cities.json
```

Returns all cities sorted by number of charities.

```json
{
  "cities": [
    { "city": "Auckland", "count": 8201 },
    { "city": "Wellington", "count": 3847 },
    ...
  ]
}
```

---

### Registration statuses
```
GET /api/statuses.json
```

```json
{
  "statuses": {
    "Registered": 28000,
    "Deregistered": 17000
  }
}
```

---

## Data

- **Source:** [Charities Services NZ OData API](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/)
- **Coverage:** All registered and deregistered charities since the register began
- **Fields:** Name, registration number, status, address, website, financial year end, Kaupapa Māori flag, Pasifika flag, NZBN, social media

### Refreshing the data

```bash
npm run fetch
git add api/
git commit -m "Refresh charity data"
git push
```

The fetch script pulls directly from the Charities Services OData API, transforms the data into clean JSON, and writes it to the `api/` folder. Push to `main` and GitHub Pages serves it automatically.

---

## Usage examples

### Fetch a charity in the browser
```
https://amateurbeekeeper.github.io/nz-charities-api/api/charities/CC10001.json
```

### Fetch in JavaScript
```js
const res = await fetch('https://amateurbeekeeper.github.io/nz-charities-api/api/charities/CC10001.json')
const charity = await res.json()
console.log(charity.name)
```

### Search the full list
```js
const res = await fetch('https://amateurbeekeeper.github.io/nz-charities-api/api/charities.json')
const { charities } = await res.json()
const auckland = charities.filter(c => c.address.city === 'Auckland')
```

---

## Stack

- **Data source:** Charities Services NZ OData API
- **Transform:** TypeScript + Node.js
- **Hosting:** GitHub Pages (free, static)

---

## Contributing

PRs welcome. If you want to add more indexes (by region, Kaupapa Māori, Pasifika, etc.) edit `scripts/fetch.ts` and open a PR.

---

## License

Data is sourced from the New Zealand Charities Register and is publicly available under the [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) licence.
