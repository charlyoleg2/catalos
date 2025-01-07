// src/lib/fileExt.ts

function renameExt(iExt: string): string {
	let rExt = `9- ${iExt}`;
	if (['pxJson'].includes(iExt)) {
		rExt = `0-params- ${iExt}`;
	} else if (['txtLog'].includes(iExt)) {
		rExt = `1-log- ${iExt}`;
	} else if (['svg', 'dxf'].includes(iExt)) {
		rExt = `2d- ${iExt}`;
	} else if (['step', 'stp', 'iges', 'igs', 'stl', 'brep', 'glb', '3mf'].includes(iExt)) {
		rExt = `3d- ${iExt}`;
	} else if (['paxJson'].includes(iExt)) {
		rExt = `4-pax- ${iExt}`;
	} else if (['jsCad', 'jsManifold', 'scad', 'pyFreecad'].includes(iExt)) {
		rExt = `5-script- ${iExt}`;
	}
	return rExt;
}

function selectFileTable(iExt: string): boolean {
	const rSelect = iExt === 'image' ? false : true;
	return rSelect;
}

function selectFileVignette(iExt: string): boolean {
	let rSelect = false;
	if (['image', 'svg', 'stl'].includes(iExt)) {
		rSelect = true;
	}
	return rSelect;
}

export { renameExt, selectFileTable, selectFileVignette };
