import { View, type ViewStyle } from 'react-native';

import WordmarkLg from '@/assets/logo/wordmark-large.svg';
import WordmarkSm from '@/assets/logo/wordmark.svg';

type WordmarkProps = {
  // 'sm' is the in-app header mark, 'lg' the splash / welcome mark.
  size?: 'sm' | 'lg';
  style?: ViewStyle;
};

// Dimensions are the source SVG viewBoxes (75x29 and 118x46) so the amber dot
// and the "tayad" wordmark keep their exact proportions.
const VARIANTS = {
  sm: { Svg: WordmarkSm, width: 75, height: 29 },
  lg: { Svg: WordmarkLg, width: 118, height: 46 },
} as const;

export function Wordmark({ size = 'sm', style }: WordmarkProps) {
  const { Svg, width, height } = VARIANTS[size];

  return (
    <View style={style}>
      <Svg width={width} height={height} />
    </View>
  );
}
