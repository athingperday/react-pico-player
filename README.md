# React Pico Player

## Installation

```sh
npm install @athingperday/react-pico-player
```

## Usage

```tsx
import { Pico8Player } from "@athingperday/react-pico-player";

export const MyComponent = () => {
	return (
		<Pico8Player
			carts={[
				{
					name: "name of your cart",
					src: "url to .p8.png image", // blobs and data uris should work as well
					// alternatively, instead of `src` you could pass:
					// rom: [0, ..., 0] (an array of bytes that make up the rom)
				},
				// you can also provide multiple carts (up to 16) if you care to
			]}
		/>
	);
};
```
