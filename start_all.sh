#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🍏 FedCausalFreshNet 2.0 - Starting Complete Ecosystem"
echo "=========================================================="

# Clean up child processes on Ctrl+C or script termination
cleanup() {
  echo ""
  echo "🛑 Stopping all FedCausalFreshNet services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Python Causal Intelligence Backend (Port 8000)
echo "⚡ [1/3] Starting Python Causal Backend on http://localhost:8000 ..."
env/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# 2. Start Main React Fridge Dashboard (Port 3000)
echo "📱 [2/3] Starting Main Fridge Dashboard on http://localhost:3000 ..."
npm run dev &

# 3. Start 3D Interactive WebGL Narrative Showcase (Port 5175)
echo "🍎 [3/3] Starting 3D Interactive Showcase on http://localhost:5175 ..."
npm --prefix showcase run dev &

echo "=========================================================="
echo "🚀 All Services Running!"
echo "   👉 3D Interactive Showcase : http://localhost:5175"
echo "   👉 Main Fridge Dashboard   : http://localhost:3000"
echo "   👉 Causal Backend API Docs : http://localhost:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C in this terminal to stop all services anytime."

# Wait for all background services
wait

