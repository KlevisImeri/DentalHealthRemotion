import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BRAND_COLORS } from './types';

interface GridRevealAnimationProps {
  logoScale: number;
}

export const GridRevealAnimation: React.FC<GridRevealAnimationProps> = ({ logoScale }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cols = 6;
  const rows = 10;
  const blockWidth = width / cols;
  const blockHeight = height / rows;

  const colors = [BRAND_COLORS.primary, '#0d4a7c', BRAND_COLORS.accent];

  const getBlockDelay = (row: number, col: number) => {
    const centerX = (cols - 1) / 2;
    const centerY = (rows - 1) / 2;
    const distance = Math.sqrt(Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2));
    return distance * 3;
  };

  const blocks: Array<{ row: number; col: number; color: string; delay: number }> = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = (row + col) % colors.length;
      blocks.push({
        row,
        col,
        color: colors[colorIndex],
        delay: getBlockDelay(row, col),
      });
    }
  }

  return (
    <AbsoluteFill>
      {blocks.map((block, index) => {
        const progress = spring({
          frame: frame - block.delay,
          fps,
          config: { damping: 20, stiffness: 100 },
        });

        const scale = interpolate(progress, [0, 1], [0, 1]);
        const opacity = interpolate(progress, [0, 1], [0, 0.6]);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: block.col * blockWidth,
              top: block.row * blockHeight,
              width: blockWidth - 2,
              height: blockHeight - 2,
              backgroundColor: block.color,
              transform: `scale(${scale})`,
              opacity,
              transformOrigin: 'center center',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
