import React from 'react';
import {
  AbsoluteFill,
  Video,
  Sequence,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';
import { Outro } from './Outro';
import { AnimationStyle } from './Outro/types';

interface MainCompositionProps {
  animationStyle?: AnimationStyle;
  outroDurationInFrames?: number;
}

const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        right: 40,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <Img
        src={staticFile('logo.webp')}
        style={{
          width: 400,
          height: 'auto',
        }}
      />
    </div>
  );
};

export const MainComposition: React.FC<MainCompositionProps> = ({
  animationStyle = 'slideIn',
  outroDurationInFrames = 45,
}) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const videoSrc = staticFile('pastrim_i_eneve.mp4');
  
  const videoDurationInFrames = durationInFrames - outroDurationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={videoDurationInFrames}>
        <Video
          src={videoSrc}
          style={{
            width,
            height,
            objectFit: 'cover',
          }}
          muted
        />
      </Sequence>

      <Sequence from={videoDurationInFrames} durationInFrames={outroDurationInFrames}>
        <Outro animationStyle={animationStyle} durationInFrames={outroDurationInFrames} />
      </Sequence>

      <Sequence from={0} durationInFrames={videoDurationInFrames}>
        <Watermark />
      </Sequence>
    </AbsoluteFill>
  );
};
