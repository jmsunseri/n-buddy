<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let path: string = '';
	const dispatch = createEventDispatcher();
</script>

<a
	on:click={(event) => {
		if (!path) {
			event.preventDefault();
			dispatch('click');
		}
	}}
	href={path}
	class={`hover:bg-white hover:bg-opacity-20 text-white rounded-full text-semibold text-sm py-2 px-2 flex flex-row items-center gap-1`}
>
	<slot />
</a>
