<script lang="ts">
	import axios from 'axios';
	import SecondaryButton from '$comp/SecondaryButton.svelte';
	import TextField from '$comp/TextField.svelte';
	import type { IGame } from '$models/IGame';
	import PrimaryButton from '$comp/PrimaryButton.svelte';
	import GameCard from '$comp/GameCard.svelte';
	import Spinner from '$comp/Spinner.svelte';
	import { session } from '$store/session';
	import type { Session } from '@supabase/gotrue-js';
	import WatchUnWatchButton from '$comp/WatchUnWatchButton.svelte';

	let search: string;
	let skip = 0;
	let take = 10;
	let games: IGame[] = [];
	let hasMore = false;
	let loading = false;

	let watching: string[] = [];

	let userId: string;

	session.subscribe((ses: Session) => (userId = ses?.user?.id));

	const fetchWatching = async () => {
		if (userId) {
			try {
				const response = await axios({
					method: 'get',
					url: `/api/watch?userId=${userId}`
				});
				watching = response?.data?.ids;
			} finally {
			}
		}
	};

	$: userId && fetchWatching();

	const fetch = async () => {
		loading = true;
		try {
			const response = await axios({
				method: 'post',
				url: '/api/search',
				data: {
					skip,
					take,
					search
				}
			});
			return response;
		} finally {
			loading = false;
		}
	};

	const onNewSearch = async () => {
		loading = true;
		skip = 0;
		games = [];
		try {
			const response = await fetch();
			games = response.data.games;
			hasMore = response.data.hasMore;
		} finally {
			loading = false;
		}
	};

	const onSearchKeyUp = (event: KeyboardEvent) => {
		if (event.code === 'Enter') {
			onNewSearch();
		}
	};

	const onGetMore = async () => {
		loading = true;
		skip += 10;
		try {
			const response = await fetch();
			games = games.concat(response.data.games);
			hasMore = response.data.hasMore;
		} finally {
			loading = false;
		}
	};
</script>

<div class="flex flex-col gap-5 h-full">
	<div class="flex flex-col md:flex-row gap-3 justify-center px-3">
		<TextField placeholder="Super Mario Bros..." bind:value={search} on:keyup={onSearchKeyUp} />
		<div class="flex flex-col justify-end">
			<PrimaryButton disabled={loading} on:click={onNewSearch}>Search</PrimaryButton>
		</div>
	</div>
	<div class="flex flex-col gap-3 h-full overflow-y-auto pt-3">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
			{#each games as game}
				<GameCard {game}>
					<WatchUnWatchButton {game} {userId} isWatching={watching.includes(game.id)} />
				</GameCard>
			{/each}
		</div>

		{#if loading}
			<div class="flex flex-row justify-center text-nintendo">
				<Spinner size={50} />
			</div>
		{/if}
		{#if hasMore && !loading}
			<SecondaryButton on:click={onGetMore}>Get More!!!</SecondaryButton>
		{/if}
	</div>
</div>
