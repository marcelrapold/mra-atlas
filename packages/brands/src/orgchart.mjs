/**
 * Atlas Organigramm + Zuständigkeiten-Diagramm — pure Render-Logik (kein fs, kein DOM).
 * White-Label: keine Hausschrift, keine Organisationsdaten, sicheres Attribut-Escaping,
 * begrenzte Zeilen, konfigurierbare Linien und Texte.
 *
 * Konsumenten: assets/organigramm/generate.mjs (CLI) und die Showcase-Route
 * /organigramm (Live-Editor). Recipe: patterns/organigramm.md
 */

// ----------------------------- LAYOUT-KONSTANTEN -----------------------------
const BOX_W = 300
const GAP_X = 32
const MARGIN = 48
const ROW1_N = 4 // erste 4 Abteilungen in Reihe 1, Rest in Reihe 2

const PAD = 14
const FS_TITLE = 15, LH_TITLE = 19 // Abteilungsname
const FS_HEAD = 13, LH_HEAD = 17   // Abteilungsleitung
const FS_DESC = 11, LH_DESC = 15   // Aufgabenbeschreibung
const FS_MEM = 13, LH_MEM = 19     // Team-Mitglieder
const HEADER_TEAM_GAP = 4

const DEFAULT_FONT = 'Arial, sans-serif'

/**
 * Akzentfarben der Abteilungen — eine **chart-lokale** Palette, keine Brand-
 * Tokens (und nicht mit den VBZ-Linienfarben zu verwechseln, docs/01-identity.md).
 *
 * Alle Töne liegen auf der Luminanz der Primärfarbe: ~4.9:1 Kontrast gegen Weiss,
 * also WCAG AA für den weissen Header-Text und untereinander gleiches optisches
 * Gewicht. Sie unterscheiden sich im Farbton, nicht in der Helligkeit — dadurch
 * bleibt das Blatt eine Familie statt eines Flickenteppichs.
 *
 * Die Reihenfolge alterniert warm/kalt, damit benachbarte Boxen maximal
 * differieren. Die erste Abteilung bekommt kein Palettenglied, sondern
 * `opts.primary` (siehe accentFor) — die Primärfarbe bleibt gesetzt, und mit ihr
 * die Tints `#ebf4fb`/`#a6ceee`, die auch das Mermaid-Theme verwendet.
 */
export const DEPT_ACCENTS = [
  '#be4f17', // Rost
  '#007d86', // Petrol
  '#ca3771', // Beere
  '#15814b', // Grün
  '#9d50bb', // Violett
  '#986806', // Bronze
]

// ----------------------------- HELPERS -----------------------------
/** Hex-Farbe mit Weiss mischen (w = Weissanteil 0..1). */
export function tint(hex, w) {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return '#' + ch.map((v) => Math.round(v * (1 - w) + 255 * w).toString(16).padStart(2, '0')).join('')
}

function esc(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

/** Fehlende Felder tolerieren — der Live-Editor rendert auch halbfertige Daten. */
function norm(d) {
  return {
    name: d.name ?? '',
    head: d.head ?? '',
    desc: d.desc ?? [],
    members: d.members ?? [],
    sub: d.sub ?? null,
    color: d.color ?? null,
  }
}

const HEX = /^#[0-9a-fA-F]{6}$/

/**
 * Akzent einer Abteilung: `monochrome` überstimmt alles (Variante des
 * offiziellen PDFs), sonst schlägt ein expliziter `color`-Wert die Palette und
 * die erste Abteilung erbt `primary` (Token). Ein gesetzter, aber ungültiger
 * Wert wirft — ein stiller Rückfall würde den Tippfehler verstecken.
 */
function accentFor(d, i, primary, monochrome) {
  if (d.color !== null && !HEX.test(d.color)) {
    throw new Error(`renderOrgchart: color von "${d.name}" ist kein #rrggbb-Hex`)
  }
  if (monochrome) return primary
  if (d.color !== null) return d.color
  return i === 0 ? primary : DEPT_ACCENTS[(i - 1) % DEPT_ACCENTS.length]
}

function headerHeight(d) {
  let h = PAD + LH_TITLE + (d.head ? LH_HEAD : 0)
  if (d.desc.length) h += 6 + LH_DESC * d.desc.length
  return h + PAD
}

function teamHeight(d) {
  if (!d.members.length) return 0
  let h = 12 + LH_MEM * d.members.length + 12
  if (d.sub) h += 10 + LH_MEM * d.sub.length + 10
  return h
}

function boxHeight(d) {
  let h = headerHeight(d)
  if (d.members.length) h += HEADER_TEAM_GAP + teamHeight(d)
  return h
}

// ----------------------------- SEO / SEMANTIK -----------------------------
/** Rollen-Marker (` *`, `(Stv.)`, `(Stv. D)`, `(a.i.)` …) aus Personennamen strippen. */
function cleanName(s) {
  return String(s).replace(/\s*\([^)]*\)/g, '').replace(/\s*\*/g, '').trim()
}

