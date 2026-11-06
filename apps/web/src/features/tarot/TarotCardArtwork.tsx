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
        <circle cx="100" cy="77" r="38" className="scene-line scene-line--muted"/>
        <circle cx="100" cy="77" r="32" className="scene-line scene-line--muted"/>
        <path d="M112 42c-24 6-35 32-22 52 10 16 31 20 47 7-19 2-33-12-33-30 0-11 3-21 8-29Z" className="scene-fill"/>
        <path d="M100 26v12m-5-6h10m-64 34 3 6 7 3-7 3-3 6-3-6-7-3 7-3zM157 53l3 5 6 3-6 3-3 5-3-5-6-3 6-3zM157 104l2 4 5 2-5 2-2 4-2-4-5-2 5-2z" className="scene-line"/>
        <circle cx="57" cy="96" r="2.2" className="scene-dot"/>
        <circle cx="143" cy="33" r="2" className="scene-dot"/>
        <path d="M22 164 49 130 67 148 96 112 128 150 151 128 178 164" className="scene-line scene-line--muted"/>
        <path d="M21 165h158v28H21z" className="scene-fill"/>
        <path d="M31 164V115l14-14 14 14v49M36 115v-13h18v13M141 164v-49l14-14 14 14v49M146 115v-13h18v13" className="scene-line"/>
        <path d="M39 126h12m-12 9h12m96-9h12m-12 9h12" className="scene-line scene-line--muted"/>
        <path d="M25 174q18-6 36 0t36 0 36 0 36 0M25 184q18-6 36 0t36 0 36 0 36 0" className="scene-line scene-line--muted"/>
        <path d="M58 161q-3-12 8-15l8 3 7-3q7 1 8 10l-5 5H63zM122 161q-3-12 8-15l8 3 7-3q7 1 8 10l-5 5h-21z" className="scene-fill"/>
        <path d="M72 156v-7m-3 2 3-4 3 4m60 5v-7m-3 2 3-4 3 4" className="scene-line scene-line--muted"/>
        <path d="M100 145v7m-5-3h10" className="scene-line"/>
      </g>
    );
  }
  if (cardId === "major-sun") {
    return (
      <g className="arcana-scene arcana-scene--sun">
        {Array.from({ length: 20 }, (_, index) => {
          const angle = (index * Math.PI) / 10;
          const inner = index % 2 === 0 ? 38 : 42;
          const outer = index % 2 === 0 ? 56 : 51;
          return <line key={index} x1={100 + Math.cos(angle) * inner} y1={72 + Math.sin(angle) * inner} x2={100 + Math.cos(angle) * outer} y2={72 + Math.sin(angle) * outer} className="scene-line"/>;
        })}
        <circle cx="100" cy="72" r="34" className="scene-fill"/>
        <circle cx="100" cy="72" r="27" className="scene-line"/>
        <circle cx="100" cy="72" r="20" className="scene-line scene-line--muted"/>
        <path d="M91 65q9-8 18 0m-18 13q9 8 18 0M95 71h10" className="scene-line scene-line--muted"/>
        <path d="M20 157 52 126 72 144 100 111 127 144 148 125 180 157" className="scene-line"/>
        <path d="M20 158h160v34H20z" className="scene-fill"/>
        <path d="M77 157v-20q23-26 46 0v20M87 157v-13q13-16 26 0v13M100 132v25" className="scene-line"/>
        <path d="M36 172q16-8 32 0t32 0 32 0 32 0M36 183q16-7 32 0t32 0 32 0 32 0" className="scene-line scene-line--muted"/>
        <path d="M45 151q-7-13 2-20 9 8 2 20m104 0q-7-13 2-20 9 8 2 20" className="scene-line"/>
        <path d="M47 131q-7-8-7-16m114 16q7-8 7-16M54 190h92" className="scene-line scene-line--muted"/>
        <path d="M100 111v-12m-5 6h10" className="scene-line"/>
        <circle cx="45" cy="92" r="2" className="scene-dot"/><circle cx="154" cy="91" r="2" className="scene-dot"/>
      </g>
    );
  }
  if (cardId === "major-star") {
    return (
      <g className="arcana-scene arcana-scene--star">
        <circle cx="100" cy="72" r="39" className="scene-line scene-line--muted"/>
        <circle cx="100" cy="72" r="32" className="scene-line scene-line--muted"/>
        <path d="m100 24 9 29 29 11-29 10-9 29-10-29-29-10 29-11z" className="scene-line"/>
        <path d="m100 40 7 22 22 8-22 7-7 22-7-22-22-7 22-8z" className="scene-fill"/>
        <circle cx="100" cy="70" r="4" className="scene-dot"/>
        <path d="m42 51 3 6 7 3-7 3-3 6-3-6-7-3 7-3zM158 47l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM47 106l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM153 111l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" className="scene-line"/>
        <path d="M20 158 52 137 75 151 100 132 126 151 149 137 180 158" className="scene-line scene-line--muted"/>
        <path d="M23 160h154v31H23z" className="scene-fill"/>
        <path d="M47 139v18m-10-13 10-5 10 5M153 139v18m-10-13 10-5 10 5" className="scene-line"/>
        <path d="M35 157q6 10 15 0m-11-1h21m93 1q6 10 15 0m-11-1h21" className="scene-line"/>
        <path d="M52 168q24-7 48 0t48 0M52 179q24-7 48 0t48 0M67 188q16-4 33 0t33 0" className="scene-line scene-line--muted"/>
        <path d="M100 111v16m-6-8h12" className="scene-line"/>
        <circle cx="67" cy="119" r="2" className="scene-dot"/><circle cx="134" cy="112" r="2" className="scene-dot"/>
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

const majorConstellations: Record<string, [number, number][]> = {
  "major-fool": [[42, 54], [53, 40], [67, 51], [79, 38], [91, 48]],
  "major-magician": [[142, 38], [154, 49], [168, 39], [160, 60], [145, 67]],
  "major-high-priestess": [[35, 103], [46, 91], [58, 104], [50, 120], [37, 131]],
  "major-empress": [[141, 37], [155, 45], [163, 61], [151, 72], [137, 59]],
  "major-emperor": [[36, 60], [48, 48], [62, 60], [48, 75], [33, 88]],
  "major-hierophant": [[143, 100], [155, 87], [168, 99], [158, 115], [145, 126]],
  "major-lovers": [[38, 43], [51, 35], [64, 45], [51, 58], [39, 69]],
  "major-chariot": [[138, 44], [151, 34], [166, 46], [155, 60], [141, 70]],
  "major-strength": [[42, 115], [55, 102], [67, 116], [54, 130], [41, 143]],
  "major-hermit": [[144, 43], [157, 55], [169, 43], [157, 30], [144, 19]],
  "major-wheel": [[36, 78], [48, 65], [62, 78], [49, 91], [36, 104]],
  "major-justice": [[139, 82], [152, 69], [166, 82], [153, 96], [139, 110]],
  "major-hanged-man": [[37, 42], [50, 31], [63, 43], [50, 56], [37, 68]],
  "major-death": [[143, 112], [157, 99], [171, 112], [157, 126], [143, 139]],
  "major-temperance": [[38, 144], [51, 131], [64, 144], [51, 158], [38, 171]],
  "major-devil": [[139, 42], [153, 30], [168, 44], [155, 59], [140, 70]],
  "major-tower": [[35, 54], [49, 40], [64, 55], [49, 70], [35, 85]],
  "major-star": [[38, 45], [50, 32], [63, 45], [50, 58], [38, 71]],
  "major-moon": [[143, 31], [157, 43], [171, 31], [157, 18], [144, 10]],
  "major-sun": [[36, 92], [48, 79], [62, 92], [48, 105], [36, 118]],
  "major-judgement": [[141, 130], [154, 117], [168, 131], [155, 145], [141, 157]],
  "major-world": [[40, 132], [53, 119], [66, 132], [53, 145], [40, 158]],
};

function MajorArcanaConstellation({ cardId }: { cardId: string }): ReactNode {
  const points = majorConstellations[cardId] ?? majorConstellations["major-fool"]!;
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  return (
    <g className="arcana-constellation" aria-hidden="true">
      <path d={path} className="arcana-constellation__line"/>
      {points.map(([x, y], index) => (
        <g key={index} className="arcana-constellation__node">
          <circle cx={x} cy={y} r={index === 2 ? 2.6 : 1.65}/>
          {index === 2 && <path d={`M${x} ${y - 5}v10m-5-5h10`}/>}
        </g>
      ))}
      <circle cx={points[0]![0]} cy={points[0]![1]} r="5.5" className="arcana-constellation__halo"/>
    </g>
  );
}

type SuitKey = "cups" | "swords" | "pentacles" | "wands";

function getSuitKey(suit?: string): SuitKey {
  const value = (suit ?? "").toLowerCase();
  if (value.includes("куб")) return "cups";
  if (value.includes("меч")) return "swords";
  if (value.includes("пент")) return "pentacles";
  return "wands";
}

function SuitPipGlyph({ suit, x, y, scale = 1 }: { suit?: string; x: number; y: number; scale?: number }): ReactNode {
  const key = getSuitKey(suit);
  return (
    <g className={`minor-pip-glyph minor-pip-glyph--${key}`} transform={`translate(${x - 12 * scale} ${y - 12 * scale}) scale(${scale})`}>
      {key === "cups" ? (
        <>
          <path d="M5 5h14l-2 10q-5 7-10 0zM8 7q4 3 8 0M12 17v4m-4 0h8" className="pip-outline"/>
          <path d="M7 7C3 7 3 13 7 14M17 7c4 0 4 6 0 7" className="pip-outline"/>
          <path d="M12 1c-2 3-3 4-3 6a3 3 0 0 0 6 0c0-2-1-3-3-6Z" className="pip-fill"/>
        </>
      ) : key === "swords" ? (
        <>
          <path d="M12 1 16 15 12 19 8 15z" className="pip-fill"/>
          <path d="M12 1v18m-7-7h14M9 16l-2 2m8-2 2 2M12 19v4m-3-2h6" className="pip-outline"/>
          <path d="m12 1 1.6 3.5L12 7 10.4 4.5z" className="pip-detail"/>
        </>
      ) : key === "pentacles" ? (
        <>
          <circle cx="12" cy="12" r="10" className="pip-outline"/>
          <circle cx="12" cy="12" r="8" className="pip-outline pip-outline--fine"/>
          <path d="m12 3 2.1 6.5 6.8 2.5-6.8 2.2-2.1 6.8-2.2-6.8L3 12l6.8-2.5z" className="pip-outline"/>
          <circle cx="12" cy="12" r="2" className="pip-fill"/>
        </>
      ) : (
        <>
          <path d="M12 2v20M9 5l3-3 3 3M8 8q-5-4-6 1 4 3 6-1ZM16 12q5-4 6 1-4 3-6-1ZM8 16q-5-4-6 1 4 3 6-1Z" className="pip-outline"/>
          <path d="m12 1 2 3-2 3-2-3z" className="pip-fill"/>
          <path d="M10 10h4m-4 5h4" className="pip-outline pip-outline--fine"/>
        </>
      )}
    </g>
  );
}

const minorPipLayouts: Record<string, { x: number; y: number; scale?: number }[]> = {
  ace: [{ x: 100, y: 104, scale: 1.55 }],
  two: [{ x: 100, y: 58 }, { x: 100, y: 150 }],
  three: [{ x: 100, y: 45 }, { x: 100, y: 104 }, { x: 100, y: 163 }],
  four: [{ x: 67, y: 60 }, { x: 133, y: 60 }, { x: 67, y: 150 }, { x: 133, y: 150 }],
  five: [{ x: 67, y: 60 }, { x: 133, y: 60 }, { x: 100, y: 105 }, { x: 67, y: 150 }, { x: 133, y: 150 }],
  six: [{ x: 66, y: 46 }, { x: 134, y: 46 }, { x: 66, y: 105 }, { x: 134, y: 105 }, { x: 66, y: 164 }, { x: 134, y: 164 }],
  seven: [{ x: 66, y: 43 }, { x: 134, y: 43 }, { x: 66, y: 88 }, { x: 100, y: 105 }, { x: 134, y: 88 }, { x: 66, y: 164 }, { x: 134, y: 164 }],
  eight: [{ x: 66, y: 40 }, { x: 134, y: 40 }, { x: 66, y: 83 }, { x: 134, y: 83 }, { x: 66, y: 126 }, { x: 134, y: 126 }, { x: 66, y: 169 }, { x: 134, y: 169 }],
  nine: [{ x: 66, y: 42 }, { x: 100, y: 42 }, { x: 134, y: 42 }, { x: 66, y: 105 }, { x: 100, y: 105 }, { x: 134, y: 105 }, { x: 66, y: 168 }, { x: 100, y: 168 }, { x: 134, y: 168 }],
  ten: [{ x: 58, y: 48 }, { x: 100, y: 48 }, { x: 142, y: 48 }, { x: 58, y: 86 }, { x: 100, y: 86 }, { x: 142, y: 86 }, { x: 58, y: 124 }, { x: 100, y: 124 }, { x: 142, y: 124 }, { x: 100, y: 164 }],
};

function CourtCrown({ rank }: { rank: string }): ReactNode {
  if (rank === "king") {
    return <g className="court-regalia"><path d="M70 55 75 34 89 46 100 27 111 46 125 34 130 55Z" className="court-crown"/><path d="M74 58h52m-46 7h40" className="court-crown-detail"/><circle cx="100" cy="34" r="3" className="scene-dot"/></g>;
  }
  if (rank === "queen") {
    return <g className="court-regalia"><path d="M76 54 80 32 92 45 100 26 108 45 120 32 124 54Z" className="court-crown"/><path d="M78 58h44" className="court-crown-detail"/><circle cx="100" cy="33" r="3.2" className="scene-dot"/></g>;
  }
  if (rank === "knight") {
    return <g className="court-regalia"><path d="M76 53q-3-16 8-25l12 11 13-12q13 12 10 26Z" className="court-helm"/><path d="M83 49h34m-17-26v18" className="court-crown-detail"/><path d="m100 22 4 6-4 6-4-6z" className="scene-dot"/></g>;
  }
  return <g className="court-regalia"><path d="M79 53q2-20 21-24 19 4 21 24M83 51h34" className="court-crown-detail"/><path d="M100 27v-8m-4 4h8" className="court-crown-detail"/></g>;
}

function MinorPipConstellation({ rank }: { rank: string }): ReactNode {
  const count = Number(rank === "ace" ? 1 : rank === "two" ? 2 : rank === "three" ? 3 : rank === "four" ? 4 : rank === "five" ? 5 : rank === "six" ? 6 : rank === "seven" ? 7 : rank === "eight" ? 8 : rank === "nine" ? 9 : rank === "ten" ? 10 : 0);
  if (count < 2) return null;
  const paths: Record<string, string> = {
    two: "M100 58V150",
    three: "M100 45V163",
    four: "M67 60H133M67 150H133",
    five: "M67 60H133M67 60 100 105 133 150M67 150H133",
    six: "M66 46V164M134 46V164M66 105H134",
    seven: "M66 43V164M134 43V164M66 88H134M100 105V45",
    eight: "M66 40V169M134 40V169M66 83H134M66 126H134",
    nine: "M66 42V168M100 42V168M134 42V168M66 105H134",
    ten: "M58 48V124M100 48V164M142 48V124M58 86H142M58 124H142",
  };
  return (
    <g className="minor-pip-constellation" aria-hidden="true">
      <path d={paths[rank] ?? paths.two!}/>
      <circle cx="100" cy="105" r="3"/>
      <circle cx="100" cy="105" r="8"/>
    </g>
  );
}

function MinorArcanaScene({ suit, rank }: { suit?: string; rank: string }): ReactNode {
  const key = getSuitKey(suit);
  const isCourt = rank === "page" || rank === "knight" || rank === "queen" || rank === "king";

  if (isCourt) {
    return (
      <g className={`arcana-scene minor-court minor-court--${key} minor-court--${rank}`}>
        <path d="M51 183V73q49-45 98 0v110" className="scene-line scene-line--muted"/>
        <path d="M58 181q7-39 42-44 35 5 42 44Z" className="court-mantle"/>
        <path d="M73 95q0-31 27-37 27 6 27 37 0 35-27 43-27-8-27-43Z" className="court-face"/>
        <path d="M77 96q23-19 46 0M83 112h7m20 0h7M91 124q9 7 18 0" className="scene-line scene-line--muted"/>
        <path d="M82 137q18 9 36 0M72 156q28-13 56 0" className="scene-line"/>
        <CourtCrown rank={rank}/>
        <path d="M66 157 52 174m82-17 14 17M77 178l-7 12m53-12 7 12" className="scene-line scene-line--muted"/>
        <g className="court-held-symbol"><SuitPipGlyph suit={suit} x={145} y={113} scale={1.14}/></g>
        <path d="M42 184h116M57 192h86M68 199h64" className="scene-line scene-line--muted"/>
        <circle cx="57" cy="79" r="2.2" className="scene-dot"/><circle cx="143" cy="79" r="2.2" className="scene-dot"/>
        {key === "cups" && <path d="M53 111q-9 6 0 13m94-13q9 6 0 13" className="scene-line scene-line--muted"/>}
        {key === "swords" && <path d="M52 93 60 79m80 14-8-14" className="scene-line"/>}
        {key === "pentacles" && <circle cx="100" cy="95" r="48" className="scene-line scene-line--muted"/>}
        {key === "wands" && <path d="M54 126q-12-18 2-27m90 27q12-18-2-27" className="scene-line"/>}
      </g>
    );
  }

  return (
    <g className={`arcana-scene minor-numbered minor-numbered--${key} minor-numbered--${rank}`}>
      <circle cx="100" cy="105" r="81" className="minor-watermark-ring"/>
      <circle cx="100" cy="105" r="70" className="minor-watermark-ring minor-watermark-ring--fine"/>
      <g className="minor-watermark" opacity=".22">
        <SuitPipGlyph suit={suit} x={100} y={105} scale={2.7}/>
      </g>
      <path d="M31 105h15m108 0h15M100 22v13m0 140v13" className="scene-line scene-line--muted"/>
      <path d="m100 16 3 6 6 3-6 3-3 6-3-6-6-3 6-3zM100 181l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" className="scene-fill"/>
      <path d="M46 35q-12 8-11 22m119-22q12 8 11 22M46 175q-12-8-11-22m119 22q12-8 11-22" className="scene-line scene-line--muted"/>
      <path d="M56 191h88" className="scene-line scene-line--muted"/>
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
      <rect x="20" y="20" width="160" height="238" rx="2" className="back-frame back-frame--fine"/>
      <path d="M24 60V24h36M176 60V24h-36M24 218v36h36M176 218v36h-36" className="back-corner"/>
      <path d="M33 34h15m-7-7v15M167 34h-15m7-7v15M33 244h15m-7-7v15M167 244h-15m7-7v15" className="back-axis"/>
      <path d="M100 29v16m-8-8h16M100 233v16m-8-8h16M23 139h16m-8-8v16m130-8h16m-8-8v16" className="back-axis"/>
      <ellipse cx="100" cy="132" rx="58" ry="82" className="back-orbit" transform="rotate(-34 100 132)"/>
      <ellipse cx="100" cy="132" rx="58" ry="82" className="back-orbit" transform="rotate(34 100 132)"/>
      <ellipse cx="100" cy="132" rx="42" ry="67" className="back-orbit" transform="rotate(90 100 132)"/>
      <circle cx="100" cy="132" r="57" className="back-ring"/>
      <circle cx="100" cy="132" r="48" className="back-ring back-ring--fine"/>
      <circle cx="100" cy="132" r="37" className="back-ring"/>
      <circle cx="100" cy="132" r="28" className="back-ring back-ring--fine"/>
      <path d="M111 103c-20 6-28 27-16 43 11 14 30 15 43 1-20 2-34-11-34-27 0-6 2-12 7-17Z" className="back-moon"/>
      <path d="m100 105 5 9 10 5-10 5-5 10-5-10-10-5 10-5z" className="back-star"/>
      <path d="m100 71 4 8 8 4-8 4-4 8-4-8-8-4 8-4zM100 169l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" className="back-star"/>
      <path d="m47 91 3 6 6 3-6 3-3 6-3-6-6-3 6-3zM153 91l3 6 6 3-6 3-3 6-3-6-6-3 6-3zM47 172l3 6 6 3-6 3-3 6-3-6-6-3 6-3zM153 172l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" className="back-star back-star--small"/>
      <circle cx="57" cy="132" r="2.2" className="back-dot"/><circle cx="143" cy="132" r="2.2" className="back-dot"/>
      <circle cx="100" cy="75" r="2" className="back-dot"/><circle cx="100" cy="189" r="2" className="back-dot"/>
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
  const isCourtCard = rank === "page" || rank === "knight" || rank === "queen" || rank === "king";
  const pips = minorPipLayouts[rank] ?? minorPipLayouts.ace!;
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
        <>
          <MajorArcanaConstellation cardId={cardId}/>
          <MajorArcanaScene cardId={cardId}/>
        </>
      ) : (
        <>
          <MinorArcanaScene suit={suit} rank={rank}/>
          {!isCourtCard && <MinorPipConstellation rank={rank}/>}
          {!isCourtCard && (
            <g className={`minor-pips minor-pips--${getSuitKey(suit)} minor-pips--${rank}`} aria-hidden="true">
              {pips.map((pip, index) => (
                <SuitPipGlyph key={index} suit={suit} x={pip.x} y={pip.y} scale={pip.scale ?? (rank === "ace" ? 1.18 : 0.72)}/>
              ))}
            </g>
          )}
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
