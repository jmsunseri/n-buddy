<script lang="ts">
	import { goto } from '$app/navigation';

	import { supabase } from '$lib/supabaseClient';
	import type { IGame } from '$models/IGame';
	import axios from 'axios';
	import { createEventDispatcher } from 'svelte';
	import SecondaryButton from './SecondaryButton.svelte';
	import SnackBar from './SnackBar.svelte';
	import Spinner from './Spinner.svelte';

	export let isWatching: boolean;
	export let userId: string;
	export let game: IGame;

	const dispatch = createEventDispatcher();

	let isLoading = false;

	let snackBar: SnackBar;

	const add = async (gameId: string) => {
		const userId = supabase.auth.session()?.user.id;
		if (userId) {
			isLoading = true;

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
					dispatch('watched', game.id);
				} else {
					snackBar.show('There was an error adding the game');
				}
			} catch {
				snackBar.show('There was an error adding the game');
			} finally {
				isLoading = false;
			}
		} else {
			goto('/auth');
		}
	};

	const deleteWatch = async (gameId: string) => {
		isLoading = true;
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
					dispatch('unwatched', game.id);
				} else {
					snackBar.show('Error');
				}
			} catch {
				snackBar.show('Error');
			} finally {
				isLoading = false;
			}
		}
	};
</script>

{#if !isWatching}
	<SecondaryButton
		disabled={isLoading}
		on:click={(event) => {
			event.stopPropagation();
			add(game.id);
		}}
	>
		{#if isLoading}
			<div class="flex flex-row gap-1">
				Adding... <Spinner />
			</div>
		{:else}
			Watch
		{/if}
	</SecondaryButton>
{:else}
	<SecondaryButton
		disabled={isLoading}
		on:click={(event) => {
			event.stopPropagation();
			deleteWatch(game.id);
		}}
	>
		{#if isLoading}
			<div class="flex flex-row gap-1">
				Removing... <Spinner />
			</div>
		{:else}
			Un-Watch
		{/if}
	</SecondaryButton>
{/if}
<SnackBar bind:this={snackBar} />