/**
 * schema.org-JSON-LD (`Organization`) aus den Org-Daten — für CMS-Embeds:
 * macht Abteilungen und Personen maschinenlesbar (SEO), ohne sichtbares
 * Layout. Nach `toPublicData()` enthält das Resultat nur die Abteilungen,
 * keine Personen. Im Embed-Snippet als
 * `<script type="application/ld+json">` neben dem SVG platzieren
 * (`<`-Zeichen im JSON zu `<` escapen).
 */
export function toJsonLd(data) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.title || 'Organisation',
  }
  const dirHead = cleanName(data.direction?.head ?? '')
  if (dirHead) {
    org.employee = [{ '@type': 'Person', name: dirHead, jobTitle: data.direction?.name ?? 'Direktion' }]
  }
  org.department = (data.departments ?? []).map((d) => {
    const dept = { '@type': 'Organization', name: d.name }
    const employees = []
    const head = cleanName(d.head ?? '')
    if (head) employees.push({ '@type': 'Person', name: head, jobTitle: `Leitung ${d.name}` })
    for (const m of d.members ?? []) {
      const n = cleanName(m)
      if (n) employees.push({ '@type': 'Person', name: n })
    }
    for (const s of d.sub ?? []) {
      const n = cleanName(s.name)
      if (n) employees.push({ '@type': 'Person', name: n })
    }
    if (employees.length) dept.employee = employees
    return dept
  })
  return org
}

// ----------------------------- PUBLIC-VARIANTE -----------------------------
/**
 * Reduziert die Daten auf den öffentlich publizierbaren Stand: wie ein
 * öffentliches Organigramm nur Abteilungen + Aufgaben, keine
 * Personennamen (Pattern §7). Für Embeds auf öffentlichen Seiten.
 */
export function toPublicData(data) {
  return {
    ...data,
    legend: '', // ohne Namen keine GL-Legende
    direction: { ...(data.direction ?? {}), head: '' },
    departments: (data.departments ?? []).map((d) => ({ ...d, head: '', members: [], sub: null })),
  }
}

// ----------------------------- RENDER -----------------------------
/**
 * width/height-Attribute des SVG-Root. Non-responsive multipliziert
 * `opts.scale` die natural size (Default 1) — die viewBox bleibt unverändert,
 * beim Vektorformat ist die Reserve verlustfrei und gratis. Nötig für
 * Lightbox-Overlays (z. B. lightGallery): ein `<img>` wird nie grösser
 * dargestellt als seine natural size, 1× viewBox wäre dort der Deckel.
 * Details: patterns/lightbox.md §7.
 */
function svgSizeAttrs(width, height, opts) {
  if (opts.responsive) return `style="width:100%;height:auto;display:block"`
  const s = opts.scale ?? 1
  return `width="${Math.round(width * s)}" height="${Math.round(height * s)}"`
}

/**
 * Rendert das Organigramm als SVG-String.
 *
 * @param {object} data  Org-Daten (Schema: organigramm.data.json / Pattern §4)
 * @param {object} opts
 * @param {string} opts.primary       Header-Blau als #rrggbb — im CLI aus
 *                                    color-tokens.css gelesen, im Web aus der CSS-Var.
 *                                    Trägt die Direktion und die erste Abteilung;
 *                                    die übrigen kommen aus DEPT_ACCENTS.
 * @param {boolean} [opts.monochrome] true = alle Abteilungen in `primary`, wie ein
 *                                    einfarbiges Druck-PDF (CLI: `--monochrome`)
 * @param {string} [opts.font]        font-family-Kette (Default: Arial + Fallbacks)
 * @param {string} [opts.fontFaceCss] fertiges font-face-CSS (data-URIs) → style-Block im SVG
 * @param {boolean} [opts.responsive] true = kein width/height-Attribut, skaliert auf
 *                                    Container-Breite (für Embeds); false = feste Pixel (Datei)
 * @param {number} [opts.scale]       nur non-responsive: Faktor auf die width/height-
 *                                    Attribute (natural size als Lightbox-/Zoom-Reserve,
 *                                    viewBox bleibt) — siehe svgSizeAttrs()
 * @param {boolean} [opts.omitTitle]  true = ohne eingerenderten Titel — für CMS-Embeds,
 *                                    wo die Zielseite (AEM) die Überschrift als eigenes
 *                                    Element liefert. aria-label bleibt gesetzt.
 * @param {boolean} [opts.omitDesc]   true = ohne Aufgabenbeschreibung im Abteilungs-
 *                                    Header — nur Struktur und Personen, für Stände,
 *                                    in denen das «Was» nicht interessiert (CLI: `--no-desc`).
 *                                    Die Daten bleiben unangetastet, nur das Rendering lässt aus.
 * @returns {string} SVG
 */
