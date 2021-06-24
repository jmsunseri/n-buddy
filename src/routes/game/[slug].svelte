<script context="module" lang="ts">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */

	export async function load({ page, fetch }) {
		const response = await fetch(`/api/game/${page.params.slug}`);

		if (response.ok) {
			return {
				props: await response.json()
			};
		}

		return {
			status,
			error: new Error(`Could not load ${page.params.slug}`)
		};
	}
</script>

<script lang="ts">
	import Link from '$comp/Link.svelte';
	import WatchUnWatchButton from '$comp/WatchUnWatchButton.svelte';
	import type { IGame } from '$models/IGame';
	import { session } from '$store/session';
	import type { Session } from '@supabase/supabase-js';

	import dayjs from 'dayjs';

	let userId: string;

	session.subscribe((ses: Session) => (userId = ses?.user?.id));

	export let game: IGame;

	$: release_date = dayjs(game.release_date).isValid()
		? dayjs(game.release_date).format('YYYY-MM-DD')
		: game.release_date || '';
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-col md:flex-row gap-3 p-2 relative">
		<img src={game.box_art_url} class="h-72 w-72" alt={`Box Art ${game.title}`} />
		<div class="flex flex-col gap-3 flex-1">
			<div class="flex flex-col md:flex-row justify-between gap-3">
				<div class="text-3xl font-bold">{game.title}</div>
				<div class="md:absolute md:top-1 md:right-1">
					<WatchUnWatchButton {game} isWatching {userId} />
				</div>
			</div>
			<div>
				{`Release Date: ${release_date}`}
			</div>
			<div class="flex flex-row gap-3">
				Genres:
				{#each game.genres.map((x) => x.genre) as genre}
					<Link url="">{genre.description}</Link>
				{/each}
			</div>
			<div class="flex flex-row gap-3">
				Developer(s):
				{#each game.developers.map((x) => x.developer) as developer}
					<Link url="">{developer.description}</Link>
				{/each}
			</div>
			<div class="flex flex-row gap-3">
				Publisher(s):
				{#each game.publishers.map((x) => x.publisher) as publisher}
					<Link url="">{publisher.description}</Link>
				{/each}
			</div>
			<div>
				{`Current Price: ${game.sale_price || game.msrp || ''}, Range ${game.price_range || ''}`}
			</div>
			<Link url={game.url}>eShop Link</Link>
		</div>
	</div>
	<div class="text-xl">Description:</div>
	<div>
		{game.description}
	</div>
</div>
