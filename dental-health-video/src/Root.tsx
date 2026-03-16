import "./index.css";
import { Composition } from "remotion";
import { MainComposition } from "./Composition";
import { AnimationStyle } from "./Outro/types";

const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  videoDurationInSeconds: 41.8,
  outroDurationInSeconds: 4,
};

const totalDurationInFrames = Math.round(
  (VIDEO_CONFIG.videoDurationInSeconds + VIDEO_CONFIG.outroDurationInSeconds) * VIDEO_CONFIG.fps
);

const outroDurationInFrames = Math.round(
  VIDEO_CONFIG.outroDurationInSeconds * VIDEO_CONFIG.fps
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DentalHealth-SlideIn"
        component={MainComposition}
        durationInFrames={totalDurationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          animationStyle: 'slideIn' as AnimationStyle,
          outroDurationInFrames,
        }}
      />
      <Composition
        id="DentalHealth-ScaleUp"
        component={MainComposition}
        durationInFrames={totalDurationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          animationStyle: 'scaleUp' as AnimationStyle,
          outroDurationInFrames,
        }}
      />
      <Composition
        id="DentalHealth-GridReveal"
        component={MainComposition}
        durationInFrames={totalDurationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          animationStyle: 'gridReveal' as AnimationStyle,
          outroDurationInFrames,
        }}
      />
    </>
  );
};