export function renderOrgchart(data, opts = {}) {
  const primary = opts.primary
  if (!/^#[0-9a-fA-F]{6}$/.test(primary ?? '')) {
    throw new Error('renderOrgchart: opts.primary fehlt oder ist kein #rrggbb-Hex')
  }
  const font = esc(opts.font ?? DEFAULT_FONT)
  const LINE = HEX.test(opts.line ?? '') ? opts.line : primary
  const TEXT = HEX.test(opts.text ?? '') ? opts.text : '#16181d'

  const departments = (data.departments ?? [])
    .map(norm)
    .map((d) => (opts.omitDesc ? { ...d, desc: [] } : d))
  if (!departments.length || departments.length > 8) throw new Error('renderOrgchart: eine bis acht Abteilungen nötig')
  const accents = departments.map((d, i) => accentFor(d, i, primary, opts.monochrome === true))
  const direction = norm(data.direction ?? {})
  // Fallback-Titel, wenn die Daten keinen eigenen setzen.
  const title = data.title ?? 'Organisation und Mitarbeitende'
  const legend = data.legend ?? '* Geschäftsleitung'

  // Panel-Töne folgen dem Akzent der Box — dieselben Mischungen wie bisher,
  // nur eben pro Abteilung statt einmal global.
  function drawBox(svg, d, x, y, accent) {
    const teamFill = tint(accent, 0.92)
    const teamStroke = tint(accent, 0.65)
    const subFill = tint(accent, 0.62)
    const hh = headerHeight(d)
    svg.push(`<rect x="${x}" y="${y}" width="${BOX_W}" height="${hh}" fill="${accent}"/>`)
    let ty = y + PAD + 13
    svg.push(`<text x="${x + BOX_W / 2}" y="${ty}" font-size="${FS_TITLE}" font-weight="bold" ` +
      `fill="white" text-anchor="middle">${esc(d.name)}</text>`)
    if (d.head) {
      ty += LH_HEAD
      svg.push(`<text x="${x + BOX_W / 2}" y="${ty}" font-size="${FS_HEAD}" ` +
        `fill="white" text-anchor="middle">${esc(d.head)}</text>`)
    }
    if (d.desc.length) {
      ty += 6
      for (const line of d.desc) {
        ty += LH_DESC
        svg.push(`<text x="${x + BOX_W / 2}" y="${ty}" font-size="${FS_DESC}" ` +
          `fill="white" fill-opacity="0.92" text-anchor="middle">${esc(line)}</text>`)
      }
    }
    if (!d.members.length) return
    const th = teamHeight(d)
    const ty0 = y + hh + HEADER_TEAM_GAP
    svg.push(`<rect x="${x}" y="${ty0}" width="${BOX_W}" height="${th}" ` +
      `fill="${teamFill}" stroke="${teamStroke}" stroke-width="1"/>`)
    let my = ty0 + 12 + 13
    for (const m of d.members) {
      svg.push(`<text x="${x + BOX_W / 2}" y="${my}" font-size="${FS_MEM}" ` +
        `fill="${TEXT}" text-anchor="middle">${esc(m)}</text>`)
      my += LH_MEM
    }
    if (d.sub) {
      const subTop = ty0 + 12 + LH_MEM * d.members.length + 12
      const subH = th - (subTop - ty0)
      svg.push(`<rect x="${x}" y="${subTop}" width="${BOX_W}" height="${subH}" ` +
        `fill="${subFill}" stroke="${teamStroke}" stroke-width="1"/>`)
      let sy = subTop + 10 + 13
      for (const { name, lead } of d.sub) {
        const w = lead ? ' font-weight="bold"' : ''
        svg.push(`<text x="${x + BOX_W / 2}" y="${sy}" font-size="${FS_MEM}"${w} ` +
          `fill="${TEXT}" text-anchor="middle">${esc(name)}</text>`)
        sy += LH_MEM
      }
    }
  }

  function line(svg, x1, y1, x2, y2) {
    svg.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
      `stroke="${LINE}" stroke-width="1.2"/>`)
  }

  const row1 = departments.slice(0, ROW1_N)
  const row2 = departments.slice(ROW1_N)
  const width = 2 * MARGIN + ROW1_N * BOX_W + (ROW1_N - 1) * GAP_X
  const cx = width / 2

  const titleY = 42
  const dirTop = opts.omitTitle ? 36 : titleY + 28
  const dirH = PAD + LH_TITLE + (direction.head ? LH_HEAD : 0) + PAD - 6
  const dirBottom = dirTop + dirH

  const bus1Y = dirBottom + 34
  const row1Top = bus1Y + 26
  const row1X = row1.map((_, i) => MARGIN + i * (BOX_W + GAP_X))
  const row1MaxH = Math.max(...row1.map(boxHeight))

  const bus2Y = row1Top + row1MaxH + 44
  const row2Top = bus2Y + 26
  const row2W = row2.length * BOX_W + (row2.length - 1) * GAP_X
  const row2X = row2.map((_, i) => (width - row2W) / 2 + i * (BOX_W + GAP_X))
  const row2MaxH = row2.length ? Math.max(...row2.map(boxHeight)) : 0

  const height = (row2.length ? row2Top + row2MaxH : row1Top + row1MaxH) + 56

  const sizeAttrs = svgSizeAttrs(width, height, opts)
  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" ${sizeAttrs} ` +
    `viewBox="0 0 ${width} ${height}" font-family="${font}" role="img" aria-label="${esc(title)}">`]
  // <title>/<desc> als SVG-Semantik (Bildersuche, Standalone-Datei) — auch
  // bei omitTitle: nur der SICHTBARE Titel entfällt im Embed, nie die Metadaten.
  // Prefix = data.title, damit die desc einer Umbenennung automatisch folgt.
  const descText = `${title} — Organigramm: ${direction.name}` +
    (direction.head ? ` (${cleanName(direction.head)})` : '') +
    ` und ${departments.length} Abteilungen: ${departments.map((d) => d.name).join(', ')}.` +
    (data.asOf ? ` Stand: ${data.asOf}.` : '')
  svg.push(`<title>${esc(title)}</title>`, `<desc>${esc(descText)}</desc>`)
  
  svg.push(`<rect width="${width}" height="${height}" fill="white"/>`)
  if (!opts.omitTitle) {
    svg.push(`<text x="${cx}" y="${titleY}" font-size="22" font-weight="bold" ` +
      `fill="${TEXT}" text-anchor="middle">${esc(title)}</text>`)
  }

  // Direktion
  const dx = cx - BOX_W / 2
  svg.push(`<rect x="${dx}" y="${dirTop}" width="${BOX_W}" height="${dirH}" fill="${primary}"/>`)
  svg.push(`<text x="${cx}" y="${dirTop + 11 + 13}" font-size="${FS_TITLE}" font-weight="bold" ` +
    `fill="white" text-anchor="middle">${esc(direction.name)}</text>`)
  if (direction.head) {
    svg.push(`<text x="${cx}" y="${dirTop + 11 + 13 + LH_HEAD}" font-size="${FS_HEAD}" ` +
      `fill="white" text-anchor="middle">${esc(direction.head)}</text>`)
  }

  // Connectors Reihe 1
  const c1 = row1X.map((x) => x + BOX_W / 2)
  line(svg, cx, dirBottom, cx, bus1Y)
  line(svg, Math.min(...c1), bus1Y, Math.max(...c1), bus1Y)
  for (const x of c1) line(svg, x, bus1Y, x, row1Top)

  // Trunk + Connectors Reihe 2
  if (row2.length) {
    const c2 = row2X.map((x) => x + BOX_W / 2)
    line(svg, cx, bus1Y, cx, bus2Y)
    line(svg, Math.min(...c2), bus2Y, Math.max(...c2), bus2Y)
    for (const x of c2) line(svg, x, bus2Y, x, row2Top)
  }

  row1.forEach((d, i) => drawBox(svg, d, row1X[i], row1Top, accents[i]))
  row2.forEach((d, i) => drawBox(svg, d, row2X[i], row2Top, accents[ROW1_N + i]))

  if (legend) {
    svg.push(`<text x="${width - MARGIN}" y="${height - 24}" font-size="12" font-weight="bold" ` +
      `fill="${TEXT}" text-anchor="end">${esc(legend)}</text>`)
  }
  if (data.asOf) {
    svg.push(`<text x="${MARGIN}" y="${height - 24}" font-size="12" ` +
      `fill="${TEXT}" text-anchor="start">Stand: ${esc(data.asOf)}</text>`)
  }
  svg.push('</svg>')
  return svg.join('\n')
}

