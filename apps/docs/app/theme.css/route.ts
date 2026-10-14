// Static export: written to out/theme.css at build time. The layout links it render-blocking in <head>.
import {brands, toCssVariables} from '@rapold/framework-brands';
import {themeStylesheet} from '../_components/theme-boot';
export const dynamic = 'force-static';
export function GET() {
  return new Response(themeStylesheet(brands, toCssVariables), {headers: {'Content-Type': 'text/css; charset=utf-8'}});
}
