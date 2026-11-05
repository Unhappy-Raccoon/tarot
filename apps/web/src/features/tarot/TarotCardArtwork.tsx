import type { ReactNode } from "react";

interface CardArtProps {
  cardId: string;
  arcana: "major" | "minor";
  suit?: string;
}

function MajorArcanaScene({ cardId }: { cardId: string }): ReactNode {
  if (cardId === "major-magician") {
    return (
      <g className="arcana-scene arcana-scene--magician">
        <path d="M55 162h90M65 171h70M76 180h48M72 160v-33h56v33" className="scene-line"/>
        <path d="M100 40c-17 0-27 13-27 26 0 14 12 25 27 25s27-11 27-25c0-13-10-26-27-26Z" className="scene-line"/>
        <path d="M78 56q22-21 44 0M100 49v31m-8-16h16" className="scene-line scene-line--muted"/>
        <path d="m100 23 4 8 8 4-8 4-4 8-4-8-8-4 8-4z" className="scene-fill"/>
        <circle cx="62" cy="106" r="10" className="scene-line"/><path d="M62 97v18m-6-9h12" className="scene-line"/>
        <path d="M138 96h14v20h-14zM145 96V82m-6 7 6-7 6 7" className="scene-line"/>
        <path d="m100 125 12 14-12 14-12-14z" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-hierophant") {
    return (
      <g className="arcana-scene arcana-scene--hierophant">
        <path d="M48 176V83q52-58 104 0v93M62 176V91q38-42 76 0v85" className="scene-line"/>
        <path d="M75 176V106h50v70M86 106V91h28v15M100 91V70m-12 11h24" className="scene-line"/>
        <circle cx="100" cy="65" r="8" className="scene-fill"/>
        <path d="M58 183h84M71 191h58M82 199h36" className="scene-line scene-line--muted"/>
        <path d="M70 139q-13 10-13 24m73-24q13 10 13 24M88 130h24" className="scene-line"/>
        <circle cx="100" cy="144" r="4" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-chariot") {
    return (
      <g className="arcana-scene arcana-scene--chariot">
        <path d="M53 153V86h94v67M45 86h110M64 86V69h72v17" className="scene-line"/>
        <path d="M100 69V48m-7 10 7-10 7 10M68 153v-26h64v26" className="scene-line"/>
        <circle cx="68" cy="164" r="15" className="scene-line"/><circle cx="132" cy="164" r="15" className="scene-line"/>
        <path d="M68 149v30m-15-15h30M132 149v30m-15-15h30" className="scene-line scene-line--muted"/>
        <path d="M69 108q-17-19-29-4 12 21 29 4ZM131 108q17-19 29-4-12 21-29 4Z" className="scene-fill"/>
        <path d="M100 40 106 51 100 62 94 51Z" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-strength") {
    return (
      <g className="arcana-scene arcana-scene--strength">
        <path d="M100 43c-17-20-38-4-24 9 8 8 16 1 24-9 8 10 16 17 24 9 14-13-7-29-24-9Z" className="scene-line"/>
        <path d="M64 119q0-35 36-35t36 35q0 27-36 43-36-16-36-43Z" className="scene-line"/>
        <path d="M73 118q10-20 27 0 17-20 27 0M85 128h30M91 139l9 6 9-6" className="scene-line"/>
        <path d="M79 85q-17-12-20 6m62-6q17-12 20 6M52 171q18-13 35 0m26 0q17-13 35 0" className="scene-line scene-line--muted"/>
        <circle cx="88" cy="116" r="3" className="scene-dot"/><circle cx="112" cy="116" r="3" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-hanged-man") {
    return (
      <g className="arcana-scene arcana-scene--hanged-man">
        <path d="M43 62h114M56 62v112m88-112v112M44 174h112" className="scene-line"/>
        <path d="M100 62v30m0 0-24 22m24-22 25 20m-25-20v31m0 0-16 26m16-26 21 25" className="scene-line"/>
        <circle cx="100" cy="108" r="13" className="scene-line"/>
        <path d="M89 109q11-12 22 0M100 93v-8m-7 4h14" className="scene-line"/>
        <circle cx="100" cy="108" r="25" className="scene-line scene-line--muted"/>
        <path d="M60 48h80M68 39h64" className="scene-line scene-line--muted"/>
      </g>
    );
  }
  if (cardId === "major-death") {
    return (
      <g className="arcana-scene arcana-scene--death">
        <path d="M100 40c-20 23-31 42-31 62 0 22 14 39 31 39s31-17 31-39c0-20-11-39-31-62Z" className="scene-line"/>
        <path d="M100 72c-12 16-18 27-18 39 0 12 8 21 18 21s18-9 18-21c0-12-6-23-18-39Z" className="scene-fill"/>
        <path d="M100 92v30m-8-15 8-8 8 8" className="scene-line"/>
        <path d="M54 161q22-13 46 0t46 0M63 176q17-9 37 0t37 0" className="scene-line scene-line--muted"/>
        <path d="m51 96 4 7 8 3-8 3-4 7-4-7-8-3 8-3zM149 98l3 6 7 3-7 3-3 6-3-6-7-3 7-3z" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-temperance") {
    return (
      <g className="arcana-scene arcana-scene--temperance">
        <path d="M67 75h30l-4 33q-11 13-22 0zM103 75h30l-4 33q-11 13-22 0z" className="scene-line"/>
        <path d="M82 109q18 3 18 19t18 19M118 109q-18 3-18 19t-18 19" className="scene-line"/>
        <path d="M100 54v22m-10-12 10-10 10 10M100 145v27m-9-9 9 9 9-9" className="scene-line"/>
        <path d="M58 176q22-13 42 0t42 0M71 186h58" className="scene-line scene-line--muted"/>
        <circle cx="100" cy="96" r="5" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-devil") {
    return (
      <g className="arcana-scene arcana-scene--devil">
        <path d="M61 92 49 57q30 0 42 25M139 92l12-35q-30 0-42 25" className="scene-line"/>
        <path d="M62 119q0-43 38-43t38 43q0 35-38 50-38-15-38-50Z" className="scene-fill"/>
        <path d="M81 111h10m18 0h10M85 132q15 12 30 0M100 76V54m-7 8h14" className="scene-line"/>
        <path d="M72 165v20m56-20v20M58 185h84M74 193h52" className="scene-line"/>
        <path d="M54 145 42 160l16 2m88-17 12 15-16 2" className="scene-line scene-line--muted"/>
      </g>
    );
  }
  if (cardId === "major-judgement") {
    return (
      <g className="arcana-scene arcana-scene--judgement">
        <path d="M100 45v54m0-54-25 23 25 9 25-9z" className="scene-line"/>
        <path d="M100 45 85 35l-15 4 15 11M100 45l15-10 15 4-15 11" className="scene-line"/>
        <path d="M70 132q-18-23 1-36 19 13 1 36ZM130 132q-18-23 1-36 19 13 1 36Z" className="scene-fill"/>
        <path d="M53 173q0-27 18-27 18 0 18 27m20 0q0-27 18-27 18 0 18 27" className="scene-line"/>
        <path d="M44 182h112M61 190h78M100 27v-9m-6 5h12" className="scene-line scene-line--muted"/>
      </g>
    );
  }
  if (cardId === "major-moon") {
    return (
      <g className="arcana-scene arcana-scene--moon">
        <path d="M34 155Q57 128 79 153T126 151T168 151" className="scene-line scene-line--muted"/>
        <path d="M30 177Q61 158 90 178T170 177" className="scene-line scene-line--muted"/>
        <path d="M52 130V88l18-19 18 19v42M112 130V88l18-19 18 19v42" className="scene-line"/>
        <path d="M99 48c-24 6-36 34-23 54 12 18 36 19 51 4-21 2-37-12-37-31 0-11 3-20 9-27Z" className="scene-fill"/>
        <path d="M100 31v10m-5-5h10M38 98l3 6 6 3-6 3-3 6-3-6-6-3 6-3zM161 112l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" className="scene-line"/>
        <circle cx="100" cy="151" r="3" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-sun") {
    return (
      <g className="arcana-scene arcana-scene--sun">
        <circle cx="100" cy="103" r="32" className="scene-fill"/>
        <circle cx="100" cy="103" r="23" className="scene-line"/>
        {Array.from({ length: 16 }, (_, index) => {
          const angle = (index * Math.PI) / 8;
          const x1 = 100 + Math.cos(angle) * 39;
          const y1 = 103 + Math.sin(angle) * 39;
          const x2 = 100 + Math.cos(angle) * 53;
          const y2 = 103 + Math.sin(angle) * 53;
          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="scene-line"/>;
        })}
        <path d="M42 161Q69 139 100 161Q131 139 158 161M55 177Q100 163 145 177" className="scene-line"/>
        <path d="M100 136v39m-10-18 10-10 10 10" className="scene-line"/>
        <path d="M46 129q-9-11 0-21 9 10 0 21ZM154 129q-9-11 0-21 9 10 0 21Z" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-star") {
    return (
      <g className="arcana-scene arcana-scene--star">
        <path d="m100 46 11 38 39 15-39 14-11 39-14-39-39-14 39-15z" className="scene-line"/>
        <path d="m100 67 7 26 26 6-26 9-7 27-9-27-26-9 26-6z" className="scene-fill"/>
        <circle cx="100" cy="100" r="5" className="scene-dot"/>
        <path d="M48 158q25-15 52 0t52 0M56 175q20-11 44 0t44 0" className="scene-line scene-line--muted"/>
        <path d="M57 126l-7 22 22-7m71-15 7 22-22-7" className="scene-line"/>
        <circle cx="48" cy="83" r="3" className="scene-dot"/><circle cx="153" cy="77" r="2.5" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-high-priestess") {
    return (
      <g className="arcana-scene arcana-scene--priestess">
        <path d="M54 177V76h22v101M124 177V76h22v101M48 76h34M118 76h34" className="scene-line"/>
        <path d="M76 78Q100 52 124 78v89H76Z" className="scene-line scene-line--muted"/>
        <path d="M100 48c-15 2-24 17-17 29 7 10 21 10 29 1-12 1-19-7-19-17 0-5 2-9 7-13Z" className="scene-fill"/>
        <path d="M82 115q18-15 36 0v49H82z" className="scene-line scene-line--muted"/>
        <path d="M64 185h72M72 193h56" className="scene-line"/>
        <circle cx="100" cy="141" r="4" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-empress") {
    return (
      <g className="arcana-scene arcana-scene--empress">
        <path d="M100 49c-27 0-48 22-48 50 0 39 27 65 48 78 21-13 48-39 48-78 0-28-21-50-48-50Z" className="scene-line"/>
        <path d="M100 68c-19 14-27 32-27 50m27-50c19 14 27 32 27 50M100 73v91" className="scene-line scene-line--muted"/>
        <path d="M100 90c-12-20-31-12-27 2 3 13 20 20 27 25 7-5 24-12 27-25 4-14-15-22-27-2Z" className="scene-fill"/>
        <path d="M60 159q-20-12-22-31 19 3 28 19m74 12q20-12 22-31-19 3-28 19M64 178h72" className="scene-line"/>
        <circle cx="100" cy="115" r="5" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-emperor") {
    return (
      <g className="arcana-scene arcana-scene--emperor">
        <path d="M48 174V90h104v84M40 90h120M57 90V71h86v19M58 174h84" className="scene-line"/>
        <path d="M69 89V61l31-19 31 19v28M84 174v-32q16-18 32 0v32" className="scene-line"/>
        <path d="M100 54v28m-10-14h20" className="scene-line"/>
        <path d="M42 125l18-20 18 20M122 125l18-20 18 20" className="scene-line scene-line--muted"/>
        <circle cx="100" cy="112" r="7" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-lovers") {
    return (
      <g className="arcana-scene arcana-scene--lovers">
        <path d="M44 176V112q0-58 56-58t56 58v64" className="scene-line"/>
        <path d="M64 176v-39q0-28 17-28t17 28v39M102 176v-39q0-28 17-28t17 28v39" className="scene-line"/>
        <path d="m100 39 4 8 9 4-9 4-4 9-4-9-9-4 9-4z" className="scene-fill"/>
        <path d="M48 187h104M64 195h72" className="scene-line scene-line--muted"/>
        <circle cx="81" cy="96" r="7" className="scene-line"/><circle cx="119" cy="96" r="7" className="scene-line"/>
      </g>
    );
  }
  if (cardId === "major-hermit") {
    return (
      <g className="arcana-scene arcana-scene--hermit">
        <path d="M46 181Q68 154 83 170l17-27 17 27q15-16 37 11" className="scene-line"/>
        <path d="M79 161q2-43 21-63 19 20 21 63M78 161h44" className="scene-line"/>
        <path d="M100 75l-19 23h38z" className="scene-line"/>
        <path d="M100 93c-14 0-22 12-22 27 0 15 9 26 22 26s22-11 22-26c0-15-8-27-22-27Z" className="scene-fill"/>
        <circle cx="100" cy="115" r="9" className="scene-line"/>
        <path d="M100 106v18m-8-9h16" className="scene-line"/>
        <path d="M51 190h98" className="scene-line scene-line--muted"/>
      </g>
    );
  }
  if (cardId === "major-wheel") {
    return (
      <g className="arcana-scene arcana-scene--wheel">
        <circle cx="100" cy="118" r="62" className="scene-line"/>
        <circle cx="100" cy="118" r="47" className="scene-line scene-line--muted"/>
        <circle cx="100" cy="118" r="15" className="scene-fill"/>
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index * Math.PI) / 4;
          return <line key={index} x1={100 + Math.cos(angle) * 15} y1={118 + Math.sin(angle) * 15} x2={100 + Math.cos(angle) * 62} y2={118 + Math.sin(angle) * 62} className="scene-line"/>;
        })}
        <path d="m100 42 5 9-5 9-5-9zM176 118l-9 5-9-5 9-5zM100 194l-5-9 5-9 5 9zM24 118l9-5 9 5-9 5z" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-justice") {
    return (
      <g className="arcana-scene arcana-scene--justice">
        <path d="M100 53v112m-38-84h76m-38-28-9-9h18zM71 81l-15 38h30zM129 81l-15 38h30z" className="scene-line"/>
        <path d="M48 119q8 14 16 0m48 0q8 14 16 0M72 171h56M82 180h36" className="scene-line"/>
        <path d="M100 41v-10m-6 5h12" className="scene-line"/>
        <circle cx="100" cy="72" r="6" className="scene-fill"/>
      </g>
    );
  }
  if (cardId === "major-tower") {
    return (
      <g className="arcana-scene arcana-scene--tower">
        <path d="M68 179V90h64v89M59 90h82M74 90V73h52v17M81 179v-36h38v36" className="scene-line"/>
        <path d="m115 36-22 38 18 4-24 39 12-32-16-4 22-45z" className="scene-fill"/>
        <path d="M51 181h98M42 190h116M59 108h16m34 0h16m-66 22h16m34 0h16" className="scene-line scene-line--muted"/>
        <circle cx="54" cy="72" r="3" className="scene-dot"/><circle cx="151" cy="63" r="3" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-world") {
    return (
      <g className="arcana-scene arcana-scene--world">
        <ellipse cx="100" cy="119" rx="48" ry="69" className="scene-line"/>
        <ellipse cx="100" cy="119" rx="37" ry="58" className="scene-line scene-line--muted"/>
        <path d="M100 64q-22 22 0 43 22-21 0-43ZM100 132q-22 22 0 43 22-21 0-43Z" className="scene-fill"/>
        <path d="M100 43v18m-8-9h16M100 177v18m-8-9h16M42 119h16m84 0h16" className="scene-line"/>
        <circle cx="100" cy="119" r="8" className="scene-line"/>
      </g>
    );
  }
  if (cardId === "major-fool") {
    return (
      <g className="arcana-scene arcana-scene--fool">
        <path d="M32 176 66 126l17 21 19-44 23 42 16-18 27 49" className="scene-line"/>
        <path d="M55 177q22-13 45 0t45 0M79 98q5-20 21-21 16 1 21 21" className="scene-line"/>
        <circle cx="100" cy="67" r="17" className="scene-line"/>
        <path d="M94 67h12m-6-6v12M100 44V32" className="scene-line"/>
        <path d="M136 82l4 7 8 3-8 3-4 7-4-7-8-3 8-3z" className="scene-fill"/>
      </g>
    );
  }
  return (
    <g className="arcana-scene arcana-scene--celestial">
      <ellipse cx="100" cy="115" rx="47" ry="21" transform="rotate(-35 100 115)" className="scene-line"/>
      <ellipse cx="100" cy="115" rx="47" ry="21" transform="rotate(35 100 115)" className="scene-line"/>
      <circle cx="100" cy="115" r="18" className="scene-fill"/>
      <circle cx="100" cy="115" r="6" className="scene-dot"/>
      <path d="M100 51v15m-8-7h16M100 164v15m-8-7h16M44 115h13m86 0h13" className="scene-line"/>
    </g>
  );
}

function MinorArcanaScene({ suit }: { suit?: string }): ReactNode {
  const normalized = (suit ?? "").toLowerCase();
  if (normalized.includes("куб")) {
    return (
      <g className="arcana-scene arcana-scene--cups">
        <path d="M73 73h54l-8 48q-19 23-38 0zM100 144v25m-24 0h48" className="scene-line"/>
        <path d="M80 91q20 8 40 0m-34 15q14 7 28 0" className="scene-line scene-line--muted"/>
        <path d="M100 50c-9 13-15 20-15 28a15 15 0 0 0 30 0c0-8-6-15-15-28Z" className="scene-fill"/>
        <circle cx="100" cy="79" r="4" className="scene-dot"/>
      </g>
    );
  }
  if (normalized.includes("меч")) {
    return (
      <g className="arcana-scene arcana-scene--swords">
        <path d="M100 42 116 127 100 151 84 127z" className="scene-fill"/>
        <path d="M100 42v109m-28-29h56m-39 12h22M100 151v33m-14-12h28" className="scene-line"/>
        <path d="m100 34 4 8-4 8-4-8zM72 83l8 8-8 8-8-8zM128 83l8 8-8 8-8-8z" className="scene-line"/>
      </g>
    );
  }
  if (normalized.includes("пент")) {
    return (
      <g className="arcana-scene arcana-scene--pentacles">
        <circle cx="100" cy="112" r="44" className="scene-line"/>
        <circle cx="100" cy="112" r="34" className="scene-line scene-line--muted"/>
        <path d="m100 78 9 24 25 10-25 9-9 25-9-25-25-9 25-10z" className="scene-fill"/>
        <path d="m100 91 6 16 16 5-16 6-6 16-6-16-16-6 16-5z" className="scene-line"/>
      </g>
    );
  }
  return (
    <g className="arcana-scene arcana-scene--wands">
      <path d="M100 48v127M91 58l9-12 9 12M89 84q-19-13-25 5 13 9 25-5ZM111 110q19-13 25 5-13 9-25-5ZM89 139q-18-12-24 5 13 9 24-5Z" className="scene-line"/>
      <path d="M100 72v15m0 18v15m0 18v15" className="scene-line scene-line--muted"/>
      <circle cx="100" cy="42" r="5" className="scene-dot"/>
    </g>
  );
}

export function TarotCardBackArtwork() {
  return (
    <svg className="tarot-back-art" viewBox="0 0 200 278" aria-hidden="true">
      <defs>
        <linearGradient id="pcj-card-back-gold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2dfc0"/><stop offset=".52" stopColor="#d7ad78"/><stop offset="1" stopColor="#9d785e"/>
        </linearGradient>
      </defs>
      <rect x="7" y="7" width="186" height="264" rx="5" className="back-frame"/>
      <rect x="14" y="14" width="172" height="250" rx="3" className="back-frame back-frame--inner"/>
      <path d="M24 60V24h36M176 60V24h-36M24 218v36h36M176 218v36h-36" className="back-corner"/>
      <path d="M100 29v16m-8-8h16M100 233v16m-8-8h16M23 139h16m-8-8v16m130-8h16m-8-8v16" className="back-axis"/>
      <ellipse cx="100" cy="135" rx="48" ry="78" className="back-orbit" transform="rotate(-36 100 135)"/>
      <ellipse cx="100" cy="135" rx="48" ry="78" className="back-orbit" transform="rotate(36 100 135)"/>
      <circle cx="100" cy="135" r="51" className="back-ring"/>
      <circle cx="100" cy="135" r="39" className="back-ring back-ring--fine"/>
      <circle cx="100" cy="135" r="26" className="back-ring back-ring--fine"/>
      <path d="M100 85c-18 6-25 25-14 40 10 13 27 13 39 1-18 2-30-10-30-24 0-7 2-12 5-17Z" className="back-moon"/>
      <path d="m100 103 5 9 10 5-10 5-5 10-5-10-10-5 10-5z" className="back-star"/>
      <path d="m51 85 3 6 6 3-6 3-3 6-3-6-6-3 6-3zM149 166l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" className="back-star back-star--small"/>
      <circle cx="57" cy="164" r="2.2" className="back-dot"/><circle cx="143" cy="100" r="2.2" className="back-dot"/>
      <path d="M61 209h78M72 216h56" className="back-caption-line"/>
      <text x="100" y="229" textAnchor="middle" className="back-caption">PERSONAL COSMIC</text>
      <text x="100" y="239" textAnchor="middle" className="back-caption back-caption--small">JOURNAL</text>
      <path d="m100 51 4 7 7 4-7 4-4 7-4-7-7-4 7-4zM100 198l3 5 5 3-5 3-3 5-3-5-5-3 5-3z" className="back-star"/>
    </svg>
  );
}

export function TarotCardIllustration({ cardId, arcana, suit }: CardArtProps) {
  const isMajor = arcana === "major";
  const rank = cardId.split("-").at(-1) ?? "";
  const rankPips: Record<string, number> = {
    ace: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    page: 1, knight: 2, queen: 3, king: 4,
  };
  const pipCount = rankPips[rank] ?? 1;
  const pips = Array.from({ length: pipCount }, (_, index) => {
    const angle = (index / pipCount) * Math.PI * 2 - Math.PI / 2;
    return { x: 100 + Math.cos(angle) * 70, y: 112 + Math.sin(angle) * 70 };
  });
  const isCourtCard = rank === "page" || rank === "knight" || rank === "queen" || rank === "king";
  return (
    <svg className="tarot-card-illustration" viewBox="0 0 200 210" aria-hidden="true">
      <defs>
        <radialGradient id="pcj-card-art-glow" cx="50%" cy="48%" r="60%">
          <stop offset="0%" stopColor="#8d6d9b" stopOpacity=".3"/>
          <stop offset="100%" stopColor="#8d6d9b" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="pcj-card-art-ink" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f4dfbf"/><stop offset=".55" stopColor="#d7ad78"/><stop offset="1" stopColor="#9b765e"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="105" r="92" fill="url(#pcj-card-art-glow)"/>
      <circle cx="100" cy="104" r="76" className="card-art-orbit"/>
      <circle cx="100" cy="104" r="65" className="card-art-orbit card-art-orbit--fine"/>
      <path d="M100 13v12m-6-6h12M100 183v12m-6-6h12M14 104h12m-6-6v12M174 104h12m-6-6v12" className="card-art-axis"/>
      <circle cx="48" cy="48" r="2.2" className="card-art-star"/>
      <circle cx="154" cy="58" r="2.2" className="card-art-star"/>
      <circle cx="47" cy="155" r="2.2" className="card-art-star"/>
      <circle cx="153" cy="154" r="2.2" className="card-art-star"/>
      {isMajor ? (
        <MajorArcanaScene cardId={cardId}/>
      ) : (
        <>
          <MinorArcanaScene suit={suit}/>
          <g className={isCourtCard ? "minor-pips minor-pips--court" : "minor-pips"} aria-hidden="true">
            {pips.map((pip, index) => (
              <circle key={index} cx={pip.x} cy={pip.y} r={isCourtCard ? 3.1 : 2.3} className="scene-dot"/>
            ))}
          </g>
        </>
      )}
      <path d="m100 20 3 5 5 3-5 3-3 5-3-5-5-3 5-3zM100 178l3 5 5 3-5 3-3 5-3-5-5-3 5-3z" className="card-art-star card-art-star--ornament"/>
    </svg>
  );
}

export function TarotCardMark({ cardId, arcana, suit }: CardArtProps) {
  const isMajor = arcana === "major";
  if (!isMajor) {
    const normalized = (suit ?? "").toLowerCase();
    if (normalized.includes("куб")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14l-2 11q-5 6-10 0zM12 16v5m-4 0h8"/></svg>;
    if (normalized.includes("меч")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 12-3 4-3-4zM12 18v4m-5-7h10"/></svg>;
    if (normalized.includes("пент")) return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>;
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M9 5l3-3 3 3M8 9q-5-4-6 1 4 3 6-1Zm8 4q5-4 6 1-4 3-6-1Z"/></svg>;
  }
  if (cardId === "major-moon") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 17 8.1 8.1 0 0 1 15.5 3.2Z"/></svg>;
  if (cardId === "major-sun") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1.8v3m0 14.4v3M1.8 12h3m14.4 0h3M4.8 4.8 7 7m10 10 2.2 2.2m0-14.4L17 7M7 17l-2.2 2.2"/></svg>;
  if (cardId === "major-star") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.2" ry="8.5" transform="rotate(42 12 12)"/><ellipse cx="12" cy="12" rx="3.2" ry="8.5" transform="rotate(-42 12 12)"/></svg>;
}
