#!/usr/bin/env python3
import argparse
import subprocess
import os

RATIOS = {
    "9:16": {"width": 1080, "height": 1920},
    "4:5": {"width": 1080, "height": 1350},
    "3:4": {"width": 1080, "height": 1440},
}

def process_video(input_path, output_path, filter_str):
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", filter_str,
        "-c:v", "libopenh264", "-preset", "fast", "-crf", "23",
        "-c:a", "copy", output_path
    ]
    subprocess.run(cmd, check=True)

def main():
    parser = argparse.ArgumentParser(description="Resize video to 9:16, 4:5, or 3:4")
    parser.add_argument("input", help="Input video file")
    args = parser.parse_args()

    base_name = os.path.splitext(args.input)[0]

    nine_sixteen_path = f"{base_name}_9_16.mp4"
    process_video(args.input, nine_sixteen_path, "scale=1080:1920")

    four_five_path = f"{base_name}_4_5.mp4"
    process_video(nine_sixteen_path, four_five_path, "crop=1080:1350:0:285")

    three_four_path = f"{base_name}_3_4.mp4"
    process_video(nine_sixteen_path, three_four_path, "crop=1080:1440:0:240")

if __name__ == "__main__":
    main()
