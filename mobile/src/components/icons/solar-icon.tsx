import { SvgXml } from 'react-native-svg';

import { COLORS, type ColorName } from '@/theme/tokens';

import { SOLAR, type SolarName } from './solar';

type Props = {
  name: SolarName;
  size?: number;
  color?: ColorName;
};

/** A Solar icon from the design. Decorative by default: label the control that holds it instead. */
export function SolarIcon({ name, size = 24, color = 'foreground' }: Props) {
  return (
    <SvgXml
      xml={SOLAR[name]}
      width={size}
      height={size}
      color={COLORS[color]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
