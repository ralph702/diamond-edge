// Vercel serverless function — fetches Yahoo Sports MLB scoreboard server-side
// (no CORS issue since this runs on the server, not the browser) and parses
// team abbr, moneyline favorite, total, and temperature per game.
// Zero cost, zero API key, zero manual entry.

const TEAM_NAME_TO_ABBR = {
  "Pirates": "PIT", "Nationals": "WAS", "Twins": "MIN", "Yankees": "NYY",
  "Tigers": "DET", "Rangers": "TEX", "Blue Jays": "TOR", "Mariners": "SEA",
  "White Sox": "CWS", "Guardians": "CLE", "Orioles": "BAL", "Reds": "CIN",
  "Rays": "TB", "Astros": "HOU", "Mets": "NYM", "Braves": "ATL",
  "Cardinals": "STL", "Cubs": "CHC", "Phillies": "PHI", "Royals": "KC",
  "Giants": "SF", "Rockies": "COL", "Red Sox": "BOS", "Angels": "LAA",
  "Marlins": "MIA", "Athletics": "ATH", "Brewers": "MIL", "Diamondbacks": "ARI",
  "Padres": "SD", "Dodgers": "LAD",
};

function normalizeAbbr(raw) {
  // Yahoo sometimes uses ATH for Athletics; our app's TEAM_IDS uses OAK.
  if (raw === "ATH") return "OAK";
  return raw;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");

  try {
    const r = await fetch("https://sports.yahoo.com/mlb/scoreboard/", {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    });
    if (!r.ok) throw new Error(`Yahoo fetch failed: ${r.status}`);
    const html = await r.text();

    // Strip tags to get flat text, collapse whitespace — Yahoo's game cards
    // render as: TeamName ABBR · record · TeamName ABBR · record · ... 
    // FAV -XXX · O/U XX.X ... venue · XX °F ... pitcher name · W-L · X.XX ERA
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#x27;/g, "'")
      .replace(/\s+/g, " ");

    if (req.query && req.query.debug === "1") {
      res.status(200).json({ textLength: text.length, sample: text.slice(0, 8000) });
      return;
    }

    // Split into per-game chunks using "View game" as a rough delimiter anchor,
    // then look backwards/forwards for the surrounding team/odds/temp info.
    const games = [];
    // Team abbrs used to detect boundaries, e.g. "PiratesPIT" glued together
    const abbrPattern = Object.entries(TEAM_NAME_TO_ABBR)
      .map(([name, abbr]) => `${name}${abbr}`)
      .join("|");
    const chunkRe = new RegExp(
      `(${abbrPattern})[^A-Za-z]*?(\\d+-\\d+)[\\s\\S]{0,40}?(${abbrPattern})[^A-Za-z]*?(\\d+-\\d+)[\\s\\S]{0,600}?(\\d+)\\s*°\\s*F[\\s\\S]{0,200}?([A-Z]{2,4})\\s*(-\\d{2,4}|\\+\\d{2,4})\\s*[·,]?\\s*O\\/U\\s*(\\d+(?:\\.\\d+)?)`,
      "g"
    );

    let m;
    const seen = new Set();
    while ((m = chunkRe.exec(text)) !== null) {
      const awayFull = m[1], homeFull = m[3];
      const awayName = Object.keys(TEAM_NAME_TO_ABBR).find(n => awayFull.startsWith(n));
      const homeName = Object.keys(TEAM_NAME_TO_ABBR).find(n => homeFull.startsWith(n));
      if (!awayName || !homeName) continue;
      const awayAbbr = normalizeAbbr(TEAM_NAME_TO_ABBR[awayName]);
      const homeAbbr = normalizeAbbr(TEAM_NAME_TO_ABBR[homeName]);
      const key = `${awayAbbr}@${homeAbbr}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const favAbbr = normalizeAbbr(m[6]);
      const favML = m[7];
      const total = parseFloat(m[8]);
      const tempF = parseInt(m[5], 10);

      games.push({
        awayTeam: awayAbbr,
        homeTeam: homeAbbr,
        favorite: favAbbr,
        favoriteML: favML,
        total,
        tempF,
      });
    }

    res.status(200).json({ games, count: games.length, source: "yahoo", fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message, games: [] });
  }
};
