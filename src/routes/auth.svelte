<script lang="ts">
	import { dev } from '$app/env';

	import PrimaryButton from '$comp/PrimaryButton.svelte';
	import SnackBar from '$comp/SnackBar.svelte';
	import Spinner from '$comp/Spinner.svelte';
	import TextField from '$comp/TextField.svelte';
	import { supabase } from '$lib/supabaseClient';

	let loading = false;
	let email: string;
	let snackBar: SnackBar;

	const onLogin = async () => {
		try {
			loading = true;
			const { error } = await supabase.auth.signIn(
				{ email },
				dev ? { redirectTo: 'http://localhost:3000' } : undefined
			);
			if (error) throw error;
			snackBar.show('Check your email for the link.');
		} catch (error) {
			snackBar.show('There was an error sending you an email. Try again.');
		} finally {
			loading = false;
		}
	};

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.code === 'Enter') {
			onLogin();
		}
	};
</script>

<div class="flex flex-col items-center justify-center h-full">
	<div class="flex flex-col gap-3 border-4 rounded-md border-gray shadow-md p-4 border-opacity-20">
		<p>Do you like passwords? Neither do we, and you don't need to create another one.</p>
		<p>Just enter in an email and get your link to access the app. No password needed.</p>
		<TextField placeholder="Your email" bind:value={email} on:keyup={onKeyUp} />

		<PrimaryButton on:click={onLogin} disabled={loading}>
			{#if loading}
				<span class="flex flex-row justify-center gap-3">
					Loading
					<Spinner />
				</span>
			{:else}
				<span>Send magic link</span>
			{/if}
		</PrimaryButton>
	</div>
</div>
<SnackBar bind:this={snackBar} />
