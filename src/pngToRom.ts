import UPNG from "upng-js";

// Same byte extraction you already have, just operating on raw RGBA bytes
const rgbaToRom = (rgba: Uint8Array, width: number, height: number) => {
	const n = Math.min(width * height, 0x8000);
	const out = new Uint8Array(n);

	for (let i = 0; i < n; i++) {
		const p = i * 4;
		const r = rgba[p + 0];
		const g = rgba[p + 1];
		const b = rgba[p + 2];
		const a = rgba[p + 3];

		out[i] =
			((b & 3) << 0) | ((g & 3) << 2) | ((r & 3) << 4) | ((a & 3) << 6);
	}

	return Array.from(out);
};

export const pngToRom = async (src: string) => {
	const ab = await fetch(src).then((r) => r.arrayBuffer());
	const png = UPNG.decode(ab);
	const rgbaFrames = UPNG.toRGBA8(png);
	const rgba = new Uint8Array(rgbaFrames[0]); // first frame

	return rgbaToRom(rgba, png.width, png.height);
};
