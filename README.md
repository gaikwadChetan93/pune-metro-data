# Pune Metro Guide: public data

The metro data used by the Pune Metro Guide app (Purple, Aqua and Pink lines): stations and their opening status, official fare charts, timings and service updates.

The app ships with a copy of this data and works offline. When online, it checks `manifest.json` here about twice a day. It downloads a newer dataset only if:

- the manifest `version` is newer than the one the app has,
- both files match the SHA-256 checksums in the manifest, and
- the data passes the app's own checks (every station on the map, fare charts complete, every open station reachable).

A download is used from the next time the app opens.

## Files

| File | What it holds |
| --- | --- |
| `manifest.json` | Schema, version, publish date and the checksum of each file |
| `metro.json` | Lines, stations, statuses, timings, operators, official fare charts, sources |
| `updates.json` | Items on the app's Updates tab |
| `privacy.html` | The app's privacy policy, served by GitHub Pages at https://gaikwadchetan93.github.io/pune-metro-data/privacy.html |

## Publishing

Don't edit these files by hand. They're generated from the app repo:

```sh
# in the app repo, after editing tool/build_dataset.py (and bumping VERSION)
python3 tool/build_dataset.py
python3 tool/publish_data.py ../pune-metro-data

# here
git add -A && git commit -m "Data <version>" && git push
```

## Sources

Every fact in `metro.json` names its source (see `sources`), mostly Maha Metro and Puneri Metro. This is an independent, unofficial dataset; it is not affiliated with Maha Metro, Puneri Metro or PMRDA. Fares and timings change, so confirm at the station.
