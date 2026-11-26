#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=========================================================="
echo "🍏 FedCausalFreshNet (FCFN) - Interactive 3D Showcase"
echo "=========================================================="
echo "Port: 5175"
echo "Target URL: http://localhost:5175"
echo "=========================================================="

npx vite --port 5175

