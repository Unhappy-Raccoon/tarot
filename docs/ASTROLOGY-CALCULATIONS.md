# Natal chart calculation conventions

## Implemented scope

- Tropical zodiac, geocentric positions.
- Ten bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.
- Astronomy Engine performs the astronomical calculations; text interpretation is not part of this module.
- Planetary positions use the ecliptic-of-date coordinate system exposed by Astronomy Engine.
- The engine's own project documentation describes its calculations as designed to be accurate to approximately ±1 arcminute and tested against NOVAS/JPL Horizons. This is not a project-specific validation certificate; PCJ must continue to validate representative birth dates before production.

## Time handling

- The source profile stores local birth date, optional local birth time and IANA timezone separately.
- A unique valid local time is converted to one UTC instant.
- A nonexistent local time during a daylight-saving gap is rejected with a user-facing correction message.
- A repeated local time during a daylight-saving fall-back is treated as ambiguous. Planetary signs are calculated over both possible instants; ASC and houses are omitted.
- If time is missing, the calculation samples the full possible local-day interval. If timezone is also missing, a wider interval covering worldwide civil offsets is used. Only signs stable across that interval are displayed.
- No default noon or guessed time is substituted.

## Angles and houses

- Ascendant requires exact time, timezone and birth latitude/longitude.
- Coordinates are currently entered as decimal latitude/longitude in the birth profile. Automatic city geocoding is deliberately not wired until a provider is selected.
- First house convention: Whole Sign. House 1 is the entire sign containing the Ascendant; following signs form houses 2–12.
- If any required input is absent, houses and Ascendant are null rather than approximated.

## Stored result

- Algorithm version and source-data fingerprint are stored with the chart.
- The chart is recalculated after any birth-profile change or algorithm version change.
- The result records calculation precision and explanatory notes so uncertainty remains visible in the UI.

## Not included yet

- Sidereal zodiac / ayanamsa selection.
- Placidus, Equal, Koch or other house systems.
- Retrograde flags, aspects, nodes, Chiron and Lilith.
- AI-generated chart interpretation.
- Automatic geocoding / timezone inference from place name.


## Daily transits and personal aspects

- Daily transit snapshot uses the tropical geocentric ecliptic longitudes of Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.
- Transit instant is 12:00 local time resolved with the supplied IANA timezone; the exact UTC instant is stored with the snapshot.
- Mercury through Pluto receive a direct/retrograde motion flag based on the signed longitude difference between one day before and one day after the snapshot instant. Sun and Moon are not labeled retrograde.
- Transit-to-natal aspects use only natal placements with exact longitude degrees. Supported major aspects: conjunction (0°, 6° orb), sextile (60°, 3°), square (90°, 4°), trine (120°, 4°), opposition (180°, 6°). The eight closest aspect matches are retained.
- If birth-time precision is date-only or timezone-ambiguous, natal degree aspects are omitted. The transit snapshot remains available.
- AI only interprets the calculated snapshot; it is explicitly instructed not to invent transits, aspects, houses, eclipses or exact events.
- A daily result is stored once per user/local date. The saved record includes timezone and calculation snapshot so history remains reproducible.

## Validation still required before production

The transit implementation has unit tests for timezone boundary handling, local noon, input validation and aspect gating on natal precision. Before production, compare representative dates and retrograde stations against an independent ephemeris reference; the current test suite is an implementation regression suite, not an independent astronomy certification. The astrological text is symbolic self-reflection, not scientifically validated prediction.
