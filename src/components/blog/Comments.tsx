import Giscus from "@giscus/react";
import { useStore } from "@nanostores/preact";
import { theme } from "@/stores/theme";

const Comments = () => {
	const $isDarkMode = useStore(theme) === "dark";

	return (
		<Giscus
			id="comments"
			repo="d4mr/d4mr.github.io"
			repoId="R_kgDOKU7qjQ"
			category="giscus"
			categoryId="DIC_kwDOKU7qjc4CZZ80"
			mapping="pathname"
			strict="0"
			reactionsEnabled="1"
			emitMetadata="0"
			inputPosition="top"
			theme={$isDarkMode ? "transparent_dark" : "light"}
			lang="en"
			loading="lazy"
		/>
	);
};

export default Comments;
