<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let path = '';
	let dispatch = createEventDispatcher();
</script>

<a
	href={path}
	on:click={(event) => {
		if (!path) {
			event.preventDefault();
			dispatch('click');
		}
	}}
	class={`text-gray-700 py-2 px-3 text-gray text-semibold hover:bg-nintendo hover:bg-opacity-10 whitespace-nowrap`}
>
	<slot />
</a>
