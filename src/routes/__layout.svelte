<script lang="ts">
	import '../app.css';
	import DeviceGamepad from 'tabler-icons-svelte/icons/DeviceGamepad.svelte';
	import CaretDown from 'tabler-icons-svelte/icons/CaretDown.svelte';
	import CaretUp from 'tabler-icons-svelte/icons/CaretUp.svelte';
	import LinkButton from '$comp/LinkButton.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { session } from '$store/session';
	import Menu from '$comp/Menu.svelte';
	import MenuItem from '$comp/MenuItem.svelte';
	import { goto } from '$app/navigation';

	let isLoggedIn = false;
	let isAccountMenuVisible = false;

	onMount(() => {
		const ses = supabase.auth.session();
		session.set(ses);
		isLoggedIn = !!ses;
	});
</script>

<div class="bg-nintendo w-full shadow-md text-gray sticky top-0">
	<div
		class="text-white font-bold flex flex-row items-center container mx-auto py-2 justify-between"
	>
		<div class="flex flex-row gap-1 items-center text-xl">
			<div class="flex flex-row">
				<div class="transform rotate-90">
					<DeviceGamepad size={24} color="white" />
				</div>
				<div class="transform -rotate-90 -ml-2">
					<DeviceGamepad size={24} color="white" />
				</div>
			</div>
			N Buddy
		</div>
		<div class="flex flex-row items-center">
			<LinkButton path="/">Search</LinkButton>
			{#if isLoggedIn}
				<LinkButton path="watching">Watching</LinkButton>
			{/if}
			{#if !isLoggedIn}
				<LinkButton path="auth">Login</LinkButton>
			{:else}
				<Menu
					isVisible={isAccountMenuVisible}
					on:click={() => {
						isAccountMenuVisible = false;
					}}
				>
					<LinkButton on:click={() => (isAccountMenuVisible = !isAccountMenuVisible)} slot="anchor">
						Account
						{#if !isAccountMenuVisible}
							<CaretDown size={24} />
						{:else}
							<CaretUp size={24} />
						{/if}
					</LinkButton>
					<MenuItem path="account">Profile</MenuItem>
					<MenuItem
						on:click={() => {
							supabase.auth.signOut();
							goto('/');
						}}>Sign Out</MenuItem
					>
				</Menu>
			{/if}
		</div>
	</div>
</div>
<div class="container mx-auto pt-5 text-gray pb-20 h-full">
	<slot />
</div>
