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
  if (raw === "ATH") return "OAK";
  if (raw === "WAS") return "WSH"; // statsapi uses WSH; Yahoo uses WAS
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

    // Split into per-game chunks. Real structure confirmed via debug endpoint:
    // "Tigers DET 38-50 Rangers TEX 45-43 View game DET -123, O/U 8.5 DSN
    //  Globe Life Field 95 °F ... Starting Pitchers J. Flaherty 1-8 1 W 8 L
    //  4.97 ERA C. Quantrill 3-0 3 W 0 L 3.31 ERA"
    const games = [];
    const abbrList = Object.values(TEAM_NAME_TO_ABBR);
    const nameGroup = Object.keys(TEAM_NAME_TO_ABBR)
      .sort((a, b) => b.length - a.length) // longest first so "Red Sox" beats "Sox" etc
      .join("|");

    const gameRe = new RegExp(
      `(${nameGroup})\\s+(${abbrList.join("|")})\\s+(\\d+-\\d+)\\s+` + // away team + abbr + record
      `(${nameGroup})\\s+(${abbrList.join("|")})\\s+(\\d+-\\d+)\\s+` + // home team + abbr + record
      `View game\\s+([A-Z]{2,4})\\s*(-\\d{2,5}|\\+\\d{2,5}),?\\s*O\\/U\\s*(\\d+(?:\\.\\d+)?)` + // fav ML + total
      `[\\s\\S]{0,120}?(\\d{2,3})\\s*°\\s*F`, // temp (search up to 120 chars ahead for it)
      "g"
    );

    const seen = new Set();
    let m;
    while ((m = gameRe.exec(text)) !== null) {
      const awayAbbr = normalizeAbbr(m[2]);
      const homeAbbr = normalizeAbbr(m[5]);
      const key = `${awayAbbr}@${homeAbbr}`;
      if (seen.has(key)) continue; // Yahoo repeats live games twice in the feed
      seen.add(key);

      games.push({
        awayTeam: awayAbbr,
        homeTeam: homeAbbr,
        favorite: normalizeAbbr(m[7]),
        favoriteML: m[8],
        total: parseFloat(m[9]),
        tempF: parseInt(m[10], 10),
      });
    }


    res.status(200).json({ games, count: games.length, source: "yahoo", fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message, games: [] });
  }
};
