<script lang="ts">
	import axios from 'axios';
	import SecondaryButton from '$comp/SecondaryButton.svelte';
	import WatchUnWatchButton from '$comp/WatchUnWatchButton.svelte';
	import TextField from '$comp/TextField.svelte';
	import PrimaryButton from '$comp/PrimaryButton.svelte';
	import GameCard from '$comp/GameCard.svelte';
	import Spinner from '$comp/Spinner.svelte';
	import type { IWatch } from '$models/IWatch';
	import { onMount } from 'svelte';
	import SnackBar from '$comp/SnackBar.svelte';
	import { session } from '$store/session';
	import type { Session } from '@supabase/gotrue-js';

	let filter: string;
	let skip = 0;
	let take = 5;
	let watches: IWatch[] = [];
	let hasMore = false;
	let loading = false;
	let snackBar: SnackBar;
	let userId: string;

	session.subscribe((ses: Session) => (userId = ses ? ses.user.id : undefined));

	const fetch = async () => {
		loading = true;
		if (userId) {
			try {
				const response = await axios({
					method: 'post',
					url: '/api/watch',
					data: {
						skip,
						take,
						filter,
						userId
					}
				});
				return response;
			} finally {
				loading = false;
			}
		}
	};

	const onNewSearch = async () => {
		loading = true;
		skip = 0;
		watches = [];
		try {
			const response = await fetch();
			watches = response.data.watches;
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
		skip += 5;
		try {
			const response = await fetch();
			watches = watches.concat(response.data.watches);
			hasMore = response.data.hasMore;
		} finally {
			loading = false;
		}
	};

	onMount(() => onNewSearch());
</script>

<div class="flex flex-col gap-5 h-full">
	<div class="flex flex-row gap-3 justify-center">
		<TextField placeholder="Filter..." bind:value={filter} on:keyup={onSearchKeyUp} />
		<div class="flex flex-col justify-end">
			<PrimaryButton disabled={loading} on:click={onNewSearch}>Filter</PrimaryButton>
		</div>
	</div>
	<hr class="border-t-4 border-gray border-opacity-20" />
	<div class="flex flex-col gap-3 h-full overflow-y-auto pt-3">
		{#each watches as watch}
			<GameCard game={watch.game}>
				<WatchUnWatchButton game={watch.game} {userId} isWatching />
			</GameCard>
		{/each}
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
<SnackBar bind:this={snackBar} />
