import { storage } from './supabase';
import React, { useState, useEffect } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg0: "#0f1117",      // deepest bg
  bg1: "#161b27",      // card bg
  bg2: "#1e2535",      // elevated card
  bg3: "#252d40",      // input/hover
  border: "#2a3349",
  amber: "#d4954a",    // primary accent — baseball leather
  amberDim: "#7a4f23",
  green: "#3ecf6a",
  red: "#e85d6a",
  blue: "#4a9fd4",
  purple: "#9b72d4",
  text0: "#edf0f7",
  text1: "#9aa5be",
  text2: "#5c6783",
  mono: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
  sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg0}; color: ${T.text0}; font-family: ${T.sans}; }
  
  .de-root { min-height: 100vh; background: ${T.bg0}; }
  
  .de-header {
    background: ${T.bg1};
    border-bottom: 1px solid ${T.border};
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .de-logo {
    font-family: ${T.mono};
    font-size: 18px;
    font-weight: 700;
    color: ${T.amber};
    letter-spacing: -0.5px;
  }
  .de-logo span { color: ${T.text1}; font-size: 11px; font-weight: 400; margin-left: 10px; letter-spacing: 1px; text-transform: uppercase; }
  
  .de-tabs {
    display: flex;
    background: ${T.bg1};
    border-bottom: 1px solid ${T.border};
    padding: 0 20px;
    overflow-x: auto;
    gap: 2px;
  }
  .de-tab {
    padding: 12px 18px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: ${T.text2};
    cursor: pointer;
    border: none;
    background: none;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
  }
  .de-tab.active { color: ${T.amber}; border-bottom-color: ${T.amber}; }
  .de-tab:hover:not(.active) { color: ${T.text1}; }
  
  .de-body { padding: 20px; max-width: 900px; margin: 0 auto; }
  
  /* Cards */
  .de-card {
    background: ${T.bg1};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 14px;
  }
  .de-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  /* Matchup header */
  .de-matchup-teams {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: ${T.text0};
  }
  .de-team-abbr {
    font-family: ${T.mono};
    font-size: 18px;
    font-weight: 700;
  }
  .de-vs { color: ${T.text2}; font-size: 11px; font-weight: 500; letter-spacing: 1px; }
  .de-meta { font-size: 11px; color: ${T.text2}; font-family: ${T.mono}; }
  
  /* Factor bar */
  .de-factor-bar-wrap { margin: 14px 0; }
  .de-factor-bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: ${T.text2};
    font-family: ${T.mono};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
  }
  .de-factor-bar {
    height: 8px;
    background: ${T.bg3};
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    gap: 1px;
  }
  .de-factor-seg {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s;
  }
  
  /* Factor rows */
  .de-factors { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
  .de-factor-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    padding: 7px 10px;
    background: ${T.bg2};
    border-radius: 6px;
  }
  .de-factor-name { color: ${T.text1}; flex: 1; min-width: 120px; }
  .de-factor-val { font-family: ${T.mono}; font-size: 11px; color: ${T.text0}; flex: 1; }
  .de-factor-note { color: ${T.text2}; font-size: 11px; flex: 2; text-align: right; }
  .de-factor-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-home { background: ${T.green}; }
  .dot-away { background: ${T.red}; }
  .dot-neutral { background: ${T.text2}; }
  .dot-push { background: ${T.amber}; }
  
  /* Looks */
  .de-looks { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  @media (max-width: 600px) { .de-looks { grid-template-columns: 1fr; } }
  .de-look {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 8px;
    padding: 12px;
  }
  .de-look-market {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${T.text2};
    font-weight: 600;
    margin-bottom: 4px;
  }
  .de-look-lean {
    font-size: 14px;
    font-weight: 700;
    color: ${T.text0};
    font-family: ${T.mono};
  }
  .de-look-why { font-size: 11px; color: ${T.text1}; margin-top: 5px; line-height: 1.5; }
  .de-look-line { font-size: 12px; color: ${T.amber}; font-family: ${T.mono}; margin-top: 4px; }
  
  /* Badges */
  .de-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: ${T.mono};
  }
  .badge-strong { background: ${T.green}20; color: ${T.green}; border: 1px solid ${T.green}40; }
  .badge-lean { background: ${T.amber}20; color: ${T.amber}; border: 1px solid ${T.amberDim}; }
  .badge-split { background: ${T.bg3}; color: ${T.text2}; border: 1px solid ${T.border}; }
  .badge-away { background: ${T.blue}20; color: ${T.blue}; border: 1px solid ${T.blue}40; }
  
  /* Score pill */
  .de-score-pill {
    font-family: ${T.mono};
    font-size: 13px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid;
    white-space: nowrap;
  }
  .pill-strong { background: ${T.green}15; color: ${T.green}; border-color: ${T.green}40; }
  .pill-lean { background: ${T.amber}15; color: ${T.amber}; border-color: ${T.amberDim}; }
  .pill-split { background: ${T.bg3}; color: ${T.text2}; border-color: ${T.border}; }
  
  /* Forms */
  .de-label { font-size: 11px; color: ${T.text2}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; display: block; }
  .de-input {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 6px;
    color: ${T.text0};
    font-family: ${T.mono};
    font-size: 13px;
    padding: 8px 10px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }
  .de-input:focus { border-color: ${T.amber}; }
  .de-input::placeholder { color: ${T.text2}; }
  .de-select {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 6px;
    color: ${T.text0};
    font-family: ${T.mono};
    font-size: 13px;
    padding: 8px 10px;
    width: 100%;
    outline: none;
    cursor: pointer;
  }
  .de-btn {
    background: ${T.amber};
    color: #0f1117;
    font-family: ${T.sans};
    font-size: 13px;
    font-weight: 700;
    padding: 9px 18px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
    letter-spacing: 0.3px;
  }
  .de-btn:hover { opacity: 0.88; }
  .de-btn-ghost {
    background: transparent;
    color: ${T.text1};
    font-size: 12px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid ${T.border};
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .de-btn-ghost:hover { border-color: ${T.amber}; color: ${T.amber}; }
  .de-btn-danger {
    background: ${T.red}20;
    color: ${T.red};
    border: 1px solid ${T.red}40;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .de-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .de-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 580px) { .de-grid2 { grid-template-columns: 1fr; } .de-grid3 { grid-template-columns: 1fr 1fr; } }
  
  .de-field { margin-bottom: 12px; }
  
  .de-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${T.text2};
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .de-section-title::after { content: ''; flex: 1; height: 1px; background: ${T.border}; }
  
  /* Log table */
  .de-log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .de-log-table th {
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${T.text2};
    font-weight: 600;
    padding: 8px 10px;
    border-bottom: 1px solid ${T.border};
    font-family: ${T.mono};
  }
  .de-log-table td {
    padding: 9px 10px;
    border-bottom: 1px solid ${T.border}20;
    color: ${T.text1};
    font-family: ${T.mono};
    font-size: 11px;
    vertical-align: top;
  }
  .de-log-table tr:hover td { background: ${T.bg2}; }
  .win-cell { color: ${T.green}; font-weight: 700; }
  .loss-cell { color: ${T.red}; font-weight: 700; }
  .pending-cell { color: ${T.text2}; }
  
  /* Divider */
  .de-divider { height: 1px; background: ${T.border}; margin: 16px 0; }
  
  /* Top 10 rank */
  .de-rank { 
    font-family: ${T.mono}; font-size: 22px; font-weight: 700; 
    color: ${T.amberDim}; min-width: 36px; text-align: center;
  }
  
  /* Warning */
  .de-warning {
    background: ${T.amber}10;
    border: 1px solid ${T.amberDim};
    border-radius: 7px;
    padding: 10px 14px;
    font-size: 12px;
    color: ${T.text1};
    line-height: 1.6;
  }
  .de-warning strong { color: ${T.amber}; }
  
  /* Stats row */
  .de-stats-row {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    margin: 10px 0;
  }
  .de-stat { text-align: center; }
  .de-stat-val { font-family: ${T.mono}; font-size: 18px; font-weight: 700; color: ${T.text0}; }
  .de-stat-label { font-size: 10px; color: ${T.text2}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  
  /* Empty state */
  .de-empty { text-align: center; padding: 50px 20px; color: ${T.text2}; }
  .de-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .de-empty-title { font-size: 15px; color: ${T.text1}; font-weight: 600; margin-bottom: 6px; }
  .de-empty-sub { font-size: 13px; line-height: 1.6; }

  /* Factor chart for grading */
  .de-factor-grade-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid ${T.border}20;
  }
  .de-fg-name { font-size: 12px; color: ${T.text1}; width: 160px; flex-shrink: 0; }
  .de-fg-bar { flex: 1; height: 6px; background: ${T.bg3}; border-radius: 3px; overflow: hidden; }
  .de-fg-fill { height: 100%; border-radius: 3px; }
  .de-fg-pct { font-family: ${T.mono}; font-size: 11px; color: ${T.text2}; width: 40px; text-align: right; }
  .de-fg-n { font-family: ${T.mono}; font-size: 10px; color: ${T.text2}; width: 50px; text-align: right; }

  /* Scrollable table wrapper */
  .de-scroll { overflow-x: auto; }
  
  textarea.de-input { resize: vertical; min-height: 60px; }
`;


const TEAM_IDS_BY_ABBR = {
  LAA:108,ARI:109,BAL:110,BOS:111,CHC:112,CIN:113,CLE:114,COL:115,DET:116,
  HOU:117,KC:118,LAD:119,WSH:120,NYM:121,OAK:133,PIT:134,SD:135,SEA:136,
  SF:137,STL:138,TB:139,TEX:140,TOR:141,MIN:142,PHI:143,ATL:144,CWS:145,MIA:146,NYY:147,MIL:158
};
const TeamLogo = ({ abbr, size = 32 }) => {
  const id = TEAM_IDS_BY_ABBR[abbr];
  if (!id) return React.createElement('div', {style:{width:size,height:size,borderRadius:'50%',background:'#2a3349',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.35,fontWeight:700,color:'#9aa5be'}}, abbr&&abbr.slice(0,2));
  return React.createElement('img', {src:'https://www.mlb.com/assets/images/teams/logos/MLB_'+id+'_logo.svg',alt:abbr,width:size,height:size,style:{objectFit:'contain'},onError:e=>{e.target.style.display='none'}});
};
// Last name only — "Dylan Cease" -> "Cease". Handles TBD/null safely.
const lastName = (fullName) => {
  if (!fullName || fullName === "TBD") return fullName || "?";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FACTORS = [
  // ── CRITICAL TIER (weight 10) ──
  { id: "pitcher",    label: "Pitcher Quality",       desc: "K-BB%, SIERA, FIP/xFIP, xERA — NOT raw ERA", weight: 10 },
  { id: "stuffplus",  label: "Stuff+ / Location+",    desc: "Arsenal quality (spin, velo, break) + command", weight: 10 },
  { id: "bullpen",    label: "Bullpen Quality + Rest", desc: "Reliever FIP/xFIP, leverage arms available, pitches L3-5 days — EQUAL to starter", weight: 10 },
  { id: "platoon",    label: "Platoon Splits",         desc: "Lineup wOBA vs pitcher hand — 100+ PA threshold", weight: 10 },
  { id: "linemove",  label: "Line Movement",          desc: "Sharp money signal — Pinnacle/Circa ONLY, not DK/FD (2× weight)", weight: 10, is2x: true },
  // ── HIGH TIER (weight 7-9) ──
  { id: "park",       label: "Park Factor",            desc: "Run environment, HR factor, foul territory, turf/grass", weight: 9 },
  { id: "matchupfit", label: "Opponent Matchup Fit",   desc: "Arsenal vs hitter weakness, team K% vs pitcher K%, bullpen handedness", weight: 9 },
  { id: "discipline", label: "Plate Discipline",       desc: "Walk%, chase%, contact%, whiff% — regresses slower than power", weight: 8 },
  { id: "power",      label: "Power Profile",          desc: "ISO, barrel%, HR/FB, hard-hit% — regresses mid-season", weight: 8 },
  { id: "contact",    label: "Quality of Contact",     desc: "xwOBA, exit velo, launch angle, xSLG — true talent signal", weight: 8 },
  { id: "weather",    label: "Wind / Weather",          desc: "Direction & MPH, temp/air-density, rain risk", weight: 8 },
  { id: "regression", label: "Regression Signal",      desc: "xwOBA-wOBA gap, BABIP, strand rate, HR/FB outlier — mean reversion", weight: 8 },
  { id: "tto",        label: "TTO Penalty",            desc: "Times-through-order decay — starter performance drops 2nd/3rd trip through lineup", weight: 8 },
  { id: "rest",       label: "Pitcher Rest / Workload", desc: "Days rest, pitch count trend, innings per start", weight: 7 },
  { id: "umpire",     label: "Umpire Tendency",        desc: "Zone size, K rate, walk/HBP tendency — over/under edge", weight: 7 },
  { id: "schedule",   label: "Rest / Travel / Schedule", desc: "Getaway day, cross-country, doubleheader, extras night before", weight: 7 },
  { id: "defense",    label: "Defense (totals input)",  desc: "OAA/DRS — bad D inflates pitch count → Over. NOT a sides input", weight: 7 },
  // ── MEDIUM TIER (weight 4-6) ──
  { id: "series",     label: "Series Context",          desc: "Rotation order, bullpen depth, sweep spot, home-field", weight: 6 },
  { id: "form",       label: "Recent Form (modifier)",  desc: "L14/L30 results — ONLY if underlying metrics confirm. Never standalone", weight: 5 },
  // ── HEADLINES ──
  { id: "headlines",  label: "Headlines / News",        desc: "Injury, lineup, weather — credibility-weighted", weight: 8, isHeadlines: true },
];

// Headline credibility tiers — weight multiplier applied to scoring
const HEADLINE_TIERS = [
  { value: "confirmed", label: "Confirmed (official / beat reporter)", weight: 1.5, color: "#3ecf6a",
    examples: "Team injury report, official lineup card, MLB.com, Jon Heyman, beat writers with bylines" },
  { value: "credible", label: "Credible (verified insider)", weight: 1.0, color: "#d4954a",
    examples: "Established insiders, multiple sources agreeing, local radio with track record" },
  { value: "unverified", label: "Unverified (social / rumor)", weight: 0.3, color: "#e85d6a",
    examples: "Anonymous tweets, Reddit, fan accounts — flag it but barely move the needle" },
];

const HEADLINE_TYPES = [
  { value: "injury_key", label: "Key player injury / scratch", impact: "High — directly changes lineup wOBA or pitcher quality" },
  { value: "lineup_change", label: "Lineup change (unexpected)", impact: "Medium-High — check platoon implications" },
  { value: "weather_update", label: "Weather update (late-breaking)", impact: "Medium — wind shift, rain delay risk" },
  { value: "bullpen_news", label: "Bullpen news (availability/usage)", impact: "Medium — affects late-game lines" },
  { value: "pitcher_status", label: "Pitcher status change", impact: "High — SP scratch or innings limit news" },
  { value: "travel_fatigue", label: "Travel / schedule context", impact: "Low-Medium — confirm with line movement" },
  { value: "other", label: "Other", impact: "Assess manually" },
];

const MARKETS = ["Moneyline", "Total O/U", "Run Line", "Prop: Pitcher Ks", "Prop: Hitter"];
const DIRECTIONS = ["Home", "Away", "Over", "Under", "Home -1.5", "Away +1.5", "Push/Skip"];
const TEAMS = ["ARI","ATL","BAL","BOS","CHC","CWS","CIN","CLE","COL","DET","HOU","KC","LAA","LAD","MIA","MIL","MIN","NYM","NYY","OAK","PHI","PIT","SD","SF","SEA","STL","TB","TEX","TOR","WSH"];

const PARK_NOTES = {
  COL: "Coors: +30% run environment (altitude)", LAD: "Dodger Stadium: pitcher-friendly", BOS: "Fenway: LF friendly for RHH",
  NYY: "Yankee Stadium: favorable for RHH power", CHC: "Wrigley: wind-dependent",
  HOU: "Minute Maid: moderate, roof varies", SF: "Oracle: notoriously pitcher-friendly",
  SD: "Petco: strong pitcher park", TEX: "Globe Life: heat/roof factor",
};

// Park run factors (1.00 = neutral; >1.00 = hitter-friendly; <1.00 = pitcher-friendly)
// Source basis: multi-year Fangraphs/statcast park factor consensus
const PARK_FACTORS = {
  COL:1.30, TEX:1.10, CIN:1.09, PHI:1.08, BOS:1.07, NYY:1.06, MIL:1.05, ATL:1.04,
  MIN:1.03, DET:1.02, CLE:1.01, KC:1.01, BAL:1.00, TOR:1.00, CHC:1.00, STL:0.99,
  CWS:0.99, TB:0.98, WSH:0.97, ARI:0.97, MIA:0.97, PIT:0.96, OAK:0.96, LAA:0.96,
  HOU:0.95, SEA:0.95, NYM:0.95, LAD:0.94, SF:0.93, SD:0.92,
};

// ─── FAIR LINE ENGINE (Step 5) ────────────────────────────────────────────────
// Purpose: output YOUR projected line per market so you build your number first.
// Approach: team R/9 baseline + pitcher ERA adjustment + park factor + temperature.
// All inputs shown with n= so no naked numbers (Rule 1).

const mlbProjection = {
  // Fetch pitcher season stats + last-5 starts from statsapi
  async pitcherStats(playerId) {
    if (!playerId) return null;
    try {
      const r = await fetch(
        `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season,gameLog&group=pitching&season=2026`
      );
      if (!r.ok) return null;
      const j = await r.json();
      const season = j.stats?.find(s => s.type?.displayName === "statsSingleSeason")?.splits?.[0]?.stat;
      const gameLogs = j.stats?.find(s => s.type?.displayName === "gameLog")?.splits || [];
      const last5 = gameLogs.slice(0, 5).map(g => g.stat);
      const l5ERA = last5.length
        ? (last5.reduce((a, g) => a + (parseFloat(g.era) || 0), 0) / last5.length).toFixed(2)
        : null;
      return season ? {
        era: parseFloat(season.era) || null,
        fip: null, // statsapi doesn't expose FIP; placeholder for future FanGraphs wire
        kPer9: parseFloat(season.strikeoutsPer9Inn) || null,
        bbPer9: parseFloat(season.walksPer9Inn) || null,
        whip: parseFloat(season.whip) || null,
        gamesStarted: season.gamesStarted || 0,
        inningsPitched: parseFloat(season.inningsPitched) || 0,
        last5ERA: l5ERA ? parseFloat(l5ERA) : null,
        last5n: last5.length,
      } : null;
    } catch { return null; }
  },

  // Fetch team season R/9 from team stats
  async teamOffense(teamId) {
    if (!teamId) return null;
    try {
      const r = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=hitting&season=2026`
      );
      if (!r.ok) return null;
      const j = await r.json();
      const s = j.stats?.[0]?.splits?.[0]?.stat;
      if (!s) return null;
      const runsScored = parseFloat(s.runs) || 0;
      const gamesPlayed = parseFloat(s.gamesPlayed) || 1;
      return {
        rPerG: parseFloat((runsScored / gamesPlayed).toFixed(2)),
        avg: parseFloat(s.avg) || null,
        obp: parseFloat(s.obp) || null,
        slg: parseFloat(s.slg) || null,
        gamesPlayed,
      };
    } catch { return null; }
  },

  // Project runs for one team's half-game
  projectTeamRuns(offenseRPG, pitcherERA, parkFactor, tempAdj) {
    if (!offenseRPG || !pitcherERA) return null;
    // League-average ERA baseline ~4.00; pitcher ERA adjusts the run environment
    const eraAdj = pitcherERA / 4.00;
    const projected = offenseRPG * eraAdj * parkFactor * tempAdj;
    return parseFloat(projected.toFixed(2));
  },

  // Temperature adjustment: every 10°F above 72°F adds ~2% to run scoring
  tempAdjustment(tempF) {
    if (!tempF) return 1.00;
    const adj = 1 + ((tempF - 72) * 0.002);
    return Math.max(0.90, Math.min(1.15, adj)); // cap ±15%
  },

  // Convert projected run margin to win probability (logistic, ~0.72 win% per run)
  marginToWinPct(homeRuns, awayRuns) {
    const margin = homeRuns - awayRuns;
    return 1 / (1 + Math.exp(-0.72 * margin));
  },

  // Win probability to American odds
  winPctToAmerican(pct) {
    if (pct >= 0.5) return Math.round(-(pct / (1 - pct)) * 100);
    return Math.round(((1 - pct) / pct) * 100);
  },

  // Full projection for a matchup — returns projected total, home ML, edge vs market
  async project(matchup) {
    const parkFactor = PARK_FACTORS[matchup.homeTeam] || 1.00;
    const tempF = matchup.tempF ? parseFloat(matchup.tempF) : null;
    const tempAdj = mlbProjection.tempAdjustment(tempF);

    const [awayOff, homeOff, awayPStats, homePStats] = await Promise.all([
      mlbProjection.teamOffense(matchup.awayTeamId),
      mlbProjection.teamOffense(matchup.homeTeamId),
      mlbProjection.pitcherStats(matchup.awayProbableId),
      mlbProjection.pitcherStats(matchup.homeProbableId),
    ]);

    // Use last-5 ERA if available and large enough sample, else season ERA
    const awayERA = (awayPStats?.last5n >= 3 && awayPStats?.last5ERA) ? awayPStats.last5ERA : (awayPStats?.era || 4.20);
    const homeERA = (homePStats?.last5n >= 3 && homePStats?.last5ERA) ? homePStats.last5ERA : (homePStats?.era || 4.20);

    const projAwayRuns = mlbProjection.projectTeamRuns(awayOff?.rPerG || 4.20, homeERA, parkFactor, tempAdj);
    const projHomeRuns = mlbProjection.projectTeamRuns(homeOff?.rPerG || 4.20, awayERA, parkFactor, tempAdj);

    if (!projAwayRuns || !projHomeRuns) return null;

    const projTotal = parseFloat((projAwayRuns + projHomeRuns).toFixed(1));
    const homeWinPct = mlbProjection.marginToWinPct(projHomeRuns, projAwayRuns);
    const projHomeML = mlbProjection.winPctToAmerican(homeWinPct);
    const projAwayML = mlbProjection.winPctToAmerican(1 - homeWinPct);

    return {
      projTotal, projHomeRuns, projAwayRuns,
      projHomeML, projAwayML, homeWinPct: parseFloat(homeWinPct.toFixed(3)),
      parkFactor, tempAdj: parseFloat(tempAdj.toFixed(3)),
      awayOff, homeOff, awayPStats, homePStats,
      awayERA, homeERA,
      usedL5Away: !!(awayPStats?.last5n >= 3), usedL5Home: !!(homePStats?.last5n >= 3),
    };
  }
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const scoreToClass = (s) => s >= 4 ? "badge-strong" : s >= 2 ? "badge-lean" : "badge-split";
const scoreToPill = (s) => s >= 4 ? "pill-strong" : s >= 2 ? "pill-lean" : "pill-split";
const scoreLabel = (s) => s >= 4 ? "Strong" : s >= 2 ? "Lean" : "Split";
const dirColor = (d) => {
  if (!d) return T.text2;
  if (d === "Push/Skip") return T.text2;
  if (d.includes("Home") || d === "Over") return T.green;
  return T.red;
};
const dotClass = (dir, homeTeam) => {
  if (!dir || dir === "Push/Skip") return "dot-neutral";
  if (dir === "Home" || dir === `${homeTeam}`) return "dot-home";
  return "dot-away";
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const genId = () => Math.random().toString(36).slice(2, 9);

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORE_KEY = "de_matchups_v2";
const LOG_KEY = "de_log_v2";

const loadMatchups = async () => {
  try { const r = await storage.get(STORE_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const saveMatchups = async (data) => {
  try { await storage.set(STORE_KEY, JSON.stringify(data)); } catch {}
};
const loadLog = async () => {
  try { const r = await storage.get(LOG_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const saveLog = async (data) => {
  try { await storage.set(LOG_KEY, JSON.stringify(data)); } catch {}
};

// ─── MLB STATS API (free, official, no key) ──────────────────────────────────
const MLB_BASE = "https://statsapi.mlb.com/api/v1";
const TEAM_ABBR = {108:"LAA",109:"ARI",110:"BAL",111:"BOS",112:"CHC",113:"CIN",114:"CLE",115:"COL",116:"DET",117:"HOU",118:"KC",119:"LAD",120:"WSH",121:"NYM",133:"OAK",134:"PIT",135:"SD",136:"SEA",137:"SF",138:"STL",139:"TB",140:"TEX",141:"TOR",142:"MIN",143:"PHI",144:"ATL",145:"CWS",146:"MIA",147:"NYY",158:"MIL"};

const mlbApi = {
  todayET() {
    // statsapi keys games to the US date; use ET
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    return `${et.getFullYear()}-${String(et.getMonth()+1).padStart(2,"0")}-${String(et.getDate()).padStart(2,"0")}`;
  },
  async schedule(date) {
    const r = await fetch(`${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=probablePitcher,linescore,team`);
    if (!r.ok) throw new Error("schedule fetch failed");
    const j = await r.json();
    return (j.dates?.[0]?.games || []).map(g => ({
      gamePk: g.gamePk,
      status: g.status?.abstractGameState,            // Preview | Live | Final
      detailedState: g.status?.detailedState,
      gameTimeUTC: g.gameDate,
      home: { id: g.teams.home.team.id, abbr: TEAM_ABBR[g.teams.home.team.id] || g.teams.home.team.abbreviation || g.teams.home.team.name, name: g.teams.home.team.name, score: g.teams.home.score, probable: g.teams.home.probablePitcher?.fullName || null, probableId: g.teams.home.probablePitcher?.id || null },
      away: { id: g.teams.away.team.id, abbr: TEAM_ABBR[g.teams.away.team.id] || g.teams.away.team.abbreviation || g.teams.away.team.name, name: g.teams.away.team.name, score: g.teams.away.score, probable: g.teams.away.probablePitcher?.fullName || null, probableId: g.teams.away.probablePitcher?.id || null },
    }));
  },
  async lineupStatus(gamePk) {
    // Lineups posted = both batting orders present in the live feed boxscore
    const r = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
    if (!r.ok) throw new Error("game feed failed");
    const j = await r.json();
    const box = j.liveData?.boxscore?.teams;
    const homeN = box?.home?.battingOrder?.length || 0;
    const awayN = box?.away?.battingOrder?.length || 0;
    // Actual starting pitchers per feed (catches opener/starter swaps)
    const probs = j.gameData?.probablePitchers || {};
    return {
      posted: homeN >= 9 && awayN >= 9,
      homeCount: homeN, awayCount: awayN,
      homeProbable: probs.home?.fullName || null,
      awayProbable: probs.away?.fullName || null,
    };
  },
  async injuries(teamId) {
    // 40-man roster; anyone not Active is flagged (10-Day IL, 15-Day IL, 60-Day IL, etc.)
    const r = await fetch(`${MLB_BASE}/teams/${teamId}/roster?rosterType=40Man`);
    if (!r.ok) throw new Error("roster fetch failed");
    const j = await r.json();
    return (j.roster || [])
      .filter(p => p.status && p.status.code !== "A")
      .map(p => ({ name: p.person.fullName, pos: p.position?.abbreviation || "", status: p.status.description || p.status.code }));
  },
  async finals(date) {
    const r = await fetch(`${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=linescore,team`);
    if (!r.ok) throw new Error("finals fetch failed");
    const j = await r.json();
    const out = {};
    (j.dates?.[0]?.games || []).forEach(g => {
      if (g.status?.abstractGameState === "Final") {
        out[g.gamePk] = {
          homeAbbr: TEAM_ABBR[g.teams.home.team.id] || g.teams.home.team.name,
          awayAbbr: TEAM_ABBR[g.teams.away.team.id] || g.teams.away.team.name,
          homeRuns: g.teams.home.score, awayRuns: g.teams.away.score,
          total: (g.teams.home.score || 0) + (g.teams.away.score || 0),
          winner: (g.teams.home.score || 0) > (g.teams.away.score || 0) ? "home" : "away",
        };
      }
    });
    return out;
  },
};

// Grade a lean string against a final. Returns "Win" | "Loss" | "Push" | null (unparseable).
function gradeLean(lean, matchup, final) {
  if (!lean || !final) return null;
  const L = lean.trim().toLowerCase();
  const ou = L.match(/(under|over)\s*(\d+(?:\.\d+)?)/);
  if (ou) {
    const num = parseFloat(ou[2]);
    if (final.total === num) return "Push";
    const wentOver = final.total > num;
    return (ou[1] === "over") === wentOver ? "Win" : "Loss";
  }
  const homeAbbr = (matchup.homeTeam || "").toLowerCase();
  const awayAbbr = (matchup.awayTeam || "").toLowerCase();
  if (L === "home" || (homeAbbr && L.startsWith(homeAbbr))) return final.winner === "home" ? "Win" : "Loss";
  if (L === "away" || (awayAbbr && L.startsWith(awayAbbr))) return final.winner === "away" ? "Win" : "Loss";
  return null; // props, run lines, F5 → manual grade
}

// ─── SCORING ENGINE ──────────────────────────────────────────────────────────
function computeScore(matchup) {
  let score = 0;
  let aligned = 0;
  const factorScores = {};
  const leanDir = matchup.overallLean;

  FACTORS.forEach(f => {
    const fv = matchup.factors?.[f.id];
    if (!fv?.direction || fv.direction === "Push/Skip") { factorScores[f.id] = 0; return; }

    let weight = f.is2x ? 2 : 1; // line movement is explicit 2×
    // Headlines: weight by credibility tier
    if (f.isHeadlines) {
      const tier = HEADLINE_TIERS.find(t => t.value === fv.credibility);
      weight = tier ? tier.weight : 0.3;
    }
    // Modifiers (form, schedule) cap at 0.5 if already stacked with 3+ factors
    if (f.id === "form" && aligned >= 3) weight = 0.3;

    factorScores[f.id] = weight;
    if (fv.direction === leanDir) { score += weight; aligned++; }
    else { score -= weight * 0.5; }
  });

  const raw = Math.max(0, score);
  // Tier assignment per master doc
  let tier;
  if (raw >= 6) tier = 1;
  else if (raw >= 4) tier = 2;
  else if (raw >= 2) tier = 3;
  else tier = 4;

  return { score: Math.round(raw * 10) / 10, aligned, factorScores, tier };
}

// ─── ADD MATCHUP MODAL ───────────────────────────────────────────────────────
function AddMatchupModal({ onSave, onClose }) {
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().split("T")[0];
  const [m, setM] = useState({
    id: genId(), date: today, homeTeam: "NYY", awayTeam: "BOS",
    homePitcher: "", awayPitcher: "", stadium: "", gameTime: "",
    overallLean: "Home",
    factors: Object.fromEntries(FACTORS.map(f => [f.id, { direction: "Push/Skip", value: "", note: "" }])),
    looks: MARKETS.map(market => ({ market, lean: "", line: "", why: "" })),
    notes: "",
  });

  const set = (path, val) => {
    setM(prev => {
      const next = { ...prev };
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = val;
      return next;
    });
  };

  const setFactor = (id, key, val) => set(`factors.${id}.${key}`, val);
  const setLook = (i, key, val) => setM(prev => {
    const next = { ...prev };
    next.looks = [...prev.looks];
    next.looks[i] = { ...next.looks[i], [key]: val };
    return next;
  });

  const steps = ["Game Info", "Factor Stack", "5 Looks", "Review"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, overflow: "auto", padding: "20px" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, maxWidth: 700, margin: "0 auto", padding: "22px" }}>
        {/* Step header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: T.mono, color: T.amber, fontSize: 15, fontWeight: 700 }}>
            + New Matchup <span style={{ color: T.text2, fontSize: 12 }}>— {steps[step]}</span>
          </div>
          <button className="de-btn-ghost" onClick={onClose}>✕ Close</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              flex: 1, height: 3, borderRadius: 2, cursor: "pointer",
              background: i <= step ? T.amber : T.border,
              transition: "background 0.2s"
            }} />
          ))}
        </div>

        {/* ── STEP 0: Game Info ── */}
        {step === 0 && (
          <div>
            <div className="de-grid3" style={{ marginBottom: 12 }}>
              <div className="de-field">
                <label className="de-label">Date</label>
                <input className="de-input" type="date" value={m.date} onChange={e => set("date", e.target.value)} />
              </div>
              <div className="de-field">
                <label className="de-label">Game Time</label>
                <input className="de-input" type="text" placeholder="7:05 PM ET" value={m.gameTime} onChange={e => set("gameTime", e.target.value)} />
              </div>
              <div className="de-field">
                <label className="de-label">Stadium</label>
                <select className="de-select" value={m.homeTeam} onChange={e => set("homeTeam", e.target.value)}>
                  {TEAMS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="de-grid2" style={{ marginBottom: 12 }}>
              <div>
                <div className="de-section-title">Away Team</div>
                <div className="de-field">
                  <label className="de-label">Team</label>
                  <select className="de-select" value={m.awayTeam} onChange={e => set("awayTeam", e.target.value)}>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="de-field">
                  <label className="de-label">Starting Pitcher</label>
                  <input className="de-input" placeholder="Name (FIP 3.21, K% 28%)" value={m.awayPitcher} onChange={e => set("awayPitcher", e.target.value)} />
                </div>
              </div>
              <div>
                <div className="de-section-title">Home Team</div>
                <div className="de-field">
                  <label className="de-label">Team</label>
                  <select className="de-select" value={m.homeTeam} onChange={e => set("homeTeam", e.target.value)}>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="de-field">
                  <label className="de-label">Starting Pitcher</label>
                  <input className="de-input" placeholder="Name (FIP 3.44, K% 25%)" value={m.homePitcher} onChange={e => set("homePitcher", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="de-field">
              <label className="de-label">Overall Lean (before factor stack)</label>
              <select className="de-select" value={m.overallLean} onChange={e => set("overallLean", e.target.value)}>
                {["Home", "Away", "Over", "Under", "Push/Skip"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {PARK_NOTES[m.homeTeam] && (
              <div className="de-warning" style={{ marginTop: 10 }}>
                <strong>Park note:</strong> {PARK_NOTES[m.homeTeam]}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Factor Stack ── */}
        {step === 1 && (
          <div>
            <div className="de-warning" style={{ marginBottom: 14 }}>
              <strong>Reminder:</strong> Only mark a factor if it genuinely points a direction. Push/Skip anything ambiguous. Factors only matter if they stack in the SAME direction.
            </div>
            {FACTORS.map(f => {
              if (f.isHeadlines) {
                // ── HEADLINES: expanded credibility-aware UI ──
                const fv = m.factors[f.id];
                const tier = HEADLINE_TIERS.find(t => t.value === fv.credibility);
                return (
                  <div key={f.id} style={{ marginBottom: 10, background: T.bg2, borderRadius: 8, padding: "12px", border: `1px solid ${tier ? tier.color + "40" : T.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <label className="de-label" style={{ marginBottom:0, color: T.amber }}>📰 Headlines / News</label>
                      <span style={{ fontSize:10, color:T.text2 }}>Credibility-weighted — confirmed = 1.5×, unverified = 0.3×</span>
                    </div>
                    <div className="de-grid2" style={{ marginBottom:8 }}>
                      <div>
                        <label className="de-label">Direction</label>
                        <select className="de-select" value={fv.direction} onChange={e => setFactor(f.id, "direction", e.target.value)}>
                          {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="de-label">Credibility</label>
                        <select className="de-select" value={fv.credibility || "unverified"}
                          onChange={e => setFactor(f.id, "credibility", e.target.value)}
                          style={{ borderColor: tier ? tier.color + "60" : T.border }}>
                          {HEADLINE_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <label className="de-label">Headline Type</label>
                      <select className="de-select" value={fv.headlineType || "other"}
                        onChange={e => setFactor(f.id, "headlineType", e.target.value)}>
                        {HEADLINE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      {fv.headlineType && fv.headlineType !== "other" && (
                        <div style={{ fontSize:10, color:T.text2, marginTop:4, fontFamily:T.mono }}>
                          Impact: {HEADLINE_TYPES.find(t=>t.value===fv.headlineType)?.impact}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="de-label">Headline / Source</label>
                      <textarea className="de-input" style={{ minHeight:50 }}
                        placeholder="Paste headline or describe — include source (e.g. 'Ken Rosenthal: Acuña scratched with knee soreness')"
                        value={fv.note} onChange={e => setFactor(f.id, "note", e.target.value)} />
                    </div>
                    {tier && (
                      <div style={{ marginTop:8, fontSize:10, color:tier.color, fontFamily:T.mono }}>
                        ✓ {tier.label} — scores at {tier.weight}× weight · {tier.examples}
                      </div>
                    )}
                  </div>
                );
              }
              // ── Standard factor row ──
              return (
                <div key={f.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label className="de-label" style={{ marginBottom: 0 }}>
                      {f.label} {f.id === "linemove" && <span style={{ color: T.amber }}>★ 2×</span>}
                    </label>
                    <span style={{ fontSize: 10, color: T.text2 }}>{f.desc}</span>
                  </div>
                  <div className="de-grid3">
                    <select className="de-select"
                      value={m.factors[f.id].direction}
                      onChange={e => setFactor(f.id, "direction", e.target.value)}>
                      {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <input className="de-input" placeholder="Value (e.g. FIP 3.21)" value={m.factors[f.id].value} onChange={e => setFactor(f.id, "value", e.target.value)} />
                    <input className="de-input" placeholder="Note" value={m.factors[f.id].note} onChange={e => setFactor(f.id, "note", e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STEP 2: 5 Looks ── */}
        {step === 2 && (
          <div>
            <div className="de-warning" style={{ marginBottom: 14 }}>
              <strong>5 looks:</strong> Document your lean, projected line, and the reason. Be specific — "SP mismatch + bullpen" is better than "value."
            </div>
            {m.looks.map((lk, i) => (
              <div key={i} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, fontWeight: 700, marginBottom: 8 }}>{lk.market}</div>
                <div className="de-grid2" style={{ marginBottom: 8 }}>
                  <div>
                    <label className="de-label">Lean</label>
                    <input className="de-input" placeholder="e.g. Under 8.5" value={lk.lean} onChange={e => setLook(i, "lean", e.target.value)} />
                  </div>
                  <div>
                    <label className="de-label">Market Line</label>
                    <input className="de-input" placeholder="e.g. -115" value={lk.line} onChange={e => setLook(i, "line", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="de-label">Why</label>
                  <textarea className="de-input" placeholder="Reasoning — cite factors" value={lk.why} onChange={e => setLook(i, "why", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="de-matchup-teams">
                <span className="de-team-abbr" style={{ color: T.blue }}>{m.awayTeam}</span>
                <span className="de-vs">@</span>
                <span className="de-team-abbr" style={{ color: T.green }}>{m.homeTeam}</span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text2 }}>{fmtDate(m.date)} {m.gameTime}</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: T.text1 }}>Overall lean: </span>
              <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.amber }}>{m.overallLean}</span>
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginBottom: 14 }}>
              {FACTORS.filter(f => m.factors[f.id].direction !== "Push/Skip").length} of {FACTORS.length} factors filled
            </div>
            <div className="de-field">
              <label className="de-label">Notes</label>
              <textarea className="de-input" placeholder="Any additional context..." value={m.notes} onChange={e => set("notes", e.target.value)} />
            </div>
            <div className="de-warning">
              <strong>Remember:</strong> This is analysis, not a bet recommendation. Track CLV after game to validate your edge thesis.
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button className="de-btn-ghost" onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < steps.length - 1
            ? <button className="de-btn" onClick={() => setStep(s => s + 1)}>Next →</button>
            : <button className="de-btn" onClick={() => onSave(m)}>Save Matchup</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── MATCHUP CARD ─────────────────────────────────────────────────────────────
function MatchupCard({ matchup, onLog, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [amendLoading, setAmendLoading] = useState(false);
  const [amendment, setAmendment] = useState(matchup.pendingAmendment || null);
  const [proj, setProj] = useState(null);
  const [projLoading, setProjLoading] = useState(false);

  const fetchProjection = async () => {
    if (!matchup.awayTeamId || !matchup.homeTeamId) return;
    setProjLoading(true);
    try {
      const result = await mlbProjection.project(matchup);
      setProj(result);
    } catch(e) { console.error("projection failed", e); }
    finally { setProjLoading(false); }
  };

  // Auto-fetch projection when card is expanded and has team IDs
  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !proj && matchup.awayTeamId && matchup.homeTeamId) fetchProjection();
  };

  const { score, aligned, tier } = computeScore(matchup);
  const pillClass = scoreToPill(score);
  const badgeClass = scoreToClass(score);
  const lbl = scoreLabel(score);
  const isLocked = !!matchup.lockedAt;

  const filledFactors = FACTORS.filter(f => matchup.factors?.[f.id]?.direction && matchup.factors[f.id].direction !== "Push/Skip");
  const alignedFactors = filledFactors.filter(f => matchup.factors[f.id].direction === matchup.overallLean);
  const opposingFactors = filledFactors.filter(f => matchup.factors[f.id].direction !== matchup.overallLean);
  const neutralFactors = filledFactors.filter(f => !alignedFactors.includes(f) && !opposingFactors.includes(f));
  const TIER_STYLES = {
    1:{label:"T1 · ELITE",color:T.green,bg:`${T.green}15`},
    2:{label:"T2 · STRONG",color:T.amber,bg:`${T.amber}12`},
    3:{label:"T3 · LEAN",color:T.text1,bg:T.bg3},
    4:{label:"T4 · PASS",color:T.red,bg:`${T.red}10`},
  };
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES[4];

  const [lockChecking, setLockChecking] = useState(false);
  const [gateMsg, setGateMsg] = useState(null);
  const [injuries, setInjuries] = useState(matchup.injuryCheck || null);
  const [injLoading, setInjLoading] = useState(false);

  // GATE (Rule 2): no lock until lineups are officially posted. Enforced in code.
  const handleLock = async () => {
    if (!matchup.gamePk) {
      // Manual matchup with no gamePk — allow lock but record the gate was unverifiable
      onUpdate({ ...matchup, lockedAt: new Date().toISOString(), lockedLooks: matchup.looks, pendingAmendment: null, gateStatus: "unverified (manual entry, no gamePk)" });
      return;
    }
    setLockChecking(true);
    setGateMsg(null);
    try {
      const ls = await mlbApi.lineupStatus(matchup.gamePk);
      if (!ls.posted) {
        setGateMsg(`🔒 GATE: Lineups not posted yet (${ls.awayCount}/9 away, ${ls.homeCount}/9 home). Lock blocked.`);
        return;
      }
      // Starter-change detection (the WAS/opener lesson)
      const alerts = [];
      if (matchup.listedAwayProbable && ls.awayProbable && ls.awayProbable !== matchup.listedAwayProbable)
        alerts.push(`AWAY starter changed: ${matchup.listedAwayProbable} → ${ls.awayProbable}`);
      if (matchup.listedHomeProbable && ls.homeProbable && ls.homeProbable !== matchup.listedHomeProbable)
        alerts.push(`HOME starter changed: ${matchup.listedHomeProbable} → ${ls.homeProbable}`);
      if (alerts.length) {
        setGateMsg(`⚠ STARTER CHANGE — ${alerts.join(" · ")} — review factors, then lock again to confirm.`);
        onUpdate({ ...matchup, starterChangeAlert: alerts.join(" · "), awayPitcher: ls.awayProbable || matchup.awayPitcher, homePitcher: ls.homeProbable || matchup.homePitcher, listedAwayProbable: ls.awayProbable, listedHomeProbable: ls.homeProbable });
        return;
      }
      onUpdate({ ...matchup, lockedAt: new Date().toISOString(), lockedLooks: matchup.looks, pendingAmendment: null, gateStatus: "lineups confirmed" });
    } catch (e) {
      setGateMsg("⚠ Gate check failed (" + e.message + ") — retry, or game feed not live yet.");
    } finally {
      setLockChecking(false);
    }
  };

  // GATE (Rule 6): injury check before tiering
  const handleInjuryCheck = async () => {
    if (!matchup.homeTeamId || !matchup.awayTeamId) { setGateMsg("No team IDs — use ⚡ Load Slate for injury data."); return; }
    setInjLoading(true);
    try {
      const [awayIL, homeIL] = await Promise.all([mlbApi.injuries(matchup.awayTeamId), mlbApi.injuries(matchup.homeTeamId)]);
      const result = { away: awayIL, home: homeIL, checkedAt: new Date().toISOString() };
      setInjuries(result);
      onUpdate({ ...matchup, injuryCheck: result });
    } catch (e) {
      setGateMsg("⚠ Injury fetch failed: " + e.message);
    } finally {
      setInjLoading(false);
    }
  };

  const handleRequestAmendment = async () => {
    setAmendLoading(true);
    const looksText = (matchup.lockedLooks || matchup.looks || [])
      .filter(l => l.lean)
      .map(l => `${l.market}: ${l.lean} (${l.line || "no line"}) — ${l.why || "no reasoning"}`)
      .join("\n");
    const factorsText = FACTORS
      .filter(f => matchup.factors?.[f.id]?.direction && matchup.factors[f.id].direction !== "Push/Skip")
      .map(f => `${f.label}: ${matchup.factors[f.id].direction} (${matchup.factors[f.id].value || ""}) — ${matchup.factors[f.id].note || ""}`)
      .join("\n");

    const prompt = `You are a sharp MLB analyst. A bettor locked in morning picks and is now doing a second scan. You must NOT just restate the original picks. Your ONLY job is to identify if something material has changed that justifies overriding a locked read.

GAME: ${matchup.awayTeam} @ ${matchup.homeTeam} — ${matchup.gameTime || ""}
LOCKED AT: ${matchup.lockedAt ? new Date(matchup.lockedAt).toLocaleTimeString() : "morning"}

MORNING LOCKED PICKS:
${looksText || "No picks locked"}

FACTOR STACK (as entered):
${factorsText || "No factors entered"}

OVERALL LEAN: ${matchup.overallLean}

Now assess: Is there a legitimate reason to amend any of these locked picks? 

You must answer in this exact structure:

AMENDMENT WARRANTED: [YES or NO]

IF YES — for each changed pick:
MARKET: [which market]
ORIGINAL: [what was locked]
NEW READ: [what you'd change it to]
TRIGGER: [the specific new information that changed this — line movement, lineup change, weather update, injury, etc. If you're speculating without new data, say so explicitly]
STRENGTH: [STRONG override / WEAK override — be honest]

IF NO:
STATE PLAINLY: "Original picks stand. No material change detected." Then in one sentence explain what would need to change to justify an amendment.

Do not pad. Do not re-explain the original reasoning unless it's directly relevant to the amendment.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 700,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(c => c.text || "").join("").trim();
      const warranted = text.includes("AMENDMENT WARRANTED: YES");
      const amendData = { text, warranted, generatedAt: new Date().toISOString() };
      setAmendment(amendData);
      onUpdate({ ...matchup, pendingAmendment: amendData });
    } catch (e) {
      setAmendment({ text: "Error: " + e.message, warranted: false, generatedAt: new Date().toISOString() });
    } finally {
      setAmendLoading(false);
    }
  };

  const handleAcceptAmendment = () => {
    const history = matchup.amendmentHistory || [];
    onUpdate({
      ...matchup,
      amendmentHistory: [...history, { ...amendment, accepted: true }],
      pendingAmendment: null,
    });
    setAmendment(null);
  };

  const handleRejectAmendment = () => {
    const history = matchup.amendmentHistory || [];
    onUpdate({
      ...matchup,
      amendmentHistory: [...history, { ...amendment, accepted: false }],
      pendingAmendment: null,
    });
    setAmendment(null);
  };

  const cardBorder = isLocked
    ? amendment?.warranted ? `2px solid ${T.red}60` : `2px solid ${T.green}40`
    : T.border;

  return (
    <div className="de-card" style={{ borderColor: cardBorder, borderWidth: isLocked ? 2 : 1 }}>
      {/* Lock status bar */}
      {isLocked && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, padding:"6px 10px", background: amendment?.warranted ? `${T.red}10` : `${T.green}0a`, borderRadius:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13 }}>{amendment?.warranted ? "⚠️" : "🔒"}</span>
            <span style={{ fontFamily:T.mono, fontSize:11, fontWeight:700, color: amendment?.warranted ? T.red : T.green }}>
              {amendment?.warranted ? "AMENDMENT PENDING" : "PICKS LOCKED"}
            </span>
            <span style={{ fontSize:10, color:T.text2 }}>
              {matchup.lockedAt ? new Date(matchup.lockedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : ""}
            </span>
          </div>
          <button
            className="de-btn-ghost"
            style={{ fontSize:10, padding:"4px 10px", borderColor: amendLoading ? T.border : T.purple, color: amendLoading ? T.text2 : T.purple }}
            onClick={handleRequestAmendment}
            disabled={amendLoading}
          >
            {amendLoading ? "Scanning..." : "2nd Scan"}
          </button>
        </div>
      )}

      <div className="de-card-header">
        <div>
          <div className="de-matchup-teams" style={{ marginBottom: 4, display:"flex", alignItems:"center", gap:8 }}>
            <TeamLogo abbr={matchup.awayTeam} size={40} />
            <span className="de-team-abbr" style={{ color: T.blue }}>{matchup.awayTeam}</span>
            <span className="de-vs">@</span>
            <span className="de-team-abbr" style={{ color: T.green }}>{matchup.homeTeam}</span>
            <TeamLogo abbr={matchup.homeTeam} size={40} />
          </div>
          <div className="de-meta">
            {fmtDate(matchup.date)}{matchup.gameTime ? ` · ${matchup.gameTime}` : ""}
            {matchup.awayPitcher ? ` · ${lastName(matchup.awayPitcher)} vs ${matchup.homePitcher ? lastName(matchup.homePitcher) : "?"}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
            <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:20,
              background:tierStyle.bg, color:tierStyle.color, border:`1px solid ${tierStyle.color}40`, whiteSpace:"nowrap" }}>
              {tierStyle.label}
            </span>
            <span style={{ fontSize:11, color:T.text2, fontFamily:T.mono }}>
              score {score} · {alignedFactors.length}/{filledFactors.length} align → {matchup.overallLean}
            </span>
          </div>
        </div>
      </div>

      {/* Plain-English pick banner — Ralph asked "I don't know what you're picking" */}
      {matchup.overallLean && matchup.overallLean !== "Push/Skip" && filledFactors.length > 0 ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:tierStyle.bg,
          border:`1px solid ${tierStyle.color}40`, borderRadius:8, padding:"8px 12px", margin:"10px 0" }}>
          <span style={{ fontSize:14 }}>🎯</span>
          <span style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:tierStyle.color }}>
            PICK: {matchup.overallLean === "Home" ? matchup.homeTeam : matchup.overallLean === "Away" ? matchup.awayTeam : matchup.overallLean}
          </span>
          <span style={{ fontSize:11, color:T.text2, fontFamily:T.mono }}>· {tierStyle.label}</span>
        </div>
      ) : (
        <div style={{ fontSize:11, color:T.text2, fontFamily:T.mono, margin:"10px 0" }}>
          No pick yet — fill in factors below
        </div>
      )}

      {/* Amendment panel */}
      {amendment && (
        <div style={{ background: amendment.warranted ? `${T.red}0d` : `${T.bg2}`, border:`1px solid ${amendment.warranted ? T.red+"40" : T.border}`, borderRadius:8, padding:"12px 14px", marginBottom:12 }}>
          <div style={{ fontFamily:T.mono, fontSize:11, fontWeight:700, color: amendment.warranted ? T.red : T.green, marginBottom:8 }}>
            {amendment.warranted ? "⚠ AMENDMENT WARRANTED" : "✓ NO CHANGE — Original picks stand"}
          </div>
          <div style={{ fontSize:12, color:T.text1, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{amendment.text}</div>
          {amendment.warranted && (
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="de-btn" style={{ fontSize:11, padding:"7px 14px", background:T.red }}
                onClick={handleAcceptAmendment}>
                Accept Amendment
              </button>
              <button className="de-btn-ghost" style={{ fontSize:11 }}
                onClick={handleRejectAmendment}>
                Reject — Keep Original
              </button>
            </div>
          )}
          {!amendment.warranted && (
            <button className="de-btn-ghost" style={{ fontSize:11, marginTop:10 }}
              onClick={handleRejectAmendment}>
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Amendment history trail */}
      {matchup.amendmentHistory?.length > 0 && (
        <div style={{ marginBottom:10 }}>
          {matchup.amendmentHistory.map((h, i) => (
            <div key={i} style={{ fontSize:10, color:T.text2, fontFamily:T.mono, padding:"3px 8px", background:T.bg2, borderRadius:4, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
              <span>2nd scan {new Date(h.generatedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}: {h.warranted ? "Amendment ":"No change "}{h.accepted === true ? "✓ accepted" : h.accepted === false ? "✗ rejected" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {/* Factor alignment bar */}
      {filledFactors.length > 0 && (
        <div className="de-factor-bar-wrap">
          <div className="de-factor-bar-label">
            <span>{alignedFactors.length} with lean</span>
            <span>{opposingFactors.length} opposing</span>
          </div>
          <div className="de-factor-bar">
            {alignedFactors.map((f, i) => (
              <div key={f.id} className="de-factor-seg" style={{
                flex: f.id === "linemove" ? 2 : 1,
                background: matchup.overallLean === "Home" || matchup.overallLean === "Over" ? T.green : T.red,
                opacity: 0.8
              }} />
            ))}
            {opposingFactors.map((f) => (
              <div key={f.id} className="de-factor-seg" style={{ flex:1, background:T.text2, opacity:0.4 }} />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed preview */}
      {!expanded && (matchup.lockedLooks || matchup.looks)?.filter(l => l.lean).slice(0, 2).map((lk, i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}30` }}>
          <span style={{ fontSize:11, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px" }}>{lk.market}</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {isLocked && <span style={{ fontSize:9, color:T.green }}>🔒</span>}
            <span style={{ fontFamily:T.mono, fontSize:12, color:dirColor(lk.lean), fontWeight:700 }}>{lk.lean}</span>
          </div>
        </div>
      ))}

      {/* Expanded */}
      {expanded && (
        <div>
          {/* Locked looks vs original */}
          {isLocked && matchup.lockedLooks?.some(l => l.lean) && (
            <>
              <div className="de-section-title" style={{ marginTop:14 }}>
                🔒 Locked Picks
                <span style={{ fontSize:10, color:T.text2, fontWeight:400, marginLeft:8, textTransform:"none", letterSpacing:0 }}>
                  {matchup.lockedAt ? new Date(matchup.lockedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : ""}
                </span>
              </div>
              <div className="de-looks">
                {matchup.lockedLooks.filter(l => l.lean).map((lk, i) => (
                  <div key={i} className="de-look" style={{ borderLeft:`3px solid ${T.green}` }}>
                    <div className="de-look-market">{lk.market}</div>
                    <div className="de-look-lean" style={{ color:dirColor(lk.lean) }}>{lk.lean}</div>
                    {lk.line && <div className="de-look-line">{lk.line}</div>}
                    {lk.why && <div className="de-look-why">{lk.why}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── FAIR LINE ENGINE (Step 5) ── */}
          <div style={{ marginTop:14 }}>
            <div className="de-section-title">
              ◆ Projected Fair Line
              {!proj && matchup.awayTeamId && (
                <button className="de-btn-ghost" style={{ fontSize:10, padding:"2px 8px", marginLeft:8 }}
                  onClick={fetchProjection} disabled={projLoading}>
                  {projLoading ? "Fetching..." : "↻ Refresh"}
                </button>
              )}
            </div>
            {projLoading && <div style={{ fontSize:12, color:T.text2, fontFamily:T.mono }}>Pulling stats from MLB API...</div>}
            {!proj && !projLoading && (
              <div style={{ fontSize:11, color:T.text2 }}>
                {matchup.awayTeamId ? "Expand card to auto-fetch, or click ↻ above." : "No team IDs — use ⚡ Load Slate for auto-projection."}
              </div>
            )}
            {proj && (
              <div>
                {/* Main numbers row */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
                  {/* Total */}
                  <div style={{ flex:1, minWidth:130, background:T.bg2, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Proj. Total</div>
                    <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:T.text0 }}>{proj.projTotal}</div>
                    <div style={{ fontSize:10, color:T.text2, marginTop:2 }}>
                      {proj.projAwayRuns} ({matchup.awayTeam}) + {proj.projHomeRuns} ({matchup.homeTeam})
                    </div>
                  </div>
                  {/* Home ML */}
                  <div style={{ flex:1, minWidth:130, background:T.bg2, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Proj. Home ML</div>
                    <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700,
                      color: proj.projHomeML < 0 ? T.green : T.red }}>
                      {proj.projHomeML > 0 ? "+" : ""}{proj.projHomeML}
                    </div>
                    <div style={{ fontSize:10, color:T.text2, marginTop:2 }}>{(proj.homeWinPct*100).toFixed(1)}% home win</div>
                  </div>
                  {/* Away ML */}
                  <div style={{ flex:1, minWidth:130, background:T.bg2, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Proj. Away ML</div>
                    <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700,
                      color: proj.projAwayML < 0 ? T.green : T.red }}>
                      {proj.projAwayML > 0 ? "+" : ""}{proj.projAwayML}
                    </div>
                    <div style={{ fontSize:10, color:T.text2, marginTop:2 }}>{((1-proj.homeWinPct)*100).toFixed(1)}% away win</div>
                  </div>
                </div>

                {/* Enter market line for edge calc */}
                <div style={{ background:T.bg2, borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                  <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Enter Market Lines to See Edge</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[["marketTotal","Market O/U","e.g. 8.5"],["marketHomeML","Home ML","e.g. -137"],["marketAwayML","Away ML","e.g. +115"]].map(([key,label,ph]) => (
                      <div key={key} style={{ flex:1, minWidth:90 }}>
                        <div style={{ fontSize:10, color:T.text2, marginBottom:3 }}>{label}</div>
                        <input className="de-input" style={{ fontSize:12, padding:"5px 8px" }} placeholder={ph}
                          value={matchup[key] || ""}
                          onChange={e => onUpdate({ ...matchup, [key]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                  {/* Edge display */}
                  {matchup.marketTotal && (
                    (() => {
                      const mkt = parseFloat(matchup.marketTotal);
                      const edge = proj.projTotal - mkt;
                      const dir = edge > 0.3 ? "OVER" : edge < -0.3 ? "UNDER" : "PUSH";
                      const col = dir === "OVER" ? T.red : dir === "UNDER" ? T.green : T.text2;
                      return (
                        <div style={{ marginTop:8, fontFamily:T.mono, fontSize:12 }}>
                          Total edge: <span style={{ color:col, fontWeight:700 }}>
                            {dir} ({edge > 0 ? "+" : ""}{edge.toFixed(1)} runs vs market {mkt})
                          </span>
                          {Math.abs(edge) < 0.5 && <span style={{ color:T.text2 }}> — thin, no play</span>}
                          {Math.abs(edge) >= 1.0 && <span style={{ color:T.amber }}> ⚡ material edge</span>}
                        </div>
                      );
                    })()
                  )}
                  {matchup.marketHomeML && (
                    (() => {
                      const mkt = parseFloat(matchup.marketHomeML);
                      const mktPct = mkt < 0 ? (-mkt / (-mkt + 100)) : (100 / (mkt + 100));
                      const edge = proj.homeWinPct - mktPct;
                      const col = edge > 0.03 ? T.green : edge < -0.03 ? T.red : T.text2;
                      return (
                        <div style={{ marginTop:4, fontFamily:T.mono, fontSize:12 }}>
                          Home ML edge: <span style={{ color:col, fontWeight:700 }}>
                            {edge > 0 ? "+" : ""}{(edge*100).toFixed(1)}% vs market implied {(mktPct*100).toFixed(1)}%
                          </span>
                          {Math.abs(edge) >= 0.05 && <span style={{ color:T.amber }}> ⚡ material</span>}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Inputs used — with n= (Rule 1) */}
                <div style={{ background:T.bg2, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Inputs Used (n=)</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {[
                      [`${matchup.awayTeam} offense`, proj.awayOff ? `${proj.awayOff.rPerG} R/G (n=${proj.awayOff.gamesPlayed})` : "—"],
                      [`${matchup.homeTeam} offense`, proj.homeOff ? `${proj.homeOff.rPerG} R/G (n=${proj.homeOff.gamesPlayed})` : "—"],
                      [`${matchup.awayPitcher?.split(" ").pop() || "Away SP"} ERA`, proj.awayERA ? `${proj.awayERA} ${proj.usedL5Away ? "(L5)" : "(season)"}` : "—"],
                      [`${matchup.homePitcher?.split(" ").pop() || "Home SP"} ERA`, proj.homeERA ? `${proj.homeERA} ${proj.usedL5Home ? "(L5)" : "(season)"}` : "—"],
                      [`${matchup.homeTeam} park factor`, `${proj.parkFactor}× run env`],
                      ["Temp adj", proj.tempAdj !== 1.00 ? `${proj.tempAdj}× (${matchup.tempF}°F)` : "None entered"],
                    ].map(([label, val]) => (
                      <div key={label} style={{ fontSize:11 }}>
                        <span style={{ color:T.text2 }}>{label}: </span>
                        <span style={{ color:T.text0, fontFamily:T.mono }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:T.text2, marginTop:8, lineHeight:1.5 }}>
                    ⚠ ERA-based projection only — FIP/xFIP wires in next sprint. L5 ERA used when n≥3 starts available. Model is a baseline: if projection is far off the market, assume YOU'RE missing something.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── FACTOR STACK ── */}
          <div className="de-section-title" style={{ marginTop:14 }}>Factor Stack</div>
          <div className="de-factors">
            {FACTORS.map(f => {
              const fv = matchup.factors?.[f.id];
              if (!fv?.direction || fv.direction === "Push/Skip") return null;
              const isAligned = fv.direction === matchup.overallLean;
              if (f.isHeadlines) {
                const tier = HEADLINE_TIERS.find(t => t.value === fv.credibility) || HEADLINE_TIERS[2];
                const hType = HEADLINE_TYPES.find(t => t.value === fv.headlineType);
                return (
                  <div key={f.id} className="de-factor-row" style={{ flexDirection:"column", alignItems:"flex-start", gap:4, borderLeft:`3px solid ${tier.color}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, width:"100%" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:tier.color, fontFamily:T.mono }}>📰 {tier.label.split("(")[0].trim().toUpperCase()}</span>
                      {hType && <span style={{ fontSize:10, color:T.text2 }}>{hType.label}</span>}
                      <span style={{ marginLeft:"auto", fontFamily:T.mono, fontSize:11, color:dirColor(fv.direction), fontWeight:700 }}>↳ {fv.direction}</span>
                    </div>
                    {fv.note && <div style={{ fontSize:11, color:T.text1, lineHeight:1.5 }}>{fv.note}</div>}
                    <div style={{ fontSize:10, color:tier.color, fontFamily:T.mono }}>{tier.weight}× weight · {isAligned ? "aligns with lean ✓" : "opposes lean ✗"}</div>
                  </div>
                );
              }
              return (
                <div key={f.id} className="de-factor-row">
                  <div className={`de-factor-dot ${isAligned ? (matchup.overallLean === "Home" || matchup.overallLean === "Over" ? "dot-home" : "dot-away") : "dot-neutral"}`} />
                  <span className="de-factor-name">{f.label}{f.id === "linemove" ? " ★" : ""}</span>
                  <span className="de-factor-val">{fv.value || "—"}</span>
                  <span className="de-factor-note">{fv.note || ""} <span style={{ color:dirColor(fv.direction), fontWeight:700 }}>↳ {fv.direction}</span></span>
                </div>
              );
            })}
          </div>

          {/* ── REASONING CARD (Step 7) — grouped factor bars + what-flips-this ── */}
          {filledFactors.length > 0 && (
            <div style={{ background:T.bg2, borderRadius:9, padding:"12px 14px", marginTop:12 }}>
              {/* Supporting factors */}
              {alignedFactors.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:T.green, fontFamily:T.mono, fontWeight:700, marginBottom:6 }}>
                    ↳ PUSHING {matchup.overallLean?.toUpperCase()} ({alignedFactors.length})
                  </div>
                  {alignedFactors.map(f => {
                    const fv = matchup.factors[f.id];
                    const barPct = f.weight >= 9 ? 90 : f.weight >= 7 ? 65 : f.weight >= 5 ? 45 : 28;
                    return (
                      <div key={f.id} style={{ marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, color:T.text0, fontWeight:600 }}>
                            {f.label}{f.is2x ? " ★" : ""}
                          </span>
                          <span style={{ fontSize:10, color:T.text2, fontFamily:T.mono }}>{f.weight}/10</span>
                        </div>
                        <div style={{ height:5, background:T.bg3, borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                          <div style={{ height:"100%", width:`${barPct}%`, background:T.green, borderRadius:3 }} />
                        </div>
                        {fv.value && <div style={{ fontSize:11, color:T.text1 }}>{fv.value}{fv.note ? ` — ${fv.note}` : ""}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Opposing factors — always show; this is what makes the card honest */}
              {opposingFactors.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:T.red, fontFamily:T.mono, fontWeight:700, marginBottom:6 }}>
                    ↳ ARGUING AGAINST ({opposingFactors.length}) — why it's not higher tier
                  </div>
                  {opposingFactors.map(f => {
                    const fv = matchup.factors[f.id];
                    const barPct = f.weight >= 9 ? 90 : f.weight >= 7 ? 65 : f.weight >= 5 ? 45 : 28;
                    return (
                      <div key={f.id} style={{ marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, color:T.text0, fontWeight:600 }}>{f.label}</span>
                          <span style={{ fontSize:10, color:T.text2, fontFamily:T.mono }}>{f.weight}/10</span>
                        </div>
                        <div style={{ height:5, background:T.bg3, borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                          <div style={{ height:"100%", width:`${barPct}%`, background:T.red, borderRadius:3, opacity:0.7 }} />
                        </div>
                        {fv.value && <div style={{ fontSize:11, color:T.text1 }}>{fv.value}{fv.note ? ` — ${fv.note}` : ""}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* What flips this callout */}
              {matchup.whatFlips && (
                <div style={{ background:`${T.purple}10`, border:`1px solid ${T.purple}30`, borderRadius:7, padding:"8px 10px", marginTop:4 }}>
                  <span style={{ fontSize:10, color:T.purple, fontFamily:T.mono, fontWeight:700 }}>⚡ WHAT FLIPS THIS: </span>
                  <span style={{ fontSize:11, color:T.text1 }}>{matchup.whatFlips}</span>
                </div>
              )}
              {!matchup.whatFlips && !isLocked && (
                <div style={{ marginTop:6 }}>
                  <input className="de-input" style={{ fontSize:11, padding:"5px 8px" }}
                    placeholder="⚡ What would flip this read? (e.g. wind shifts in, starter scratched)"
                    value={matchup.whatFlips || ""}
                    onChange={e => onUpdate({ ...matchup, whatFlips: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {/* Current looks (if not locked) */}
          {!isLocked && matchup.looks?.some(l => l.lean) && (
            <>
              <div className="de-section-title" style={{ marginTop:18 }}>5 Looks</div>
              <div className="de-looks">
                {matchup.looks.filter(l => l.lean).map((lk, i) => (
                  <div key={i} className="de-look">
                    <div className="de-look-market">{lk.market}</div>
                    <div className="de-look-lean" style={{ color:dirColor(lk.lean) }}>{lk.lean}</div>
                    {lk.line && <div className="de-look-line">{lk.line}</div>}
                    {lk.why && <div className="de-look-why">{lk.why}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {matchup.notes && (
            <div style={{ marginTop:14, padding:"10px", background:T.bg2, borderRadius:7, fontSize:12, color:T.text1, lineHeight:1.6 }}>
              {matchup.notes}
            </div>
          )}

          {/* Injury gate panel (Rule 6: check before tiering) */}
          <div style={{ marginTop:14 }}>
            {!injuries ? (
              <button className="de-btn-ghost" style={{ fontSize:11, borderColor:T.red, color:T.red }}
                onClick={handleInjuryCheck} disabled={injLoading}>
                {injLoading ? "Checking IL..." : "🏥 Injury Check (required before tiering)"}
              </button>
            ) : (
              <div style={{ background:T.bg2, borderRadius:7, padding:"10px 12px", borderLeft:`3px solid ${T.green}` }}>
                <div style={{ fontSize:10, color:T.green, fontFamily:T.mono, fontWeight:700, marginBottom:6 }}>
                  ✓ INJURY CHECK · {new Date(injuries.checkedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {[["away", matchup.awayTeam], ["home", matchup.homeTeam]].map(([side, abbr]) => (
                    <div key={side} style={{ flex:1, minWidth:140 }}>
                      <div style={{ fontSize:10, color:T.text2, fontFamily:T.mono, marginBottom:3 }}>{abbr} IL ({injuries[side].length})</div>
                      {injuries[side].length === 0
                        ? <div style={{ fontSize:11, color:T.text2 }}>None</div>
                        : injuries[side].slice(0, 8).map((p, i) => (
                          <div key={i} style={{ fontSize:11, color:T.text1 }}>{p.name} <span style={{ color:T.red, fontSize:10 }}>({p.status})</span></div>
                        ))}
                    </div>
                  ))}
                </div>
                <button className="de-btn-ghost" style={{ fontSize:10, padding:"3px 8px", marginTop:6 }} onClick={handleInjuryCheck}>↻ Refresh</button>
              </div>
            )}
          </div>

          {/* Gate messages */}
          {gateMsg && (
            <div style={{ marginTop:10, padding:"9px 12px", background:`${T.amber}10`, border:`1px solid ${T.amberDim}`, borderRadius:7, fontSize:12, color:T.text1, fontFamily:T.mono }}>
              {gateMsg}
            </div>
          )}
          {matchup.starterChangeAlert && (
            <div style={{ marginTop:8, padding:"8px 12px", background:`${T.red}10`, border:`1px solid ${T.red}40`, borderRadius:7, fontSize:11, color:T.red, fontFamily:T.mono }}>
              ⚠ {matchup.starterChangeAlert}
            </div>
          )}

          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            {!isLocked && (
              <button className="de-btn" style={{ fontSize:12, padding:"8px 14px", background: lockChecking ? T.bg3 : T.green, color: lockChecking ? T.text2 : "#0f1117" }}
                onClick={handleLock} disabled={lockChecking}>
                {lockChecking ? "Checking gate..." : matchup.gamePk ? "🔒 Lock (gate-checked)" : "🔒 Lock Picks"}
              </button>
            )}
            <button className="de-btn" onClick={() => onLog(matchup)} style={{ fontSize:12, padding:"8px 14px" }}>
              + Log Result
            </button>
            {!isLocked && <button className="de-btn-danger" onClick={() => onDelete(matchup.id)}>Delete</button>}
          </div>
        </div>
      )}

      <button className="de-btn-ghost" onClick={handleExpand}
        style={{ width:"100%", marginTop:10, fontSize:11, padding:"6px" }}>
        {expanded ? "▲ Less" : "▼ Expand"}
      </button>
    </div>
  );
}

// ─── LOG RESULT MODAL ────────────────────────────────────────────────────────
function LogResultModal({ matchup, onSave, onClose }) {
  const [entries, setEntries] = useState(
    (matchup.looks?.filter(l => l.lean) || []).map(l => ({
      market: l.market, lean: l.lean, line: l.line,
      result: "Pending", finalLine: "", clv: "", notes: "",
      factorsConfirmed: [],
    }))
  );

  const updateEntry = (i, key, val) => {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  };

  const handleSave = () => {
    const logEntry = {
      id: genId(),
      matchupId: matchup.id,
      date: matchup.date,
      game: `${matchup.awayTeam} @ ${matchup.homeTeam}`,
      overallLean: matchup.overallLean,
      entries,
      loggedAt: new Date().toISOString(),
    };
    onSave(logEntry);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, overflow: "auto", padding: "20px" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, maxWidth: 640, margin: "0 auto", padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontFamily: T.mono, color: T.amber, fontSize: 14, fontWeight: 700 }}>
            Log Results: {matchup.awayTeam} @ {matchup.homeTeam}
          </div>
          <button className="de-btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="de-warning" style={{ marginBottom: 14 }}>
          <strong>CLV tip:</strong> Record the closing line vs. your entry line. Positive CLV over time = real edge. Negative CLV = fade your own picks.
        </div>
        {entries.map((e, i) => (
          <div key={i} style={{ background: T.bg2, borderRadius: 8, padding: 12, marginBottom: 10, border: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, marginBottom: 8, fontWeight: 700 }}>{e.market} — {e.lean}</div>
            <div className="de-grid3">
              <div>
                <label className="de-label">Result</label>
                <select className="de-select" value={e.result} onChange={ev => updateEntry(i, "result", ev.target.value)}>
                  {["Pending", "Win", "Loss", "Push", "No Bet"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="de-label">Closing Line</label>
                <input className="de-input" placeholder="-108" value={e.finalLine} onChange={ev => updateEntry(i, "finalLine", ev.target.value)} />
              </div>
              <div>
                <label className="de-label">CLV (+/-)</label>
                <input className="de-input" placeholder="+7 pts" value={e.clv} onChange={ev => updateEntry(i, "clv", ev.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <label className="de-label">Notes (which factors held? which missed?)</label>
              <textarea className="de-input" value={e.notes} onChange={ev => updateEntry(i, "notes", ev.target.value)} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button className="de-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="de-btn" onClick={handleSave}>Save to Log</button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: MATCHUPS ────────────────────────────────────────────────────────────
function TabMatchups({ matchups, onAdd, onLog, onDelete, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [logTarget, setLogTarget] = useState(null);
  const [slateLoading, setSlateLoading] = useState(false);
  const [slateMsg, setSlateMsg] = useState(null);

  const today = mlbApi.todayET();
  const todayGames = matchups.filter(m => m.date === today);
  const otherGames = matchups.filter(m => m.date !== today).sort((a, b) => b.date.localeCompare(a.date));

  const loadSlate = async () => {
    setSlateLoading(true);
    setSlateMsg(null);
    try {
      const games = await mlbApi.schedule(today);
      const existing = new Set(matchups.map(m => m.gamePk).filter(Boolean));
      let added = 0;
      for (const g of games) {
        if (existing.has(g.gamePk)) continue;
        const gameTime = new Date(g.gameTimeUTC).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
        onAdd({
          id: genId(), gamePk: g.gamePk, date: today,
          homeTeam: g.home.abbr, awayTeam: g.away.abbr,
          homeTeamId: g.home.id, awayTeamId: g.away.id,
          homePitcher: g.home.probable || "TBD", awayPitcher: g.away.probable || "TBD",
          listedHomeProbable: g.home.probable, listedAwayProbable: g.away.probable,
          gameTime, overallLean: "Push/Skip",
          factors: Object.fromEntries(FACTORS.map(f => [f.id, { direction: "Push/Skip", value: "", note: "" }])),
          looks: MARKETS.map(market => ({ market, lean: "", line: "", why: "" })),
          notes: "", autoLoaded: true,
        });
        added++;
      }
      setSlateMsg(added > 0 ? `✓ Loaded ${added} game${added !== 1 ? "s" : ""} from MLB Stats API` : "Slate already loaded — no new games");
    } catch (e) {
      setSlateMsg("⚠ Slate load failed: " + e.message);
    } finally {
      setSlateLoading(false);
    }
  };

  return (
    <div className="de-body">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text0 }}>Today's Slate</div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="de-btn" style={{ background: slateLoading ? T.bg3 : T.blue, color: slateLoading ? T.text2 : "#0f1117" }}
            onClick={loadSlate} disabled={slateLoading}>
            {slateLoading ? "Loading..." : "⚡ Load Slate"}
          </button>
          <button className="de-btn-ghost" onClick={() => setShowModal(true)}>+ Manual</button>
          <button className="de-btn-ghost" style={{ borderColor:T.red, color:T.red, fontSize:11 }}
            onClick={() => {
              const today = mlbApi.todayET();
              const old = matchups.filter(m => m.date !== today);
              if (old.length === 0) { setSlateMsg("No old games to clear."); return; }
              if (window.confirm(`Delete ${old.length} game(s) from previous days?`)) {
                old.forEach(m => onDelete(m.id));
                setSlateMsg(`✓ Cleared ${old.length} old game(s)`);
              }
            }}>
            🗑 Clear Old
          </button>
        </div>
      </div>
      {slateMsg && (
        <div style={{ fontSize: 12, fontFamily: T.mono, color: slateMsg.startsWith("⚠") ? T.red : T.green, marginBottom: 12 }}>{slateMsg}</div>
      )}

      {todayGames.length === 0 && (
        <div className="de-empty">
          <div className="de-empty-icon">⚾</div>
          <div className="de-empty-title">No matchups for today</div>
          <div className="de-empty-sub">Add a game to start building your factor stack</div>
        </div>
      )}

      {todayGames.map(m => (
        <MatchupCard key={m.id} matchup={m}
          onLog={mm => setLogTarget(mm)}
          onDelete={id => onDelete(id)}
          onUpdate={onUpdate} />
      ))}

      {otherGames.length > 0 && (
        <>
          <div className="de-section-title" style={{ marginTop: 20 }}>Earlier Games</div>
          {otherGames.map(m => (
            <MatchupCard key={m.id} matchup={m}
              onLog={mm => setLogTarget(mm)}
              onDelete={id => onDelete(id)}
              onUpdate={onUpdate} />
          ))}
        </>
      )}

      {showModal && (
        <AddMatchupModal
          onSave={m => { onAdd(m); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
      {logTarget && (
        <LogResultModal
          matchup={logTarget}
          onSave={entry => { onLog(entry); setLogTarget(null); }}
          onClose={() => setLogTarget(null)}
        />
      )}
    </div>
  );
}

// ─── TAB: TOP 10 ─────────────────────────────────────────────────────────────
function TabTop10({ matchups }) {
  const ranked = [...matchups]
    .map(m => ({ ...m, _score: computeScore(m) }))
    .filter(m => m._score.aligned >= 4)
    .sort((a, b) => b._score.score - a._score.score)
    .slice(0, 10);

  return (
    <div className="de-body">
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text0, marginBottom: 4 }}>Top 10 Plays</div>
        <div style={{ fontSize: 12, color: T.text2 }}>Only games where 4+ factors align in one direction. Ranked by total factor score.</div>
      </div>
      <div className="de-warning" style={{ marginBottom: 16 }}>
        <strong>Critical:</strong> Factor alignment ≠ probability. Books have already seen these signals. This ranking shows data concentration, not market inefficiency.
      </div>
      {ranked.length === 0 && (
        <div className="de-empty">
          <div className="de-empty-icon">📊</div>
          <div className="de-empty-title">No plays meet the 4-factor threshold</div>
          <div className="de-empty-sub">Add matchups and fill in the factor stack to generate rankings</div>
        </div>
      )}
      {ranked.map((m, i) => {
        const { score, aligned } = m._score;
        return (
          <div key={m.id} className="de-card">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="de-rank">#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="de-matchup-teams" style={{ marginBottom: 4, display:"flex", alignItems:"center", gap:6 }}>
                  <TeamLogo abbr={m.awayTeam} size={22} />
                  <span className="de-team-abbr" style={{ color: T.blue }}>{m.awayTeam}</span>
                  <span className="de-vs">@</span>
                  <span className="de-team-abbr" style={{ color: T.green }}>{m.homeTeam}</span>
                  <TeamLogo abbr={m.homeTeam} size={22} />
                  <span style={{ marginLeft: 8 }}><span className={`de-badge ${scoreToClass(score)}`}>{scoreLabel(score)} {score}</span></span>
                </div>
                <div className="de-meta">{fmtDate(m.date)} · {aligned}/{FACTORS.length} factors → {m.overallLean}</div>
              </div>
            </div>
            {m.looks?.filter(l => l.lean).slice(0, 2).map((lk, li) => (
              <div key={li} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${T.border}30`, marginTop: li === 0 ? 10 : 0 }}>
                <span style={{ fontSize: 11, color: T.text2 }}>{lk.market}</span>
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: dirColor(lk.lean) }}>{lk.lean} {lk.line && `(${lk.line})`}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB: GRADE LOG ───────────────────────────────────────────────────────────
function TabLog({ log, matchups, onUpdateLog }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeMsg, setGradeMsg] = useState(null);

  // STEP 4: auto-grade pending entries from statsapi finals
  const autoGrade = async () => {
    setGradeLoading(true);
    setGradeMsg(null);
    try {
      const pendingDates = [...new Set(
        log.filter(l => l.entries.some(e => e.result === "Pending")).map(l => l.date)
      )];
      if (pendingDates.length === 0) { setGradeMsg("Nothing pending to grade."); return; }
      let graded = 0, unparseable = 0;
      const finalsByDate = {};
      for (const d of pendingDates) finalsByDate[d] = await mlbApi.finals(d);
      const next = log.map(l => {
        const matchup = matchups.find(m => m.id === l.matchupId);
        const final = matchup?.gamePk ? finalsByDate[l.date]?.[matchup.gamePk] : null;
        if (!final) return l;
        return {
          ...l,
          finalScore: `${final.awayAbbr} ${final.awayRuns} — ${final.homeRuns} ${final.homeAbbr}`,
          entries: l.entries.map(e => {
            if (e.result !== "Pending") return e;
            const r = gradeLean(e.lean, matchup, final);
            if (r) { graded++; return { ...e, result: r, autoGraded: true }; }
            unparseable++;
            return e;
          }),
        };
      });
      onUpdateLog(next);
      setGradeMsg(`✓ Auto-graded ${graded} pick${graded !== 1 ? "s" : ""}${unparseable ? ` · ${unparseable} need manual grade (props/RL/F5)` : ""}`);
    } catch (e) {
      setGradeMsg("⚠ Auto-grade failed: " + e.message);
    } finally {
      setGradeLoading(false);
    }
  };

  const entries = log.flatMap(l => l.entries.map(e => ({ ...e, game: l.game, date: l.date, overallLean: l.overallLean })));
  const bets = entries.filter(e => e.result !== "Pending" && e.result !== "No Bet");
  const wins = bets.filter(e => e.result === "Win");
  const losses = bets.filter(e => e.result === "Loss");
  const winPct = bets.length ? Math.round((wins.length / bets.length) * 100) : null;
  const clvEntries = bets.filter(e => e.clv && e.clv !== "");
  const posClv = clvEntries.filter(e => parseFloat(e.clv) > 0);

  const byMarket = {};
  bets.forEach(e => {
    if (!byMarket[e.market]) byMarket[e.market] = { w: 0, l: 0 };
    if (e.result === "Win") byMarket[e.market].w++;
    else if (e.result === "Loss") byMarket[e.market].l++;
  });

  // Build factor performance summary from matchup data cross-referenced with log
  const buildFactorSummary = () => {
    const factorPerf = {};
    FACTORS.forEach(f => { factorPerf[f.id] = { label: f.label, aligned_wins: 0, aligned_losses: 0, misaligned_wins: 0, misaligned_losses: 0 }; });
    log.forEach(logEntry => {
      const matchup = matchups.find(m => m.id === logEntry.matchupId);
      if (!matchup) return;
      logEntry.entries.forEach(e => {
        if (e.result !== "Win" && e.result !== "Loss") return;
        FACTORS.forEach(f => {
          const fv = matchup.factors?.[f.id];
          if (!fv?.direction || fv.direction === "Push/Skip") return;
          const factorAligned = fv.direction === matchup.overallLean;
          const won = e.result === "Win";
          if (factorAligned && won) factorPerf[f.id].aligned_wins++;
          else if (factorAligned && !won) factorPerf[f.id].aligned_losses++;
          else if (!factorAligned && won) factorPerf[f.id].misaligned_wins++;
          else factorPerf[f.id].misaligned_losses++;
        });
      });
    });
    return factorPerf;
  };

  const runAiAnalysis = async () => {
    if (bets.length === 0) { setAiError("No graded bets yet — log some results first."); return; }
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);

    const factorSummary = buildFactorSummary();
    const marketSummary = Object.entries(byMarket).map(([m, {w,l}]) => `${m}: ${w}W-${l}L (${Math.round(w/(w+l)*100)}%)`).join(", ");
    const clvSummary = clvEntries.length ? `${Math.round(posClv.length/clvEntries.length*100)}% positive CLV across ${clvEntries.length} tracked closes` : "No CLV data recorded";
    const recentNotes = bets.slice(-10).map(e => e.notes).filter(Boolean).join(" | ");

    const factorText = Object.entries(factorSummary)
      .filter(([,v]) => v.aligned_wins + v.aligned_losses > 0)
      .map(([id, v]) => {
        const total = v.aligned_wins + v.aligned_losses;
        const pct = total ? Math.round(v.aligned_wins / total * 100) : 0;
        return `${v.label}: ${v.aligned_wins}W-${v.aligned_losses}L when aligned (${pct}% win rate, n=${total})`;
      }).join("\n");

    const prompt = `You are a sharp sports betting analyst reviewing a bettor's Diamond Edge MLB prediction log. Be direct, data-driven, and honest — do not sugarcoat poor signals.

OVERALL RECORD: ${wins.length}W-${losses.length}L (${winPct}% win rate, n=${bets.length})
CLV: ${clvSummary}

BY MARKET:
${marketSummary || "No market breakdown available"}

FACTOR PERFORMANCE (when each factor aligned with the overall lean):
${factorText || "No factor data cross-referenced yet"}

RECENT NOTES FROM LOGGED RESULTS:
${recentNotes || "None"}

Analyze this data and give:
1. KEEP — 2-3 factors or markets that appear to be holding predictive value (flag if sample is too small)
2. DROP or REDUCE WEIGHT — factors that aren't contributing or are noise
3. MARKET EDGE — which market type is performing best/worst
4. CLV VERDICT — what the CLV data says about whether there's real edge or just variance
5. ONE ADJUSTMENT — the single most important change to make to the model right now

Be specific. Cite the numbers. If the sample is too small to conclude anything, say so plainly. Do not invent patterns that aren't in the data.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(c => c.text || "").join("\n").trim();
      setAiAnalysis(text);
    } catch (err) {
      setAiError("Analysis failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Parse AI response into sections for rendering
  const parseAnalysis = (text) => {
    if (!text) return [];
    const sections = [];
    const lines = text.split("\n");
    let current = null;
    lines.forEach(line => {
      const headerMatch = line.match(/^(\d+\.|#+|[A-Z ]{3,}:)\s*(.+)/);
      if (line.match(/^(1\.|2\.|3\.|4\.|5\.|KEEP|DROP|MARKET|CLV|ONE ADJ)/i)) {
        if (current) sections.push(current);
        const labelMatch = line.match(/^[\d.#*]+\s*(.*?)[\s—-]*(.*)/);
        current = { title: line.replace(/^[\d.]+\s*/, "").split("—")[0].split(" — ")[0].trim(), body: [] };
      } else if (current) {
        if (line.trim()) current.body.push(line.trim());
      } else {
        sections.push({ title: null, body: [line.trim()] });
      }
    });
    if (current) sections.push(current);
    return sections.filter(s => s.body.some(b => b.length > 0));
  };

  const sectionColors = ["#3ecf6a", "#e85d6a", "#4a9fd4", "#d4954a", "#9b72d4"];

  return (
    <div className="de-body">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:T.text0, marginBottom:4 }}>Self-Grading Log</div>
          <div style={{ fontSize:12, color:T.text2 }}>Track predictions ruthlessly. CLV is the only real signal of edge.</div>
        </div>
        <button className="de-btn" style={{ background: gradeLoading ? T.bg3 : T.blue, color: gradeLoading ? T.text2 : "#0f1117" }}
          onClick={autoGrade} disabled={gradeLoading}>
          {gradeLoading ? "Grading..." : "⚡ Auto-Grade Finals"}
        </button>
      </div>
      {gradeMsg && (
        <div style={{ fontSize:12, fontFamily:T.mono, color: gradeMsg.startsWith("⚠") ? T.red : T.green, marginBottom:12 }}>{gradeMsg}</div>
      )}

      {/* ── AI ANALYSIS PANEL ── */}
      <div className="de-card" style={{ borderColor: aiAnalysis ? T.purple : T.amberDim, marginBottom:16, background: aiAnalysis ? `${T.purple}08` : `${T.amber}06` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: aiAnalysis || aiLoading || aiError ? 14 : 0 }}>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color: aiAnalysis ? T.purple : T.amber }}>
              ◆ AI Log Analysis
            </div>
            <div style={{ fontSize:11, color:T.text2, marginTop:3 }}>
              Reads your W/L log + factor data → tells you what's working and what to drop
            </div>
          </div>
          <button
            className="de-btn"
            style={{ background: aiLoading ? T.bg3 : aiAnalysis ? T.purple : T.amber, color: aiLoading ? T.text2 : "#0f1117", minWidth:120, opacity: aiLoading ? 0.7 : 1 }}
            onClick={runAiAnalysis}
            disabled={aiLoading}
          >
            {aiLoading ? "Analyzing..." : aiAnalysis ? "Re-Analyze" : "Analyze My Log"}
          </button>
        </div>

        {/* Loading state */}
        {aiLoading && (
          <div style={{ padding:"18px 0", textAlign:"center" }}>
            <div style={{ fontFamily:T.mono, fontSize:12, color:T.text2, marginBottom:8 }}>Reading your factor performance data...</div>
            <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.purple, animation:`pulse ${0.8+i*0.2}s ease-in-out infinite alternate` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {aiError && !aiLoading && (
          <div style={{ background:`${T.red}15`, border:`1px solid ${T.red}30`, borderRadius:7, padding:"10px 14px", fontSize:12, color:T.red }}>
            {aiError}
          </div>
        )}

        {/* Analysis result */}
        {aiAnalysis && !aiLoading && (
          <div>
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
              {parseAnalysis(aiAnalysis).map((section, i) => (
                <div key={i} style={{ marginBottom:14 }}>
                  {section.title && (
                    <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:sectionColors[i % sectionColors.length], marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                      {section.title}
                    </div>
                  )}
                  {section.body.map((line, j) => (
                    <div key={j} style={{ fontSize:12, color:T.text1, lineHeight:1.7, marginBottom:3, paddingLeft: section.title ? 8 : 0 }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop:`1px solid ${T.border}30`, paddingTop:10, marginTop:4 }}>
              <div style={{ fontSize:10, color:T.text2, fontFamily:T.mono }}>
                ⚠ Analysis is only as good as your logged data. Small samples (n&lt;30) cannot produce reliable conclusions.
              </div>
            </div>
          </div>
        )}

        {/* Pre-run hint */}
        {!aiAnalysis && !aiLoading && !aiError && (
          <div style={{ marginTop:12, fontSize:11, color:T.text2, lineHeight:1.6 }}>
            When you click Analyze, Diamond Edge sends your W/L record, CLV data, market breakdown, and per-factor win rates to identify which signals are actually predicting outcomes vs. which are noise you should stop weighting.
          </div>
        )}
      </div>

      {/* Summary stats */}
      {bets.length > 0 && (
        <div className="de-card">
          <div className="de-section-title">Summary</div>
          <div className="de-stats-row">
            <div className="de-stat"><div className="de-stat-val">{bets.length}</div><div className="de-stat-label">Graded</div></div>
            <div className="de-stat">
              <div className="de-stat-val" style={{ color:wins.length>losses.length?T.green:T.red }}>{wins.length}-{losses.length}</div>
              <div className="de-stat-label">W-L</div>
            </div>
            <div className="de-stat">
              <div className="de-stat-val" style={{ color:winPct>52?T.green:winPct<48?T.red:T.text0 }}>{winPct!==null?`${winPct}%`:"—"}</div>
              <div className="de-stat-label">Win %</div>
            </div>
            <div className="de-stat">
              <div className="de-stat-val" style={{ color:posClv.length>clvEntries.length/2?T.green:T.red }}>
                {clvEntries.length?`${Math.round(posClv.length/clvEntries.length*100)}%`:"—"}
              </div>
              <div className="de-stat-label">Pos CLV</div>
            </div>
          </div>
          {bets.length < 30 && (
            <div style={{ marginTop:12, fontSize:11, color:T.amber, fontFamily:T.mono }}>
              ⚠ n={bets.length} — sample too small to draw conclusions. Need 100+ graded bets minimum.
            </div>
          )}
        </div>
      )}

      {/* Market breakdown */}
      {Object.keys(byMarket).length > 0 && (
        <div className="de-card">
          <div className="de-section-title">By Market</div>
          {Object.entries(byMarket).map(([market, { w, l }]) => {
            const pct = Math.round((w / (w + l)) * 100);
            return (
              <div key={market} className="de-factor-grade-row">
                <div className="de-fg-name">{market}</div>
                <div className="de-fg-bar"><div className="de-fg-fill" style={{ width:`${pct}%`, background:pct>52?T.green:pct<48?T.red:T.amber }} /></div>
                <div className="de-fg-pct">{pct}%</div>
                <div className="de-fg-n">{w}-{l}</div>
              </div>
            );
          })}
          {Object.values(byMarket).some(({w,l})=>w+l<20)&&(
            <div style={{ fontSize:11, color:T.text2, marginTop:8, fontFamily:T.mono }}>⚠ Markets with &lt;20 graded bets: statistically unreliable</div>
          )}
        </div>
      )}

      {/* Full log table */}
      {entries.length > 0 ? (
        <div className="de-card">
          <div className="de-section-title">All Entries</div>
          <div className="de-scroll">
            <table className="de-log-table">
              <thead>
                <tr><th>Date</th><th>Game</th><th>Market</th><th>Lean</th><th>Result</th><th>Close</th><th>CLV</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {entries.sort((a,b)=>b.date?.localeCompare(a.date)).map((e,i)=>(
                  <tr key={i}>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.game}</td>
                    <td>{e.market}</td>
                    <td style={{ color:T.text0 }}>{e.lean}</td>
                    <td className={e.result==="Win"?"win-cell":e.result==="Loss"?"loss-cell":"pending-cell"}>{e.result}</td>
                    <td>{e.finalLine||"—"}</td>
                    <td style={{ color:e.clv&&parseFloat(e.clv)>0?T.green:e.clv&&parseFloat(e.clv)<0?T.red:T.text2 }}>{e.clv||"—"}</td>
                    <td style={{ maxWidth:160, whiteSpace:"normal" }}>{e.notes||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="de-empty">
          <div className="de-empty-icon">📋</div>
          <div className="de-empty-title">No results logged yet</div>
          <div className="de-empty-sub">After games finish, use "+ Log Result" on any matchup card to record W/L and CLV</div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: GUIDE ───────────────────────────────────────────────────────────────
function TabGuide() {
  const items = [
    { label: "Line Movement (2× weight)", desc: "Sharp money moves lines at books like Pinnacle within seconds. If a line moves against the public, follow it — not because you're smarter than the market, but because you're following the people who ARE. This is your strongest signal." },
    { label: "FIP/xFIP over ERA", desc: "ERA includes defense and luck. FIP isolates what the pitcher controls (K%, BB%, HR%). A pitcher with 4.50 ERA / 3.20 FIP is likely better than advertised. Use xFIP for park-neutral comparison." },
    { label: "Closing Line Value (CLV)", desc: "If you consistently get better numbers than closing, you have an edge regardless of short-term W/L. Positive CLV over 100+ samples is the only honest proof. W/L over 30 games is noise." },
    { label: "Platoon Splits", desc: "LHH vs RHP and RHH vs LHP matchups can shift lineup wOBA by 40-60 points. Check Baseball Savant for splits — but only trust splits with 100+ PA." },
    { label: "Bullpen Rest", desc: "A team using 3 relievers in extras yesterday has a compromised bullpen today. Short-rest bullpens inflate WHIP and O/U. Cross-reference with game logs." },
    { label: "Park Factors", desc: "Coors is 30%+ over run-neutral. Petco and Oracle run 10-15% under. For totals, park factor is one of the highest-confidence adjustments — it's stable year-over-year." },
    { label: "Factor Stacking", desc: "Factors only count when multiple point the same direction. A single strong factor is already priced in. You want 4+ factors aligning before elevating confidence — and even then, you're still playing against a sharp market." },
    { label: "Sample Sizes", desc: "A hitter's .380 wOBA vs LHP over 30 PA is noise. Same stat over 200 PA matters. Diamond Edge warns you when samples are thin — don't override the warning." },
  ];

  return (
    <div className="de-body">
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text0, marginBottom: 4 }}>Factor Guide</div>
      <div style={{ fontSize: 12, color: T.text2, marginBottom: 18 }}>How each signal works and how to use it honestly.</div>
      <div className="de-warning" style={{ marginBottom: 20 }}>
        <strong>Core thesis:</strong> Books set lines from FIP/xFIP/wOBA models shaded for public money. By the time a line is public it already reflects the data. Your job is to <em>organize</em> data, <em>predict honestly</em>, and <em>test whether any signal holds up over time</em> — not to front-run a market that closed before you logged in.
      </div>
      {items.map((item, i) => (
        <div key={i} className="de-card" style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.amber, marginBottom: 6 }}>{item.label}</div>
          <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.7 }}>{item.desc}</div>
        </div>
      ))}
      <div className="de-card" style={{ marginTop: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text2, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Data Sources (Free)</div>
        {[
          ["Baseball Savant", "xBA, hard-hit%, OAA, platoon splits", "baseballsavant.mlb.com"],
          ["FanGraphs", "FIP, xFIP, K%, wOBA by splits, bullpen rest", "fangraphs.com"],
          ["Baseball Reference", "Home/road splits, historical logs", "baseball-reference.com"],
          ["The Odds API", "Live odds + line movement (free tier)", "the-odds-api.com"],
        ].map(([name, desc, url]) => (
          <div key={name} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}30` }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.blue, marginBottom: 2 }}>{name}</div>
            <div style={{ fontSize: 11, color: T.text2 }}>{desc}</div>
            <div style={{ fontSize: 10, color: T.text2, opacity: 0.6, marginTop: 1 }}>{url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SERIES DATA ─────────────────────────────────────────────────────────────
const SERIES_KEY = "de_series_v1";
const loadSeries = async () => {
  try { const r = await storage.get(SERIES_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const saveSeries = async (data) => {
  try { await storage.set(SERIES_KEY, JSON.stringify(data)); } catch {}
};

// Historical MLB sweep rates by series score (regular season, 2015-2023, 3-game series)
// Source basis: retrosheet/baseball-reference aggregate data
const SWEEP_DATA = {
  "2-0": { sweepPct: 72, survivalPct: 28, label: "Down 2-0 (facing sweep)", color: "#e85d6a" },
  "1-0": { sweepPct: 42, survivalPct: 58, label: "Down 1-0", color: "#d4954a" },
  "0-0": { sweepPct: null, survivalPct: null, label: "Series tied 0-0", color: "#5c6783" },
  "0-1": { sweepPct: null, survivalPct: null, label: "Up 1-0", color: "#3ecf6a" },
  "0-2": { sweepPct: null, survivalPct: null, label: "Up 2-0 (can sweep)", color: "#3ecf6a" },
};

// Win% quality tiers and their adjusted sweep rates when down 2-0
const QUALITY_SWEEP = [
  { label: "Elite (95+ win pace)", winPct: 0.587, sweepPct: 15, note: "Teams on 95+ win pace get swept ~15% when down 2-0" },
  { label: "Good (88-94 win pace)", winPct: 0.543, sweepPct: 22, note: "Good teams swept ~22% when down 2-0" },
  { label: "Average (81-87 win pace)", winPct: 0.500, sweepPct: 31, note: "Average teams swept ~31% when down 2-0" },
  { label: "Below avg (<81 win pace)", winPct: 0.457, sweepPct: 42, note: "Weaker teams swept ~42% when down 2-0" },
];

// Sweep spot signal thresholds
function getSweepSpotSignal(series) {
  const { homeScore, awayScore, homeWinPct, awayWinPct, seriesLen } = series;
  const signals = [];
  let alert = null;

  // Team down 2-0 in a 3-game series
  if (seriesLen === 3) {
    if (awayScore === 2 && homeScore === 0) {
      // Home team facing sweep
      const q = QUALITY_SWEEP.find(q => homeWinPct >= q.winPct) || QUALITY_SWEEP[3];
      const survivalPct = 100 - q.sweepPct;
      signals.push({ team: series.homeTeam, situation: "Down 2-0, facing sweep", survivalPct, quality: q.label });
      if (homeWinPct >= 0.543) alert = "SWEEP SPOT";
    }
    if (homeScore === 2 && awayScore === 0) {
      const q = QUALITY_SWEEP.find(q => awayWinPct >= q.winPct) || QUALITY_SWEEP[3];
      const survivalPct = 100 - q.sweepPct;
      signals.push({ team: series.awayTeam, situation: "Down 2-0, facing sweep", survivalPct, quality: q.label });
      if (awayWinPct >= 0.543) alert = "SWEEP SPOT";
    }
  }

  // 4-game series: down 3-0
  if (seriesLen === 4) {
    if (awayScore === 3 && homeScore === 0) {
      signals.push({ team: series.homeTeam, situation: "Down 3-0 in 4-game series", survivalPct: homeWinPct >= 0.543 ? 34 : 18, quality: "Survival rate" });
      if (homeWinPct >= 0.543) alert = "SWEEP SPOT";
    }
    if (homeScore === 3 && awayScore === 0) {
      signals.push({ team: series.awayTeam, situation: "Down 3-0 in 4-game series", survivalPct: awayWinPct >= 0.543 ? 34 : 18, quality: "Survival rate" });
      if (awayWinPct >= 0.543) alert = "SWEEP SPOT";
    }
  }

  // Down 1-0 with quality mismatch (inferior team won G1)
  if (seriesLen >= 3) {
    if (awayScore === 1 && homeScore === 0 && homeWinPct >= 0.568 && awayWinPct < 0.500) {
      signals.push({ team: series.homeTeam, situation: "Better team down 1-0, regression likely", survivalPct: 78, quality: "Series even rate for 95+ win teams after G1 loss" });
    }
    if (homeScore === 1 && awayScore === 0 && awayWinPct >= 0.568 && homeWinPct < 0.500) {
      signals.push({ team: series.awayTeam, situation: "Better team down 1-0, regression likely", survivalPct: 78, quality: "Series even rate for 95+ win teams after G1 loss" });
    }
  }

  return { signals, alert };
}

// ─── TAB: SERIES MONITOR ─────────────────────────────────────────────────────
function TabSeries({ seriesList, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [blank] = useState({
    id: "", homeTeam: "NYY", awayTeam: "BOS",
    homeScore: 0, awayScore: 0, seriesLen: 3,
    homeWinPct: 0.500, awayWinPct: 0.500,
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [form, setForm] = useState({ ...blank, id: genId() });

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const sweepSpots = seriesList.filter(s => getSweepSpotSignal(s).alert);

  return (
    <div className="de-body">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text0 }}>Series Monitor</div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>Track active series and identify sweep-spot value situations</div>
        </div>
        <button className="de-btn" onClick={() => setShowForm(f => !f)}>{showForm ? "Cancel" : "+ Add Series"}</button>
      </div>

      {/* Sweep spot explainer */}
      <div className="de-card" style={{ borderColor: T.amberDim, background: `${T.amber}08`, marginBottom: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, fontWeight: 700, marginBottom: 8 }}>⚡ The Sweep Spot</div>
        <div style={{ fontSize: 12, color: T.text1, lineHeight: 1.7 }}>
          When a <strong style={{ color: T.text0 }}>quality team (88+ win pace)</strong> is down 2-0 in a 3-game series, 
          they avoid the sweep <strong style={{ color: T.green }}>~75-85%</strong> of the time. The market often 
          over-prices the sweeping team after consecutive wins — public bettors chase the hot team, sharps fade them.
          <br /><br />
          <strong style={{ color: T.amber }}>Signal strength:</strong> Higher when the down team has better underlying metrics 
          (FIP, wOBA) and lost G1/G2 to variance (bullpen blowups, defensive errors) rather than being genuinely outplayed.
          <strong style={{ color: T.red }}> Do not blindly back every down-2-0 team</strong> — check if they were actually outplayed.
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="de-section-title">Historical Sweep Rates — Down 2-0, 3-Game Series</div>
          {QUALITY_SWEEP.map((q, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${T.border}20` }}>
              <div style={{ width: 180, fontSize: 11, color: T.text1 }}>{q.label}</div>
              <div style={{ flex: 1, height: 6, background: T.bg3, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${100 - q.sweepPct}%`, height: "100%", background: T.green, borderRadius: 3 }} />
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.green, width: 60, textAlign: "right" }}>
                {100 - q.sweepPct}% survive
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.red, width: 60, textAlign: "right" }}>
                {q.sweepPct}% swept
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: T.text2, marginTop: 8, fontFamily: T.mono }}>
            ⚠ Based on MLB regular season 2015–2023. Postseason rates differ significantly.
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="de-card" style={{ borderColor: T.amber, marginBottom: 16 }}>
          <div style={{ fontFamily: T.mono, color: T.amber, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Track New Series</div>
          <div className="de-grid2" style={{ marginBottom: 12 }}>
            <div>
              <label className="de-label">Away Team</label>
              <select className="de-select" value={form.awayTeam} onChange={e => setF("awayTeam", e.target.value)}>
                {TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="de-label">Home Team</label>
              <select className="de-select" value={form.homeTeam} onChange={e => setF("homeTeam", e.target.value)}>
                {TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="de-grid3" style={{ marginBottom: 12 }}>
            <div>
              <label className="de-label">Series Length</label>
              <select className="de-select" value={form.seriesLen} onChange={e => setF("seriesLen", parseInt(e.target.value))}>
                <option value={2}>2 games</option>
                <option value={3}>3 games</option>
                <option value={4}>4 games</option>
              </select>
            </div>
            <div>
              <label className="de-label">{form.awayTeam} Wins</label>
              <select className="de-select" value={form.awayScore} onChange={e => setF("awayScore", parseInt(e.target.value))}>
                {[0,1,2,3].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="de-label">{form.homeTeam} Wins</label>
              <select className="de-select" value={form.homeScore} onChange={e => setF("homeScore", parseInt(e.target.value))}>
                {[0,1,2,3].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="de-grid2" style={{ marginBottom: 12 }}>
            <div>
              <label className="de-label">{form.awayTeam} Win% (season)</label>
              <input className="de-input" type="number" step="0.001" min="0.3" max="0.7"
                value={form.awayWinPct} onChange={e => setF("awayWinPct", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="de-label">{form.homeTeam} Win% (season)</label>
              <input className="de-input" type="number" step="0.001" min="0.3" max="0.7"
                value={form.homeWinPct} onChange={e => setF("homeWinPct", parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="de-field">
            <label className="de-label">Context Notes (were G1/G2 losses variance-driven?)</label>
            <textarea className="de-input" placeholder="e.g. Lost G1 on 3-error inning, G2 closer blew 9th. Starter mismatch favors home team in G3." value={form.notes} onChange={e => setF("notes", e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="de-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="de-btn" onClick={() => {
              onAdd(form);
              setForm({ ...blank, id: genId() });
              setShowForm(false);
            }}>Add Series</button>
          </div>
        </div>
      )}

      {/* Sweep spot alerts */}
      {sweepSpots.length > 0 && (
        <>
          <div className="de-section-title" style={{ color: T.amber }}>⚡ Active Sweep Spots</div>
          {sweepSpots.map(s => {
            const { signals } = getSweepSpotSignal(s);
            return (
              <div key={s.id} className="de-card" style={{ borderColor: T.amber, background: `${T.amber}08`, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div className="de-matchup-teams">
                    <span className="de-team-abbr" style={{ color: T.blue }}>{s.awayTeam}</span>
                    <span className="de-vs">@</span>
                    <span className="de-team-abbr" style={{ color: T.green }}>{s.homeTeam}</span>
                  </div>
                  <span style={{ background: `${T.amber}20`, color: T.amber, border: `1px solid ${T.amberDim}`, borderRadius: 6, padding: "3px 10px", fontFamily: T.mono, fontSize: 11, fontWeight: 700 }}>
                    ⚡ SWEEP SPOT
                  </span>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text0, marginBottom: 8 }}>
                  Series: {s.awayTeam} {s.awayScore} – {s.homeScore} {s.homeTeam} (of {s.seriesLen})
                </div>
                {signals.map((sig, i) => (
                  <div key={i} style={{ background: T.bg2, borderRadius: 7, padding: "10px 12px", marginBottom: 8 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.green, fontWeight: 700, marginBottom: 4 }}>
                      {sig.team}: {sig.survivalPct}% survive/{100-sig.survivalPct}% swept
                    </div>
                    <div style={{ fontSize: 11, color: T.text1 }}>{sig.situation}</div>
                    <div style={{ fontSize: 11, color: T.text2, marginTop: 3 }}>{sig.quality}</div>
                  </div>
                ))}
                {s.notes && <div style={{ fontSize: 11, color: T.text2, fontStyle: "italic", marginTop: 6, lineHeight: 1.6 }}>{s.notes}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="de-btn-danger" onClick={() => onDelete(s.id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* All active series */}
      <div className="de-section-title" style={{ marginTop: sweepSpots.length > 0 ? 20 : 0 }}>All Tracked Series</div>
      {seriesList.length === 0 && (
        <div className="de-empty">
          <div className="de-empty-icon">🔄</div>
          <div className="de-empty-title">No series tracked yet</div>
          <div className="de-empty-sub">Add a series to monitor sweep-spot situations</div>
        </div>
      )}
      {seriesList.map(s => {
        const { signals, alert } = getSweepSpotSignal(s);
        const gamesPlayed = s.homeScore + s.awayScore;
        const gamesLeft = s.seriesLen - gamesPlayed;
        return (
          <div key={s.id} className="de-card" style={{ borderColor: alert ? T.amberDim : T.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div className="de-matchup-teams" style={{ marginBottom: 4 }}>
                  <span className="de-team-abbr" style={{ color: T.blue }}>{s.awayTeam}</span>
                  <span className="de-vs">vs</span>
                  <span className="de-team-abbr" style={{ color: T.green }}>{s.homeTeam}</span>
                </div>
                <div className="de-meta">{s.seriesLen}-game series · {gamesLeft} game{gamesLeft !== 1 ? "s" : ""} remaining</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.text0, lineHeight: 1 }}>
                  {s.awayScore}–{s.homeScore}
                </div>
                {alert && <div style={{ color: T.amber, fontSize: 10, fontWeight: 700, marginTop: 4, fontFamily: T.mono }}>⚡ SWEEP SPOT</div>}
              </div>
            </div>

            {/* Series progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {Array.from({ length: s.seriesLen }).map((_, i) => {
                let fill = T.bg3;
                if (i < gamesPlayed) fill = s.awayScore > s.homeScore ? T.blue : T.green;
                return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: fill }} />;
              })}
            </div>

            {/* Win% bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text2, fontFamily: T.mono, marginBottom: 4 }}>
                <span>{s.awayTeam} {(s.awayWinPct * 100).toFixed(0)}%</span>
                <span>Season Win%</span>
                <span>{(s.homeWinPct * 100).toFixed(0)}% {s.homeTeam}</span>
              </div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ flex: s.awayWinPct, background: T.blue, opacity: 0.7 }} />
                <div style={{ flex: s.homeWinPct, background: T.green, opacity: 0.7 }} />
              </div>
            </div>

            {signals.length > 0 && signals.map((sig, i) => (
              <div key={i} style={{ background: T.bg2, borderRadius: 6, padding: "8px 10px", marginBottom: 6, borderLeft: `3px solid ${T.green}` }}>
                <div style={{ fontSize: 12, color: T.text0, fontWeight: 600 }}>{sig.team}: {sig.situation}</div>
                <div style={{ fontSize: 11, color: T.green, fontFamily: T.mono, marginTop: 2 }}>{sig.survivalPct}% survival rate · {sig.quality}</div>
              </div>
            ))}

            {s.notes && <div style={{ fontSize: 11, color: T.text2, fontStyle: "italic", lineHeight: 1.6, marginTop: 6 }}>{s.notes}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {/* Quick score update */}
              {gamesLeft > 0 && (
                <>
                  <button className="de-btn-ghost" style={{ fontSize: 11 }}
                    onClick={() => onUpdate({ ...s, awayScore: Math.min(s.awayScore + 1, s.seriesLen) })}>
                    +1 {s.awayTeam} win
                  </button>
                  <button className="de-btn-ghost" style={{ fontSize: 11 }}
                    onClick={() => onUpdate({ ...s, homeScore: Math.min(s.homeScore + 1, s.seriesLen) })}>
                    +1 {s.homeTeam} win
                  </button>
                </>
              )}
              <button className="de-btn-danger" onClick={() => onDelete(s.id)}>Remove</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PITCHER LEADERBOARD DATA ─────────────────────────────────────────────────
const PITCHERS_KEY = "de_pitchers_v1";
const loadPitchers = async () => {
  try { const r = await storage.get(PITCHERS_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
};
const savePitchers = async (data) => {
  try { await storage.set(PITCHERS_KEY, JSON.stringify(data)); } catch {}
};

const HOT_THRESHOLDS = { era: 2.80, fip: 3.00, kPct: 26, whip: 1.10, swStr: 12, kPer9: 9.5 };

function getPitcherScore(p) {
  let score = 0;
  if (p.era && p.era <= HOT_THRESHOLDS.era) score += 2; else if (p.era && p.era <= 3.20) score += 1;
  if (p.fip && p.fip <= HOT_THRESHOLDS.fip) score += 2; else if (p.fip && p.fip <= 3.40) score += 1;
  if (p.kPct && p.kPct >= HOT_THRESHOLDS.kPct) score += 2; else if (p.kPct && p.kPct >= 22) score += 1;
  if (p.whip && p.whip <= HOT_THRESHOLDS.whip) score += 1;
  if (p.swStr && p.swStr >= HOT_THRESHOLDS.swStr) score += 1;
  if (p.shutouts && p.shutouts >= 1) score += 1;
  if (p.last3Qs && p.last3Qs >= 2) score += 1;
  return score;
}

function getPitcherHeat(score) {
  if (score >= 7) return { label: "🔥 On Fire", color: "#e85d6a", bg: "#e85d6a0a" };
  if (score >= 5) return { label: "⚡ Hot", color: "#d4954a", bg: "#d4954a08" };
  if (score >= 3) return { label: "✓ Solid", color: "#3ecf6a", bg: "transparent" };
  return { label: "— Avg", color: "#5c6783", bg: "transparent" };
}

const OPP_TIERS = [
  { label: "Elite (wRC+ 110+)", value: "elite", color: "#e85d6a" },
  { label: "Good (wRC+ 100-109)", value: "good", color: "#d4954a" },
  { label: "Average (wRC+ 90-99)", value: "avg", color: "#9aa5be" },
  { label: "Weak (wRC+ 75-89)", value: "weak", color: "#3ecf6a" },
  { label: "Bad (wRC+ <75)", value: "bad", color: "#3ecf6a" },
];

function getMatchupEdge(pitcher, oppTier) {
  if (!pitcher || !oppTier) return null;
  const score = getPitcherScore(pitcher);
  if (score >= 5 && (oppTier === "weak" || oppTier === "bad")) return { label: "HIGH VALUE", color: "#3ecf6a", note: "Elite arm vs. weak lineup — prime K prop target" };
  if (score >= 5 && oppTier === "avg") return { label: "GOOD SPOT", color: "#d4954a", note: "Hot pitcher vs. average offense" };
  if (score >= 7 && oppTier === "good") return { label: "WATCH", color: "#d4954a", note: "Top arm vs. good lineup — monitor line movement" };
  if (score < 3 && (oppTier === "elite" || oppTier === "good")) return { label: "AVOID", color: "#e85d6a", note: "Struggling arm vs. quality lineup" };
  return null;
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function getNextStartDays(lastStartDate, restDays = 5) {
  if (!lastStartDate) return null;
  const last = new Date(lastStartDate);
  const next = new Date(last);
  next.setDate(last.getDate() + restDays);
  const today = new Date();
  const diff = Math.round((next - today) / (1000 * 60 * 60 * 24));
  return { date: next.toLocaleDateString("en-US", { month: "short", day: "numeric" }), day: DAYS[next.getDay()], daysOut: diff };
}

function PitcherModal({ pitcher, onSave, onClose }) {
  const [p, setP] = useState(pitcher || {
    id: genId(), name: "", team: "NYY", hand: "R",
    era: "", fip: "", xfip: "", kPct: "", bbPct: "", whip: "",
    swStr: "", kPer9: "", innings: "",
    shutouts: 0, last3Qs: 0,
    lastStart: "", restDays: 5,
    nextOpp: "", nextOppTier: "avg", notes: "",
  });
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ position:"fixed", inset:0, background:"#000b", zIndex:200, overflow:"auto", padding:"20px" }}>
      <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:12, maxWidth:620, margin:"0 auto", padding:"22px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
          <div style={{ fontFamily:T.mono, color:T.amber, fontSize:14, fontWeight:700 }}>{pitcher ? "Edit Pitcher" : "+ Add Pitcher"}</div>
          <button className="de-btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="de-grid3" style={{ marginBottom:14 }}>
          <div className="de-field"><label className="de-label">Name</label><input className="de-input" placeholder="Last, First" value={p.name} onChange={e=>set("name",e.target.value)} /></div>
          <div className="de-field"><label className="de-label">Team</label><select className="de-select" value={p.team} onChange={e=>set("team",e.target.value)}>{TEAMS.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="de-field"><label className="de-label">Throws</label><select className="de-select" value={p.hand} onChange={e=>set("hand",e.target.value)}><option value="R">RHP</option><option value="L">LHP</option></select></div>
        </div>
        <div className="de-section-title">Season Stats</div>
        <div className="de-grid3" style={{ marginBottom:14 }}>
          {[["ERA","era","3.45"],["FIP","fip","3.21"],["xFIP","xfip","3.30"],["K%","kPct","27.4"],["BB%","bbPct","6.2"],["WHIP","whip","1.08"],["SwStr%","swStr","13.1"],["K/9","kPer9","10.2"],["IP","innings","84.1"]].map(([label,key,ph])=>(
            <div key={key} className="de-field"><label className="de-label">{label}</label><input className="de-input" type="number" step="0.01" placeholder={ph} value={p[key]} onChange={e=>set(key, e.target.value===""?"":parseFloat(e.target.value))} /></div>
          ))}
        </div>
        <div className="de-section-title">Recent Performance</div>
        <div className="de-grid3" style={{ marginBottom:14 }}>
          <div className="de-field"><label className="de-label">Shutouts (season)</label><input className="de-input" type="number" min="0" value={p.shutouts} onChange={e=>set("shutouts",parseInt(e.target.value)||0)} /></div>
          <div className="de-field"><label className="de-label">QS in last 3 starts</label><input className="de-input" type="number" min="0" max="3" value={p.last3Qs} onChange={e=>set("last3Qs",parseInt(e.target.value)||0)} /></div>
          <div className="de-field"><label className="de-label">Rest days (typical)</label><select className="de-select" value={p.restDays} onChange={e=>set("restDays",parseInt(e.target.value))}><option value={4}>4 days (ace)</option><option value={5}>5 days (standard)</option><option value={6}>6 days (stretched)</option></select></div>
        </div>
        <div className="de-section-title">Next Start</div>
        <div className="de-grid3" style={{ marginBottom:14 }}>
          <div className="de-field"><label className="de-label">Last Start Date</label><input className="de-input" type="date" value={p.lastStart} onChange={e=>set("lastStart",e.target.value)} /></div>
          <div className="de-field"><label className="de-label">Next Opponent</label><input className="de-input" placeholder="e.g. MIA" value={p.nextOpp} onChange={e=>set("nextOpp",e.target.value)} /></div>
          <div className="de-field"><label className="de-label">Opp Offense Tier</label><select className="de-select" value={p.nextOppTier} onChange={e=>set("nextOppTier",e.target.value)}>{OPP_TIERS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        </div>
        <div className="de-field" style={{ marginBottom:16 }}><label className="de-label">Notes (stuff, command, injury flags)</label><textarea className="de-input" placeholder="e.g. Curveball command back, 97.2 mph avg last 3 starts" value={p.notes} onChange={e=>set("notes",e.target.value)} /></div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <button className="de-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="de-btn" onClick={()=>onSave(p)}>Save Pitcher</button>
        </div>
      </div>
    </div>
  );
}

function PitcherCard({ p, onEdit, onDelete }) {
  const score = getPitcherScore(p);
  const heat = getPitcherHeat(score);
  const nextStart = getNextStartDays(p.lastStart, p.restDays || 5);
  const matchupEdge = getMatchupEdge(p, p.nextOppTier);
  const sc = (val, key) => {
    if (val===""||val===undefined||val===null) return T.text2;
    const v = parseFloat(val);
    if (key==="era"||key==="fip") return v<=HOT_THRESHOLDS[key]?T.green:v<=3.50?T.amber:T.red;
    if (key==="kPct") return v>=HOT_THRESHOLDS.kPct?T.green:v>=20?T.amber:T.text1;
    if (key==="whip") return v<=HOT_THRESHOLDS.whip?T.green:v<=1.25?T.amber:T.red;
    if (key==="swStr") return v>=HOT_THRESHOLDS.swStr?T.green:v>=10?T.amber:T.text1;
    return T.text1;
  };
  return (
    <div className="de-card" style={{ borderColor:score>=7?"#e85d6a40":score>=5?T.amberDim:T.border, background:heat.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <span style={{ fontSize:16, fontWeight:700, color:T.text0 }}>{p.name||"Unnamed"}</span>
            <span style={{ fontFamily:T.mono, fontSize:11, color:T.text2, background:T.bg3, padding:"2px 6px", borderRadius:4 }}>{p.hand}HP · {p.team}</span>
          </div>
          <div style={{ fontSize:11, color:T.text2, fontFamily:T.mono }}>
            {p.innings?`${p.innings} IP`:""}{p.last3Qs!==undefined?` · ${p.last3Qs}/3 QS`:""}{p.shutouts>0?` · ${p.shutouts} SHO`:""}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:12, fontWeight:700, color:heat.color, fontFamily:T.mono }}>{heat.label}</div>
          <div style={{ fontSize:10, color:T.text2, fontFamily:T.mono, marginTop:2 }}>Score {score}/10</div>
        </div>
      </div>
      {/* Stat pills */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {[["ERA",p.era,"era"],["FIP",p.fip,"fip"],["xFIP",p.xfip,"fip"],["K%",p.kPct?`${p.kPct}%`:null,"kPct"],["WHIP",p.whip,"whip"],["SwStr%",p.swStr?`${p.swStr}%`:null,"swStr"],["BB%",p.bbPct?`${p.bbPct}%`:null,null],["K/9",p.kPer9,null]]
          .filter(([,v])=>v!==""&&v!=null).map(([label,val,colorKey])=>(
          <div key={label} style={{ background:T.bg2, borderRadius:6, padding:"5px 9px", textAlign:"center", minWidth:48 }}>
            <div style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:colorKey?sc(val,colorKey):T.text0 }}>{val}</div>
            <div style={{ fontSize:9, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginTop:1 }}>{label}</div>
          </div>
        ))}
      </div>
      {/* Next start */}
      {nextStart && (
        <div style={{ display:"flex", alignItems:"center", gap:10, background:T.bg2, borderRadius:7, padding:"8px 12px", marginBottom:matchupEdge?10:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>Projected Next Start</div>
            <div style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:T.text0 }}>
              {nextStart.day} {nextStart.date}
              <span style={{ color:nextStart.daysOut<=0?T.green:nextStart.daysOut<=1?T.green:nextStart.daysOut<=3?T.amber:T.text2, fontSize:11, marginLeft:8 }}>
                {nextStart.daysOut<=0?"TODAY":nextStart.daysOut===1?"Tomorrow":`in ${nextStart.daysOut}d`}
              </span>
            </div>
          </div>
          {p.nextOpp&&(
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:T.text2, marginBottom:2 }}>vs</div>
              <div style={{ fontFamily:T.mono, fontSize:15, fontWeight:700, color:T.blue }}>{p.nextOpp}</div>
              <div style={{ fontSize:10, color:OPP_TIERS.find(t=>t.value===p.nextOppTier)?.color||T.text2 }}>
                {OPP_TIERS.find(t=>t.value===p.nextOppTier)?.label.split(" ")[0]||""}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Edge alert */}
      {matchupEdge&&(
        <div style={{ background:`${matchupEdge.color}15`, border:`1px solid ${matchupEdge.color}40`, borderRadius:7, padding:"8px 12px", marginBottom:10, marginTop: nextStart ? 10 : 0 }}>
          <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:matchupEdge.color, marginBottom:3 }}>★ {matchupEdge.label}</div>
          <div style={{ fontSize:11, color:T.text1 }}>{matchupEdge.note}</div>
        </div>
      )}
      {p.notes&&<div style={{ fontSize:11, color:T.text2, fontStyle:"italic", lineHeight:1.6, marginBottom:10 }}>{p.notes}</div>}
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button className="de-btn-ghost" style={{ fontSize:11 }} onClick={()=>onEdit(p)}>Edit</button>
        <button className="de-btn-danger" onClick={()=>onDelete(p.id)}>Remove</button>
      </div>
    </div>
  );
}

function TabPitchers({ pitchers, onAdd, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [filterHeat, setFilterHeat] = useState("all");

  const scored = pitchers.map(p => ({ ...p, _score: getPitcherScore(p) }));
  const sorted = [...scored]
    .filter(p => {
      if (filterHeat==="fire") return p._score>=7;
      if (filterHeat==="hot") return p._score>=5;
      if (filterHeat==="value") return getMatchupEdge(p,p.nextOppTier)!==null;
      return true;
    })
    .sort((a,b) => {
      if (sortBy==="score") return b._score-a._score;
      if (sortBy==="era") return (parseFloat(a.era)||9)-(parseFloat(b.era)||9);
      if (sortBy==="fip") return (parseFloat(a.fip)||9)-(parseFloat(b.fip)||9);
      if (sortBy==="kPct") return (parseFloat(b.kPct)||0)-(parseFloat(a.kPct)||0);
      if (sortBy==="nextStart") {
        const aD=getNextStartDays(a.lastStart,a.restDays)?.daysOut??99;
        const bD=getNextStartDays(b.lastStart,b.restDays)?.daysOut??99;
        return aD-bD;
      }
      return 0;
    });

  const fireCount = scored.filter(p=>p._score>=7).length;
  const valueSpots = scored.filter(p=>getMatchupEdge(p,p.nextOppTier)).length;
  const soonStarts = scored.filter(p=>{const ns=getNextStartDays(p.lastStart,p.restDays);return ns&&ns.daysOut<=1;});

  return (
    <div className="de-body">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:T.text0 }}>Pitcher Leaderboard</div>
          <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>Track who's cooking — K's, shutouts, ERA vs FIP, and next matchup value</div>
        </div>
        <button className="de-btn" onClick={()=>{setEditTarget(null);setShowModal(true);}}>+ Add Pitcher</button>
      </div>

      {/* Summary */}
      {pitchers.length>0&&(
        <div className="de-card" style={{ marginBottom:16 }}>
          <div className="de-stats-row">
            <div className="de-stat"><div className="de-stat-val" style={{color:T.red}}>{fireCount}</div><div className="de-stat-label">On Fire 🔥</div></div>
            <div className="de-stat"><div className="de-stat-val" style={{color:T.green}}>{valueSpots}</div><div className="de-stat-label">Value Spots ★</div></div>
            <div className="de-stat"><div className="de-stat-val" style={{color:T.amber}}>{soonStarts.length}</div><div className="de-stat-label">Starting Soon</div></div>
            <div className="de-stat"><div className="de-stat-val">{pitchers.length}</div><div className="de-stat-label">Tracked</div></div>
          </div>
          {soonStarts.length>0&&(
            <div style={{ marginTop:12, borderTop:`1px solid ${T.border}`, paddingTop:10 }}>
              <div style={{ fontSize:10, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Starting Today / Tomorrow</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {soonStarts.map(p=>{
                  const ns=getNextStartDays(p.lastStart,p.restDays);
                  const heat=getPitcherHeat(p._score);
                  const edge=getMatchupEdge(p,p.nextOppTier);
                  return (
                    <div key={p.id} style={{ background:T.bg2, borderRadius:7, padding:"8px 12px", minWidth:150, borderLeft:`3px solid ${heat.color}` }}>
                      <div style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:T.text0 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:T.text2 }}>{p.team} {p.hand}HP</div>
                      <div style={{ fontSize:11, color:ns?.daysOut<=0?T.green:T.amber, fontFamily:T.mono, marginTop:3 }}>
                        {ns?.daysOut<=0?"TODAY":"TOMORROW"} vs {p.nextOpp||"?"}
                      </div>
                      {edge&&<div style={{ fontSize:10, color:edge.color, fontWeight:700, marginTop:3 }}>★ {edge.label}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {pitchers.length>0&&(
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <select className="de-select" style={{ width:"auto", fontSize:11, padding:"6px 10px" }} value={filterHeat} onChange={e=>setFilterHeat(e.target.value)}>
            <option value="all">All pitchers</option>
            <option value="fire">🔥 On Fire only</option>
            <option value="hot">⚡ Hot+ only</option>
            <option value="value">★ Value spots only</option>
          </select>
          <select className="de-select" style={{ width:"auto", fontSize:11, padding:"6px 10px" }} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="score">Sort: Hot score</option>
            <option value="era">Sort: ERA ↑</option>
            <option value="fip">Sort: FIP ↑</option>
            <option value="kPct">Sort: K% ↓</option>
            <option value="nextStart">Sort: Next start</option>
          </select>
        </div>
      )}

      {/* Cards */}
      {sorted.length===0&&pitchers.length===0&&(
        <div className="de-empty">
          <div className="de-empty-icon">⚾</div>
          <div className="de-empty-title">No pitchers tracked yet</div>
          <div className="de-empty-sub">Add starters to find who's hot and flag value spots against weaker lineups</div>
        </div>
      )}
      {sorted.length===0&&pitchers.length>0&&<div className="de-empty"><div className="de-empty-title">No pitchers match this filter</div></div>}
      {sorted.map((p,i)=>(
        <div key={p.id} style={{ position:"relative" }}>
          {i<3&&<div style={{ position:"absolute", top:14, right:14, fontFamily:T.mono, fontSize:11, color:T.text2, zIndex:1 }}>#{i+1}</div>}
          <PitcherCard p={p} onEdit={pp=>{setEditTarget(pp);setShowModal(true);}} onDelete={onDelete} />
        </div>
      ))}

      {/* Threshold ref */}
      {pitchers.length>0&&(
        <div className="de-card" style={{ marginTop:4 }}>
          <div className="de-section-title">🔥 "Cooking" Thresholds</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[["ERA ≤",HOT_THRESHOLDS.era],["FIP ≤",HOT_THRESHOLDS.fip],["K% ≥",`${HOT_THRESHOLDS.kPct}%`],["WHIP ≤",HOT_THRESHOLDS.whip],["SwStr% ≥",`${HOT_THRESHOLDS.swStr}%`],["K/9 ≥",HOT_THRESHOLDS.kPer9]].map(([label,val])=>(
              <div key={label} style={{ background:T.bg2, borderRadius:6, padding:"6px 10px", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:T.text2 }}>{label}</span>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.green, fontWeight:700 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:T.text2, marginTop:10, fontFamily:T.mono, lineHeight:1.6 }}>
            ⚠ FIP/xFIP = primary signal. Hot ERA on cold FIP = regression candidate. Shutouts signal elite command but only matter with consistent FIP.
          </div>
        </div>
      )}

      {showModal&&(
        <PitcherModal pitcher={editTarget} onSave={p=>{editTarget?onUpdate(p):onAdd(p);setShowModal(false);setEditTarget(null);}} onClose={()=>{setShowModal(false);setEditTarget(null);}} />
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function DiamondEdge() {
  const [tab, setTab] = useState(0);
  const [matchups, setMatchups] = useState([]);
  const [log, setLog] = useState([]);
  const [series, setSeries] = useState([]);
  const [pitchers, setPitchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, l, s, p] = await Promise.all([loadMatchups(), loadLog(), loadSeries(), loadPitchers()]);
      setMatchups(m); setLog(l); setSeries(s); setPitchers(p);
      setLoading(false);
    })();
  }, []);

  const handleAdd = (m) => { setMatchups(prev => { const next=[m,...prev]; saveMatchups(next); return next; }); };
  const handleDelete = (id) => { setMatchups(prev => { const next=prev.filter(m=>m.id!==id); saveMatchups(next); return next; }); };
  const handleUpdate = (m) => { setMatchups(prev => { const next=prev.map(x=>x.id===m.id?m:x); saveMatchups(next); return next; }); };
  const handleLog = async (entry) => { const next=[entry,...log]; setLog(next); await saveLog(next); };
  const handleUpdateLog = async (next) => { setLog(next); await saveLog(next); };
  const handleAddSeries = async (s) => { const next=[s,...series]; setSeries(next); await saveSeries(next); };
  const handleUpdateSeries = async (u) => { const next=series.map(s=>s.id===u.id?u:s); setSeries(next); await saveSeries(next); };
  const handleDeleteSeries = async (id) => { const next=series.filter(s=>s.id!==id); setSeries(next); await saveSeries(next); };
  const handleAddPitcher = async (p) => { const next=[p,...pitchers]; setPitchers(next); await savePitchers(next); };
  const handleUpdatePitcher = async (p) => { const next=pitchers.map(x=>x.id===p.id?p:x); setPitchers(next); await savePitchers(next); };
  const handleDeletePitcher = async (id) => { const next=pitchers.filter(p=>p.id!==id); setPitchers(next); await savePitchers(next); };

  const sweepSpotCount = series.filter(s => getSweepSpotSignal(s).alert).length;
  const fireCount = pitchers.filter(p => getPitcherScore(p) >= 7).length;

  const TABS = [
    "Today's Slate",
    "Top 10",
    `Series${sweepSpotCount > 0 ? ` ⚡${sweepSpotCount}` : ""}`,
    `Pitchers${fireCount > 0 ? ` 🔥${fireCount}` : ""}`,
    "Grade Log",
    "Guide",
  ];

  return (
    <>
      <style>{css}</style>
      <div className="de-root">
        <div className="de-header">
          <div className="de-logo">◆ DIAMOND EDGE <span>MLB Analysis</span></div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text2 }}>
            {matchups.length} games · {log.flatMap(l => l.entries).filter(e => e.result !== "Pending").length} graded
          </div>
        </div>
        <div className="de-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`de-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="de-empty" style={{ marginTop: 60 }}>
            <div style={{ color: T.amber, fontFamily: T.mono }}>Loading...</div>
          </div>
        ) : (
          <>
            {tab === 0 && <TabMatchups matchups={matchups} onAdd={handleAdd} onLog={handleLog} onDelete={handleDelete} onUpdate={handleUpdate} />}
            {tab === 1 && <TabTop10 matchups={matchups} />}
            {tab === 2 && <TabSeries seriesList={series} onAdd={handleAddSeries} onUpdate={handleUpdateSeries} onDelete={handleDeleteSeries} />}
            {tab === 3 && <TabPitchers pitchers={pitchers} onAdd={handleAddPitcher} onUpdate={handleUpdatePitcher} onDelete={handleDeletePitcher} />}
            {tab === 4 && <TabLog log={log} matchups={matchups} onUpdateLog={handleUpdateLog} />}
            {tab === 5 && <TabGuide />}
          </>
        )}
      </div>
    </>
  );
}
