#!/usr/bin/env bash
# scr/update_designs.js

cd $(dirname $0)/..
echo "update_designs.sh says Hello!"
#node scr/gen_desi.js --inDir ../../../cabane/refs --outDir d1/designs/tuto-1
node scr/gen_desi.js --inDir ../../../ustensile/refs --outDir d1/designs/tuto-1
echo "update_designs.sh says Bye!"
