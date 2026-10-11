import { contrast } from './index.mjs';

// Theme coverage and geometry: every Mermaid colour group is set from semantic brand roles.
// Corporate colours are resolved here, outside the neutral component package.
export const MERMAID_WRAPPING_WIDTH = 260;
export const MERMAID_NODE_PADDING = 10;

function shade(hex, amount) {
  return '#' + hex.slice(1).match(/../g).map(channel =>
    Math.round(parseInt(channel, 16) * (1 - amount)).toString(16).padStart(2, '0')
  ).join('');
}

export function mermaidPalette(brand) {
  const c = brand.modes.light;
  const seeds = [c.primary, c.success, c.warning, c.destructive, c['muted-foreground']];
  return Array.from({ length: 12 }, (_, i) => {
    let colour = shade(seeds[i % seeds.length], Math.floor(i / seeds.length) * 0.16);
    while (contrast('#ffffff', colour) < 4.5) colour = shade(colour, 0.08);
    return colour;
  });
}

export function mermaidClassDefs(brand) {
  const c = brand.modes.light;
  return [['source', c['muted-foreground']], ['delivery', c.primary], ['consumer', c['primary-hover']]]
    .map(([name, fill]) => `classDef ${name} fill:${fill},color:${contrast('#ffffff', fill) >= 4.5 ? '#ffffff' : '#000000'},stroke:${shade(fill, 0.24)},stroke-width:2px;`)
    .join('\n');
}

export function mermaidTheme(brand, mode = 'light', fontFamily = brand.typography.family) {
  const c = brand.modes[mode] ?? brand.modes.light;
  const palette = mermaidPalette(brand);
  const theme = {
    fontFamily, fontSize: '15px', background: 'transparent',
    primaryColor: c.muted, primaryTextColor: c.foreground, primaryBorderColor: c.input,
    secondaryColor: c.secondary, secondaryTextColor: c.foreground,
    secondaryBorderColor: c.input, tertiaryColor: c.card,
    tertiaryTextColor: c.foreground, tertiaryBorderColor: c.border,
    mainBkg: c.muted, nodeBorder: c.input, lineColor: c['muted-foreground'], textColor: c.foreground,
    clusterBkg: c.card, clusterBorder: c.border, titleColor: c.foreground, edgeLabelBackground: c.card,
    actorBkg: c.muted, actorBorder: c.input, actorTextColor: c.foreground, actorLineColor: c['muted-foreground'],
    signalColor: c.foreground, signalTextColor: c.foreground,
    labelBoxBkgColor: c.muted, labelBoxBorderColor: c.input, labelTextColor: c.foreground, loopTextColor: c.foreground,
    noteBkgColor: c.secondary, noteBorderColor: c.input, noteTextColor: c.foreground,
    sequenceNumberColor: c.card,
    pieOpacity: '1', pieSectionTextColor: '#ffffff', pieStrokeColor: c.card,
    pieOuterStrokeColor: c.card, pieStrokeWidth: '2px', pieOuterStrokeWidth: '2px',
    pieTitleTextColor: c.foreground, pieLegendTextColor: c.foreground,
  };
  palette.forEach((colour, i) => {
    theme[`cScale${i}`] = colour;
    theme[`cScaleLabel${i}`] = '#ffffff';
    theme[`cScaleInv${i}`] = shade(colour, 0.24);
    theme[`cScalePeer${i}`] = shade(colour, 0.16);
    theme[`pie${i + 1}`] = colour;
    if (i < 8) { theme[`git${i}`] = colour; theme[`gitBranchLabel${i}`] = '#ffffff'; }
  });
  return theme;
}

export function mermaidThemeCSS(brand, mode = 'light') {
  const c = brand.modes[mode] ?? brand.modes.light;
  // Mermaid 12's timeline borrows the white category label for its axis and
  // brightens event fills by 120%. Override inside the exported SVG as well.
  return `.lineWrapper line { stroke: ${c['muted-foreground']} !important; }
    marker#arrowhead path { fill: ${c['muted-foreground']}; }
    .eventWrapper { filter: none !important; }`;
}
