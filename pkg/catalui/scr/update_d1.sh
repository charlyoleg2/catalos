#!/usr/bin/env bash
# scr/update_d1.sh

cd $(dirname $0)/..

degit_and_update () {
	local onedir=$(basename $1)
	rm -fr tmp/${onedir}
	npx degit $1 tmp/${onedir}
	node scr/update_db_section.js --inDir tmp/${onedir}/refs --outDir d1/parts/$2
}

echo "update_d1.sh says Hello!"
#node scr/update_db_section.js --inDir ../../../cabane/refs --outDir d1/parts/charli78
#node scr/update_db_section.js --inDir ../../../ustensile/refs --outDir d1/parts/jack08
degit_and_update "https://github.com/charlyoleg2/ustensile" "jack08"
degit_and_update "https://github.com/charlyoleg2/gears_and_springs" "charli78"
echo "update_d1.sh says Bye!"
