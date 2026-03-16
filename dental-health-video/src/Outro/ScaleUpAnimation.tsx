import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BRAND_COLORS } from './types';

interface ScaleUpAnimationProps {
  logoScale: number;
}

export const ScaleUpAnimation: React.FC<ScaleUpAnimationProps> = ({ logoScale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blockConfigs = [
    { color: BRAND_COLORS.accent, delay: 0, size: 160 },
    { color: BRAND_COLORS.lightBlue, delay: 10, size: 220 },
    { color: BRAND_COLORS.white, delay: 20, size: 280 },
    { color: BRAND_COLORS.accent, delay: 30, size: 340 },
    { color: BRAND_COLORS.lightBlue, delay: 40, size: 400 },
  ];

  const getBlockStyle = (config: typeof blockConfigs[0]) => {
    const progress = spring({
      frame: frame - config.delay,
      fps,
      config: { damping: 12, stiffness: 80 },
    });

    const scale = interpolate(progress, [0, 1], [0, 1]);
    const opacity = interpolate(progress, [0, 1], [0, 0.5]);
    const rotation = interpolate(progress, [0, 1], [-45, 0]);

    return {
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      opacity,
    };
  };

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {blockConfigs.map((block, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: block.size,
            height: block.size,
            backgroundColor: block.color,
            borderRadius: block.size / 2,
            boxShadow: `0 0 40px ${block.color}50`,
            ...getBlockStyle(block),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