// ----------------------------- ZUSTÄNDIGKEITEN -----------------------------
// Zuständigkeitsgrafik: zwei externe Boxen (z. B. Auftraggeber) oben, darunter
// ein hellblauer Verbund-Bereich mit drei gestapelten Ebenen.

const Z_W = 1000            // Canvas-Breite
const Z_TOP_W = 340         // externe Boxen (Kanton, Gemeinden)
const Z_TOP_CX = [320, 680] // deren Mittelachsen — landen auf der obersten Verbund-Box
const Z_VB_W = 640          // Verbund-Boxen
const Z_PANEL_PAD = 50      // Panel-Überstand um die Verbund-Boxen
const Z_PAD = 22            // Innen-Padding Verbund-Boxen
const Z_PAD_TOP = 16        // Innen-Padding externe Boxen
const Z_GAP_V = 34          // vertikaler Abstand zwischen Verbund-Boxen

/** name darf string oder string[] (manuell umbrochen) sein. */
function znorm(b) {
  const name = Array.isArray(b.name) ? b.name : [b.name ?? '']
  return { name, sub: b.sub ?? '', desc: b.desc ?? [], emphasis: b.emphasis === true }
}

function zBoxHeight(b, pad) {
  let h = pad + LH_TITLE * b.name.length + (b.sub ? LH_HEAD : 0)
  if (b.desc.length) h += 6 + LH_DESC * b.desc.length
  return h + pad
}

