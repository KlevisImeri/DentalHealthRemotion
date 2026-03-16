import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BRAND_COLORS } from './types';

interface SlideInAnimationProps {
  logoScale: number;
}

export const SlideInAnimation: React.FC<SlideInAnimationProps> = ({ logoScale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blockConfigs = [
    { from: 'left', color: BRAND_COLORS.accent, delay: 0 },
    { from: 'right', color: BRAND_COLORS.lightBlue, delay: 6 },
    { from: 'top', color: BRAND_COLORS.white, delay: 12 },
    { from: 'bottom', color: BRAND_COLORS.accent, delay: 18 },
    { from: 'left', color: BRAND_COLORS.white, delay: 24 },
    { from: 'right', color: BRAND_COLORS.lightBlue, delay: 30 },
  ];

  const getBlockStyle = (config: typeof blockConfigs[0], index: number) => {
    const progress = spring({
      frame: frame - config.delay,
      fps,
      config: { damping: 15, stiffness: 100 },
    });

    let x = 0, y = 0;
    const offset = (index % 2 === 0 ? -1 : 1) * (250 + index * 60);

    switch (config.from) {
      case 'left':
        x = interpolate(progress, [0, 1], [offset, 0]);
        break;
      case 'right':
        x = interpolate(progress, [0, 1], [-offset, 0]);
        break;
      case 'top':
        y = interpolate(progress, [0, 1], [offset, 0]);
        break;
      case 'bottom':
        y = interpolate(progress, [0, 1], [-offset, 0]);
        break;
    }

    const scale = interpolate(progress, [0, 1], [0.5, 1]);
    const opacity = interpolate(progress, [0, 1], [0, 0.7]);

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
    };
  };

  const blocks = [
    { x: '-30%', y: '-35%', size: 140 },
    { x: '30%', y: '-30%', size: 120 },
    { x: '-35%', y: '25%', size: 100 },
    { x: '35%', y: '30%', size: 130 },
    { x: '-15%', y: '45%', size: 90 },
    { x: '20%', y: '-10%', size: 80 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {blocks.map((block, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `calc(50% + ${block.x})`,
            top: `calc(50% + ${block.y})`,
            width: block.size,
            height: block.size,
            backgroundColor: blockConfigs[index].color,
            borderRadius: 16,
            boxShadow: `0 0 30px ${blockConfigs[index].color}40`,
            ...getBlockStyle(blockConfigs[index], index),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
