import { cssSupports } from '@rocket.chat/css-in-js';
import tokenColors from '@rocket.chat/fuselage-tokens/colors.json';
import { memoize } from '@rocket.chat/memo';
import invariant from 'invariant';

export {
  borderRadius,
  borderWidth,
  fontFamily,
  fontScale,
  inset,
  margin,
  padding,
  size,
} from '@rocket.chat/fuselage-box';

const mapTypeToPrefix = {
  neutral: 'n',
  primary: 'b',
  info: 'b',
  success: 'g',
  warning: 'y',
  danger: 'r',
};

const getPaletteColor = (type, grade, alpha) => {
  invariant(
    grade % 100 === 0 && grade / 100 >= 1 && grade / 100 <= 9,
    'invalid color grade'
  );
  invariant(
    alpha === undefined || (alpha >= 0 && alpha <= 1),
    'invalid color alpha'
  );

  const prefix = mapTypeToPrefix[type];
  invariant(!!prefix, 'invalid color type');

  const baseColor = tokenColors[`${prefix}${grade}`];

  invariant(!!baseColor, 'invalid color reference');

  const matches = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(
    baseColor
  );

  invariant(!!matches, 'invalid color token format');

  if (alpha !== undefined) {
    const [, r, g, b] = matches;
    return [
      `--rcx-color-${type}-${grade}-${(alpha * 100).toFixed(0)}`,
      `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${
        alpha * 100
      }%)`,
    ];
  }

  return [`--rcx-color-${type}-${grade}`, baseColor];
};

const foregroundColors = {
  'default': tokenColors.n800,
  'info': tokenColors.n700,
  'hint': tokenColors.n600,
  'disabled': tokenColors.n400,
  'alternative': 'white',
  'primary': tokenColors.b500,
  'success': tokenColors.g500,
  'danger': tokenColors.r500,
  'warning': tokenColors.y700,
  'link': tokenColors.b500,
  'visited-link': tokenColors.p500,
  'active-link': tokenColors.r500,
};

const getForegroundColor = (type) => {
  const color = foregroundColors[type];
  invariant(!!color, 'invalid foreground color');

  return [`--rcx-color-foreground-${type}`, color];
};

const paletteColorRegex = /^(neutral|primary|info|success|warning|danger)-(\d+)(-(\d+))?$/;

export const color = memoize((propValue) => {
  if (typeof propValue !== 'string') {
    return;
  }

  const paletteMatches = paletteColorRegex.exec(String(propValue));

  if (paletteMatches) {
    const [, type, gradeString, , alphaString] = paletteMatches;
    const grade = parseInt(gradeString, 10);
    const alpha =
      alphaString !== undefined ? parseInt(alphaString, 10) / 100 : undefined;
    const [customProperty, color] = getPaletteColor(type, grade, alpha);

    if (customProperty && cssSupports('(--foo: bar)')) {
      return `var(${customProperty}, ${color})`;
    }

    return color;
  }

  if (propValue === 'surface') {
    if (cssSupports('(--foo: bar)')) {
      return 'var(--rcx-color-surface, white)';
    }

    return 'white';
  }

  if (foregroundColors[String(propValue)]) {
    const [customProperty, color] = getForegroundColor(String(propValue));

    if (customProperty && cssSupports('(--foo: bar)')) {
      return `var(${customProperty}, ${color})`;
    }

    return color;
  }

  return propValue;
});
