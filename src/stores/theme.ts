import { atom } from "nanostores";

export const $theme = atom<"dark" | "light">(
	(() => {
		const storedTheme = typeof localStorage !== "undefined" && localStorage.getItem("theme");
		return (storedTheme ||
			(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")) as
			| "dark"
			| "light";
	})(),
);
