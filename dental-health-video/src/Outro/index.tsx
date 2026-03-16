import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  Audio,
  staticFile,
  Sequence,
} from 'remotion';
import { AnimationStyle, BRAND_COLORS } from './types';
import { SlideInAnimation } from './SlideInAnimation';
import { ScaleUpAnimation } from './ScaleUpAnimation';
import { GridRevealAnimation } from './GridRevealAnimation';

interface OutroProps {
  animationStyle?: AnimationStyle;
  durationInFrames?: number;
}

export const Outro: React.FC<OutroProps> = ({
  animationStyle = 'slideIn',
  durationInFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  const textProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [40, 0]);

  const renderAnimation = () => {
    switch (animationStyle) {
      case 'scaleUp':
        return <ScaleUpAnimation logoScale={logoScale} />;
      case 'gridReveal':
        return <GridRevealAnimation logoScale={logoScale} />;
      default:
        return <SlideInAnimation logoScale={logoScale} />;
    }
  };

  const bgProgress = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  const bgOpacity = interpolate(bgProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.primary }}>
      {animationStyle === 'scaleUp' ? (
        <>
          <Sequence from={0} durationInFrames={30}>
            <Audio src={staticFile('bubble-1.wav')} volume={0.6} />
          </Sequence>
          <Sequence from={10} durationInFrames={30}>
            <Audio src={staticFile('bubble-2.wav')} volume={0.6} />
          </Sequence>
          <Sequence from={20} durationInFrames={30}>
            <Audio src={staticFile('bubble-3.wav')} volume={0.6} />
          </Sequence>
          <Sequence from={30} durationInFrames={30}>
            <Audio src={staticFile('bubble-4.wav')} volume={0.6} />
          </Sequence>
          <Sequence from={40} durationInFrames={30}>
            <Audio src={staticFile('bubble-5.wav')} volume={0.6} />
          </Sequence>
        </>
      ) : (
        <Audio src={staticFile('swoosh.mp3')} volume={0.5} />
      )}
      
      <AbsoluteFill
        style={{
          backgroundColor: BRAND_COLORS.background,
          opacity: bgOpacity,
        }}
      />
      
      {renderAnimation()}

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Img
            src={staticFile('logo.webp')}
            style={{
              width: 800,
              height: 'auto',
              filter: 'drop-shadow(0 0 40px rgba(94, 178, 242, 0.6)) drop-shadow(0 0 80px rgba(94, 178, 242, 0.3))',
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 180,
          zIndex: 20,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: BRAND_COLORS.white,
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: 3,
              textShadow: '0 0 30px rgba(94, 178, 242, 0.8), 0 0 60px rgba(94, 178, 242, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            dentalhealth.al
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: BRAND_COLORS.accent,
                fontFamily: 'system-ui, sans-serif',
                textShadow: '0 0 25px rgba(94, 178, 242, 0.9), 0 0 50px rgba(94, 178, 242, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              +355 68 665 8888
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 400,
                color: BRAND_COLORS.white,
                fontFamily: 'system-ui, sans-serif',
                textShadow: '0 0 20px rgba(94, 178, 242, 0.7), 0 0 40px rgba(94, 178, 242, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              info@dentalhealth.al
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