/**
 * Rendert das Zuständigkeiten-Diagramm als SVG-String.
 *
 * @param {object} data  Daten (Schema: zustaendigkeiten.data.json / Pattern §8)
 * @param {object} opts  wie renderOrgchart: primary (Pflicht), font, fontFaceCss,
 *                       responsive, scale, omitTitle (Embeds — Überschrift liefert die Zielseite)
 * @returns {string} SVG
 */
export function renderZustaendigkeiten(data, opts = {}) {
  const primary = opts.primary
  if (!/^#[0-9a-fA-F]{6}$/.test(primary ?? '')) {
    throw new Error('renderZustaendigkeiten: opts.primary fehlt oder ist kein #rrggbb-Hex')
  }
  const font = esc(opts.font ?? DEFAULT_FONT)
  const LINE = HEX.test(opts.line ?? '') ? opts.line : primary
  const TEXT = HEX.test(opts.text ?? '') ? opts.text : '#16181d'
  const secondary = tint(primary, 0.3)   // MVU / weitere VU
  const panelFill = tint(primary, 0.9)   // Verbund-Hintergrund
  const externStroke = tint(primary, 0.3)

  const extern = (data.extern ?? []).map(znorm)
  const verbund = (data.verbund ?? []).map(znorm)
  if (extern.length !== 2) throw new Error('renderZustaendigkeiten: genau 2 externe Boxen nötig (Kanton, Gemeinden)')
  if (!verbund.length) throw new Error('renderZustaendigkeiten: mindestens eine Verbund-Box nötig')
  const title = opts.omitTitle ? '' : (data.title ?? '')

  const cx = Z_W / 2
  const titleY = 42
  const topY = title ? titleY + 30 : 40
  const topH = Math.max(...extern.map((b) => zBoxHeight(b, Z_PAD_TOP)))
  const topBottom = topY + topH

  const panelTop = topBottom + 26
  const vbX = (Z_W - Z_VB_W) / 2
  const vbTops = []
  let y = panelTop + 40
  for (const b of verbund) {
    vbTops.push(y)
    y += zBoxHeight(b, Z_PAD) + Z_GAP_V
  }
  const lastBottom = y - Z_GAP_V
  const panelBottom = lastBottom + 40
  const height = panelBottom + (data.asOf ? 44 : 24)

  const sizeAttrs = svgSizeAttrs(Z_W, height, opts)
  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" ${sizeAttrs} ` +
    `viewBox="0 0 ${Z_W} ${height}" font-family="${font}" role="img" aria-label="${esc(data.title || 'Zuständigkeiten')}">`]
  // <title>/<desc> als SVG-Semantik — unabhängig vom sichtbaren Titel (omitTitle).
  const externNames = extern.map((b) => b.name.join(' ')).join(' und ')
  const chainNames = verbund.map((b) => b.name.join(' ')).join(' → ')
  const descText = `Zuständigkeiten und Arbeitsteilung zwischen ${externNames} ` +
    `und dem Verbund: ${chainNames}.` + (data.asOf ? ` Stand: ${data.asOf}.` : '')
  svg.push(`<title>${esc(data.title || 'Zuständigkeiten')}</title>`, `<desc>${esc(descText)}</desc>`)
  
  svg.push(`<rect width="${Z_W}" height="${height}" fill="white"/>`)
  if (title) {
    svg.push(`<text x="${cx}" y="${titleY}" font-size="22" font-weight="bold" ` +
      `fill="${TEXT}" text-anchor="middle">${esc(title)}</text>`)
  }

  // Verbund-Panel + Verbindungslinien (Linien unter den Boxen, über dem Panel)
  svg.push(`<rect x="${Z_PANEL_PAD + 80}" y="${panelTop}" width="${Z_W - 2 * (Z_PANEL_PAD + 80)}" ` +
    `height="${panelBottom - panelTop}" fill="${panelFill}"/>`)
  for (const x of Z_TOP_CX) {
    svg.push(`<line x1="${x}" y1="${topBottom}" x2="${x}" y2="${vbTops[0]}" ` +
      `stroke="${LINE}" stroke-width="1.2"/>`)
  }
  for (let i = 1; i < verbund.length; i++) {
    const prevBottom = vbTops[i - 1] + zBoxHeight(verbund[i - 1], Z_PAD)
    svg.push(`<line x1="${cx}" y1="${prevBottom}" x2="${cx}" y2="${vbTops[i]}" ` +
      `stroke="${LINE}" stroke-width="1.2"/>`)
  }

  // Box-Inhalt: name (bold) → sub → desc, horizontal zentriert
  function drawContent(b, bx, bw, by, pad, fill, descOpacity) {
    let ty = by + pad + 13
    for (const line of b.name) {
      svg.push(`<text x="${bx + bw / 2}" y="${ty}" font-size="${FS_TITLE}" font-weight="bold" ` +
        `fill="${fill}" text-anchor="middle">${esc(line)}</text>`)
      ty += LH_TITLE
    }
    ty -= LH_TITLE
    if (b.sub) {
      ty += LH_HEAD
      svg.push(`<text x="${bx + bw / 2}" y="${ty}" font-size="${FS_HEAD}" ` +
        `fill="${fill}" text-anchor="middle">${esc(b.sub)}</text>`)
    }
    if (b.desc.length) {
      ty += 6
      for (const line of b.desc) {
        ty += LH_DESC
        svg.push(`<text x="${bx + bw / 2}" y="${ty}" font-size="${FS_DESC}" ` +
          `fill="${fill}"${descOpacity ? ` fill-opacity="${descOpacity}"` : ''} ` +
          `text-anchor="middle">${esc(line)}</text>`)
      }
    }
  }

  // Externe Boxen (weiss, blauer Rahmen, schwarzer Text)
  extern.forEach((b, i) => {
    const bx = Z_TOP_CX[i] - Z_TOP_W / 2
    svg.push(`<rect x="${bx}" y="${topY}" width="${Z_TOP_W}" height="${topH}" ` +
      `fill="white" stroke="${externStroke}" stroke-width="1.2"/>`)
    drawContent(b, bx, Z_TOP_W, topY, Z_PAD_TOP, TEXT, '0.85')
  })

  // Verbund-Boxen (emphasis = Primary, sonst helleres Blau; weisser Text)
  verbund.forEach((b, i) => {
    svg.push(`<rect x="${vbX}" y="${vbTops[i]}" width="${Z_VB_W}" ` +
      `height="${zBoxHeight(b, Z_PAD)}" fill="${b.emphasis ? primary : secondary}"/>`)
    drawContent(b, vbX, Z_VB_W, vbTops[i], Z_PAD, 'white', '0.92')
  })

  if (data.asOf) {
    svg.push(`<text x="${Z_PANEL_PAD + 80}" y="${height - 24}" font-size="12" ` +
      `fill="${TEXT}" text-anchor="start">Stand: ${esc(data.asOf)}</text>`)
  }
  svg.push('</svg>')
  return svg.join('\n')
}

