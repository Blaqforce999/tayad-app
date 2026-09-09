import { useState } from 'react';
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native';

import Svg, { Line, Path } from 'react-native-svg';

import { tokens } from '@/lib/tokens';

type TrendChartProps = {
  // Pages read per day, oldest first.
  data: number[];
  height?: number;
  style?: ViewStyle;
};

// A single-series sparkline: pages read per day. One colour (sage — the design
// system's progress role), thin marks, no gridlines, no per-point labels. The
// headline percentage above it carries the number; this shows the shape.
//
// Deliberately non-interactive: 14 points across a phone card gives ~20px hit
// targets, well under the 44px minimum, so a tooltip layer would be unusable.
export function TrendChart({ data, height = 64, style }: TrendChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const max = Math.max(...data, 0);
  const hasReading = data.length > 1 && max > 0;

  // Inset so a 2px stroke at the extremes isn't clipped.
  const pad = 2;
  const plotHeight = height - pad * 2;

  const points = hasReading && width > 0
    ? data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = pad + plotHeight - (value / max) * plotHeight;
        return { x, y };
      })
    : [];

  const linePath = points.length
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
    : '';
  const areaPath = points.length
    ? `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`
    : '';

  const total = data.reduce((sum, value) => sum + value, 0);

  return (
    <View
      style={[{ height }, style]}
      onLayout={onLayout}
      accessibilityRole="image"
      accessibilityLabel={
        hasReading
          ? `Daily reading over the last ${data.length} days. ${total} pages in total, best day ${max} pages.`
          : 'No reading logged in the last two weeks yet.'
      }
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {hasReading ? (
            <>
              <Path d={areaPath} fill={tokens.colors.tertiary} fillOpacity={0.12} />
              <Path
                d={linePath}
                stroke={tokens.colors.tertiary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </>
          ) : null}
          {/* Recessive solid baseline, one shade off the surface. */}
          <Line
            x1={0}
            y1={height - 0.5}
            x2={width}
            y2={height - 0.5}
            stroke={tokens.colors.divider}
            strokeWidth={1}
          />
        </Svg>
      ) : null}
    </View>
  );
}

