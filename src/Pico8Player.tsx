"use client";
import { PicoCart, PicoPlayerHandle, makePicoConsole } from "./renderCart";
import {
	MutableRefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

export type Pico8ConsoleImperatives = {
	getPicoConsoleHandle(): PicoPlayerHandle | null;
};

export type Pico8ConsoleProps = {
	carts: PicoCart[];
	consoleRef?: MutableRefObject<PicoPlayerHandle | null>;
};

export const Pico8Player = (props: Pico8ConsoleProps) => {
	const { carts, consoleRef } = props;
	const [playing, setPlaying] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const attachConsole = useCallback(async () => {
		const picoConsole = await makePicoConsole({
			carts,
		});
		picoConsole.canvas.tabIndex = 0;
		if (ref.current) {
			ref.current.appendChild(picoConsole.canvas);

			// Set the width and height because pico8 adds them as properties on chrome-based browsers
			picoConsole.canvas.style.width = "100%";
			picoConsole.canvas.style.height = "100%";

			picoConsole.canvas.focus();
		}
		if (consoleRef) {
			consoleRef.current = picoConsole;
		}
		picoConsole.canvas.addEventListener(
			"keydown",
			(event) => {
				if (
					[
						"ArrowUp",
						"ArrowDown",
						"ArrowLeft",
						"ArrowRight",
					].includes(event.key)
				) {
					event.preventDefault();
				}
			},
			{ passive: false }
		);
		picoConsole.canvas.addEventListener("click", () => {
			picoConsole.canvas.focus();
		});
	}, [carts]);
	useEffect(() => {
		if (playing) {
			attachConsole();
			return () => {
				if (ref.current) {
					ref.current.innerHTML = "";
				}
			};
		}
	}, [playing, attachConsole]);
	if (!playing) {
		return (
			<div
				ref={ref}
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					aspectRatio: "1",
					backgroundColor: "black",
					color: "white",
					cursor: "pointer",
				}}
				tabIndex={0}
				onClick={() => {
					setPlaying(true);
				}}
			>
				Play!
			</div>
		);
	}
	return (
		<div
			ref={ref}
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		></div>
	);
};
