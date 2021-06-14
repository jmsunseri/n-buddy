<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import PrimaryButton from '$comp/PrimaryButton.svelte';
	import SecondaryButton from '$comp/SecondaryButton.svelte';
	import TextField from '$comp/TextField.svelte';
	import { session } from '$store/session';
	import type { Session, User } from '@supabase/gotrue-js';
	import Spinner from '$comp/Spinner.svelte';

	let loading = false;
	let userName: string;
	let user: User;

	const getProfile = async (u: User) => {
		try {
			loading = true;

			let { data, error, status } = await supabase
				.from('profiles')
				.select(`username`)
				.eq('id', u.id)
				.single();

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				userName = data.username;
			}
		} catch (error) {
			alert(error.message);
		} finally {
			loading = false;
		}
	};

	const updateProfile = async (username: string) => {
		try {
			loading = true;
			const user = supabase.auth.user();

			const updates = {
				id: user.id,
				username,
				updated_at: new Date()
			};

			let { error } = await supabase.from('profiles').upsert(updates, {
				returning: 'minimal' // Don't return the value after inserting
			});

			if (error) {
				throw error;
			}
		} catch (error) {
			alert(error.message);
		} finally {
			loading = false;
		}
	};

	session.subscribe((ses: Session) => {
		user = ses?.user;
		if (user) {
			getProfile(user);
		}
	});
</script>

<div class="flex flex-col gap-2">
	<TextField placeholder="Email" value={user?.email} disabled />
	<TextField placeholder="Name" bind:value={userName} />

	<div class="flex flex-row gap-3">
		<PrimaryButton on:click={() => updateProfile(userName)} disabled={loading}>
			<div class="flex flex-row gap-3">
				{loading ? 'Loading ...' : 'Update'}
				{#if loading}
					<Spinner />
				{/if}
			</div>
		</PrimaryButton>
	</div>
</div>
