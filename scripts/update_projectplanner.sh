#!/usr/bin/env bash
set -euo pipefail

PAGES_ROOT="/Users/j/Desktop/schuwaong.github.io"
PLANNER_ROOT="/Users/j/Desktop/project-growth-agents"
ADB="/Users/j/Desktop/android-tools/platform-tools/adb"

cd "$PLANNER_ROOT"
python3 scripts/run_daily_agents.py

rm -rf "$PAGES_ROOT/projectplanner"
mkdir -p "$PAGES_ROOT/projectplanner"
cp -R "$PLANNER_ROOT/public/." "$PAGES_ROOT/projectplanner/"

echo "Updated GitHub Pages planner mirror:"
echo "$PAGES_ROOT/projectplanner"

if [ -x "$ADB" ] && "$ADB" get-state >/dev/null 2>&1; then
  echo "ADB device detected. Rebuilding and reinstalling Android planner..."
  bash "$PLANNER_ROOT/scripts/build_android_planner.sh"
  bash "$PLANNER_ROOT/scripts/install_android_planner.sh"
else
  echo "No ADB device detected. Web planner was updated; Android install skipped."
  echo "Connect the phone with USB debugging enabled, then rerun this script."
fi
