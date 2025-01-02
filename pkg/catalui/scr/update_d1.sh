#!/usr/bin/env bash
# scr/update_d1.sh

cd $(dirname $0)/..
echo "update_d1.sh says Hello!"
#node scr/update_db.js --inDir ../../../cabane/refs --outDir d1/designs/tuto-1
node scr/update_db.js --inDir ../../../ustensile/refs --outDir d1/designs/tuto-1
###
npx degit https://github.com/charlyoleg2/gears_and_springs tmp/
node scr/update_db.js --inDir tmp/gears_and_springs/refs --outDir d1/designs/tuto-1
echo "update_d1.sh says Bye!"
