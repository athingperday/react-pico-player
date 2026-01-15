// @ts-ignore
import { P8 } from "./veryRawRenderCart.js";

export type PicoBool = 0 | 1;

export type RenderCart = (
	Module: { canvas: HTMLCanvasElement; codo_textarea?: HTMLTextAreaElement },
	cartNames: string[],
	cartDatas: number[][],
	audioContext: AudioContext
) => {
	p8_touch_detected?: PicoBool;
	p8_dropped_cart?: string;
	p8_dropped_cart_name?: string;
	pico8_state?: Partial<{
		frame_number: number;
		has_focus: PicoBool;
		is_paused: PicoBool;
		request_pointer_lock: PicoBool;
		require_page_navigate_confirmation: PicoBool;
		show_dpad: PicoBool;
		shutdown_requested: PicoBool;
		sound_volume: number;
	}>;
	pico8_buttons?: [
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number
	];
	pico8_gamepads?: { count: number };
	pico8_gpio?: number[]; // should be 128 length
	pico8_audio_context?: AudioContext;
	pico8_mouse?: [number, number, number];
	codo_command?: number;
};

const typedRenderCart = P8 as RenderCart;

export { typedRenderCart as renderCart };
