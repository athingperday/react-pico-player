import { pngToRom } from "./pngToRom";
import { RenderCart, renderCart as rawRenderCart } from "./rawRenderCart";

export type PicoCart =
	| {
			name: string;
			src: string;
	  }
	| {
			name: string;
			rom: number[];
	  };

type PlayerButtons = {
	left: boolean;
	right: boolean;
	up: boolean;
	down: boolean;
	o: boolean;
	x: boolean;
	menu: boolean;
};

export type PicoPlayerHandle = {
	raw: ReturnType<RenderCart>;
	rawModule: unknown;
	// external things
	readonly canvas: HTMLCanvasElement;

	// i/o
	setButtons: (buttons: PlayerButtons[]) => void;
	setMouse: (mouse: {
		x: number;
		y: number;
		leftClick: boolean;
		rightClick: boolean;
	}) => void;
	setGamepadCount: (count: number) => void;
	gpio: number[];
	// & {subscribe: (f: (gpio: number[]) => void) => void} // read + write (should be 256-tuple)

	// state
	readonly state: {
		frameNumber: number;
		isPaused: boolean;
		hasFocus: boolean;
		requestPointerLock: boolean;
		requirePageNavigateConfirmation: boolean;
		showDpad: boolean;
		shutdownRequested: boolean;
		soundVolume: number;
	};

	// misc?
	setTouchDetected: (touchDetected: boolean) => void;
	dropCart: (cart: PicoCart) => void;

	// Module
	toggleSound: () => void;
	toggleControlMenu: () => void;
	togglePaused: () => void;
	// TODO: rename these two better (what do they do??)
	modDragOver: () => void;
	modDragStop: () => void;
};

const bitfield = (...args: boolean[]): number => {
	if (!args.length) {
		return 0;
	}
	return (args[0] ? 1 : 0) + 2 * bitfield(...args.slice(1));
};

const getRom = async (cart: PicoCart) => {
	if ("src" in cart) {
		return await pngToRom(cart.src);
	} else if ("rom" in cart) {
		return cart.rom;
	}
	const ASSERT_cart: never = cart;
	throw Error("Bad cart input");
};

export const makePicoConsole = async (props: {
	canvas?: HTMLCanvasElement;
	codoTextarea?: HTMLTextAreaElement;
	audioContext?: AudioContext;
	carts: PicoCart[];
}): Promise<PicoPlayerHandle> => {
	const {
		carts,
		canvas = document.createElement("canvas"),
		codoTextarea = document.createElement("textarea"),
		audioContext = new AudioContext(),
	} = props;
	canvas.style.imageRendering = "pixelated";
	codoTextarea.style.display = "none";
	codoTextarea.style.position = "fixed";
	codoTextarea.style.left = "-9999px";
	codoTextarea.style.height = "0px";
	codoTextarea.style.overflow = "hidden";
	const Module = { canvas, keyboardListeningElement: canvas };
	const cartsDatas = await Promise.all(carts.map((cart) => getRom(cart)));
	const handle = rawRenderCart(
		Module,
		carts.map((cart) => cart.name),
		cartsDatas,
		audioContext
	);
	handle.pico8_state = {};
	handle.pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0];
	handle.pico8_mouse = [0, 0, 0];
	handle.pico8_gpio = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	];
	handle.pico8_gamepads = { count: 0 };
	return {
		raw: handle,
		rawModule: Module,
		canvas,
		state: {
			frameNumber: handle.pico8_state.frame_number!,
			isPaused: !!handle.pico8_state.is_paused!,
			hasFocus: !!handle.pico8_state.has_focus!,
			requestPointerLock: !!handle.pico8_state.request_pointer_lock!,
			requirePageNavigateConfirmation:
				!!handle.pico8_state.require_page_navigate_confirmation!,
			showDpad: !!handle.pico8_state.show_dpad!,
			shutdownRequested: !!handle.pico8_state.shutdown_requested!,
			soundVolume: handle.pico8_state.sound_volume!,
		},
		gpio: handle.pico8_gpio as PicoPlayerHandle["gpio"],
		setMouse({ x, y, leftClick, rightClick }) {
			handle.pico8_mouse = [x, y, bitfield(leftClick, rightClick)];
		},
		setButtons(buttons) {
			// TODO: pad this properly here instead of casting
			handle.pico8_buttons = buttons.map(
				({ left, right, up, down, o, x, menu }) =>
					bitfield(left, right, up, down, o, x, menu)
			) as any;
		},
		setGamepadCount(count) {
			handle.pico8_gamepads = { count };
		},
		setTouchDetected(touchDetected) {
			handle.p8_touch_detected = touchDetected ? 1 : 0;
		},
		dropCart(cart) {
			handle.p8_dropped_cart_name = cart.name;
			// TODO: make sure this is a dataURL first, and if not, load it and then pass it in
			// handle.p8_dropped_cart = cart.src;
			// handle.codo_command = 9;
		},
		modDragOver: (Module as any).pico8DragOver,
		modDragStop: (Module as any).pico8DragStop,
		togglePaused: (Module as any).pico8TogglePaused,
		toggleSound: (Module as any).pico8ToggleSound,
		toggleControlMenu: (Module as any).pico8ToggleControlMenu,
	};
};
