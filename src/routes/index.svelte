<script lang="ts">
	import axios from 'axios';
	import SecondaryButton from '$comp/SecondaryButton.svelte';
	import TextField from '$comp/TextField.svelte';
	import type { IGame } from '$models/IGame';
	import PrimaryButton from '$comp/PrimaryButton.svelte';
	import GameCard from '$comp/GameCard.svelte';
	import Spinner from '$comp/Spinner.svelte';
	import { supabase } from '$lib/supabaseClient';
	import SnackBar from '$comp/SnackBar.svelte';
	import { session } from '$store/session';
	import type { Session } from '@supabase/gotrue-js';
	import User from 'tabler-icons-svelte/icons/User.svelte';
	import { goto } from '$app/navigation';

	let search: string;
	let skip = 0;
	let take = 5;
	let games: IGame[] = [];
	let hasMore = false;
	let loading = false;
	let snackBar: SnackBar;

	let adding: string[] = [];
	let removing: string[] = [];
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

	const add = async (gameId: string) => {
		const userId = supabase.auth.session()?.user.id;
		if (userId) {
			adding = [...adding, gameId];

			try {
				const response = await axios({
					method: 'put',
					url: '/api/watch',
					data: {
						userId,
						gameId
					}
				});
				if (response.status === 200) {
					snackBar.show('Game Added');
					watching = [...watching, gameId];
				} else {
					snackBar.show('There was an error adding the game');
				}
			} catch {
				snackBar.show('There was an error adding the game');
			} finally {
				adding = adding.filter((a) => a !== gameId);
			}
		} else {
			goto('auth');
		}
	};

	const deleteWatch = async (gameId: string) => {
		removing = [...removing, gameId];
		if (userId) {
			try {
				const response = await axios({
					method: 'delete',
					url: '/api/watch',
					data: {
						userId,
						gameId
					}
				});
				if (response.status === 200) {
					snackBar.show('Game Removed');
					watching = watching.filter((w: string) => w !== gameId);
				} else {
					snackBar.show('Error');
				}
			} catch {
				snackBar.show('Error');
			} finally {
				removing = removing.filter((a) => a !== gameId);
			}
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
		skip += 5;
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
	<div class="flex flex-row gap-3 justify-center">
		<TextField placeholder="Super Mario Bros..." bind:value={search} on:keyup={onSearchKeyUp} />
		<div class="flex flex-col justify-end">
			<PrimaryButton disabled={loading} on:click={onNewSearch}>Search</PrimaryButton>
		</div>
	</div>
	<div class="flex flex-col gap-3 h-full overflow-y-auto pt-3">
		{#each games as game}
			<GameCard {game}>
				{#if !watching.includes(game.id)}
					<SecondaryButton disabled={adding.includes(game.id)} on:click={() => add(game.id)}>
						{#if adding.includes(game.id)}
							<div class="flex flex-row gap-1">
								Adding... <Spinner />
							</div>
						{:else}
							Watch
						{/if}
					</SecondaryButton>
				{:else}
					<SecondaryButton
						disabled={removing.includes(game.id)}
						on:click={() => deleteWatch(game.id)}
					>
						{#if removing.includes(game.id)}
							<div class="flex flex-row gap-1">
								Removing... <Spinner />
							</div>
						{:else}
							Un-Watch
						{/if}
					</SecondaryButton>
				{/if}
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
