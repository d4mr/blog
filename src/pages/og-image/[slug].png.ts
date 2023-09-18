import type { APIContext, GetStaticPaths } from "astro";
import { getEntryBySlug } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "@/site-config";
import { getAllPosts, getFormattedDate } from "@/utils";

import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";

const ogOptions: SatoriOptions = {
	width: 1200,
	height: 630,
	// debug: true,
	fonts: [
		{
			name: "Roboto Mono",
			data: Buffer.from(RobotoMono),
			weight: 400,
			style: "normal",
		},
		{
			name: "Roboto Mono",
			data: Buffer.from(RobotoMonoBold),
			weight: 700,
			style: "normal",
		},
	],
};

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
			<div tw="flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 24 24" shape-rendering="crispEdges">
					<metadata>Made with Pixels to Svg https://codepen.io/shshaw/pen/XbxvNj</metadata>
					<path
						stroke="#b04304"
						d="M10 2h1M9 3h1M8 4h1M15 4h1M7 5h1M14 5h1M17 5h1M6 6h1M10 6h1M17 6h1M5 7h1M10 7h1M13 7h1M5 8h1M10 8h1M13 8h1M4 9h1M13 9h1M4 10h1M13 10h1M10 11h1M10 12h1M13 12h1M10 13h1M16 13h1M10 14h1M8 15h1M13 15h1M18 15h1M6 16h1M14 16h1M18 16h1M5 17h1M10 17h1M14 17h1M18 17h1M5 18h1M10 18h1M14 18h1M18 18h1M5 19h1M10 19h1M14 19h1M18 19h1M6 20h1M14 20h1M9 21h1"
					/>
					<path
						stroke="#53c68c"
						d="M11 2h1M10 3h2M9 4h3M16 4h3M8 5h5M15 5h2M18 5h1M7 6h2M11 6h5M18 6h1M6 7h2M11 7h1M14 7h1M6 8h1M11 8h1M14 8h1M5 9h7M14 9h1M5 10h7M14 10h1M11 11h5M11 12h1M14 12h1M11 13h2M17 13h2M11 14h9M9 15h3M14 15h3M19 15h1M7 16h5M15 16h1M19 16h1M6 17h2M11 17h1M15 17h1M19 17h1M6 18h1M11 18h1M15 18h1M19 18h1M6 19h1M11 19h1M15 19h1M19 19h1M7 20h5M15 20h1M10 21h2"
					/>
				</svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

export async function GET({ params: { slug } }: APIContext) {
	const post = await getEntryBySlug("post", slug!);
	const title = post?.data.title ?? siteConfig.title;
	const postDate = getFormattedDate(
		post?.data.updatedDate ?? post?.data.publishDate ?? Date.now(),
		{
			weekday: "long",
			month: "long",
		},
	);
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getAllPosts();
	return posts.filter(({ data }) => !data.ogImage).map(({ slug }) => ({ params: { slug } }));
};
