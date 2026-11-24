---
name: nigerian-states
description: Use when an app needs Nigerian locations - a state picker, delivery or shipping zones, address forms, filtering by state or geopolitical zone, or seeding a states table.
---

# Nigerian states and locations

Nigeria has **36 states plus the Federal Capital Territory (FCT)**, 37 in total. Hand-typed lists often miss one, misspell "Nasarawa" or "Akwa Ibom", or give the wrong capital (Lagos State's capital is **Ikeja**, not Lagos).

## Rules

1. **Use a tested list, not one written from memory.** `STATES` in `naija-dev-kit` has all 37, with capital, geopolitical zone and ISO 3166-2 code, and a test that checks the count.
2. **FCT is not a state.** Label pickers "State / FCT" and include it.
3. **Store the ISO code** (`NG-LA`), not the display name, so renames don't break your data.
4. **Group by geopolitical zone** for regional pricing or delivery zones: North Central, North East, North West, South East, South South, South West.

## With naija-dev-kit

```ts
import { findState, STATES, statesInZone } from "naija-dev-kit";

STATES.length;                 // 37
findState("lagos");            // { name: "Lagos", capital: "Ikeja", zone: "South West", iso: "NG-LA" }
findState("FCT")?.capital;     // "Abuja"
findState("NG-RI")?.name;      // "Rivers"
statesInZone("South East").map((s) => s.name); // ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"]
```

## Seeding a database table

```ts
await supabase.from("states").upsert(STATES.map((s) => ({ iso: s.iso, name: s.name, capital: s.capital, zone: s.zone })));
```

## Local government areas (LGAs)

There are **774 LGAs**. This kit doesn't ship them yet, because a wrong or misspelt LGA silently breaks delivery and reporting. If you need them, use an official source (INEC or the National Bureau of Statistics), keep it in one data file, and add a test that checks the total is 774 and each state's count.

## Addresses

Nigerian addresses often lack street numbers or postcodes. Make postcode optional, and add a free-text "landmark / directions" field ("opposite First Bank"). Riders use it.
