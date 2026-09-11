#!/bin/zsh
# Run the full vapor conformance suite directory-by-directory with a per-dir
# watchdog, so a single hanging file can't stall the whole run. Tallies pass/fail
# per dir and prints an aggregate. Usage: ./run-vapor-all.sh [timeout_seconds]
cd "$(dirname "$0")"
TIMEOUT=${1:-150}
TALLY=/tmp/vapor-all-tally.txt
: > "$TALLY"
TOTAL_P=0
TOTAL_F=0
for d in test/*/; do
  name=$(basename "$d")
  log="/tmp/va_${name}.log"
  VAPOR_FULL_SUITE=1 BROWSERS=chromium node ./node_modules/.bin/web-test-runner \
    --config configs/vapor.js --files "test/${name}/**/*.spec.js" > "$log" 2>&1 &
  pid=$!
  w=0
  while kill -0 $pid 2>/dev/null; do
    sleep 3; w=$((w+3))
    if [ $w -ge $TIMEOUT ]; then kill -9 $pid 2>/dev/null; echo "[$name] TIMEOUT" >> "$TALLY"; break; fi
  done
  res=$(grep -oE '[0-9]+ passed, [0-9]+ failed' "$log" | tail -1)
  p=$(echo "$res" | grep -oE '^[0-9]+'); f=$(echo "$res" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+')
  p=${p:-0}; f=${f:-0}
  TOTAL_P=$((TOTAL_P+p)); TOTAL_F=$((TOTAL_F+f))
  echo "[$name] ${res:-NO_RESULT}" | tee -a "$TALLY"
done
echo "==== AGGREGATE: ${TOTAL_P} passed, ${TOTAL_F} failed ====" | tee -a "$TALLY"
