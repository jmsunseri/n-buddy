<script lang="ts">
	import Button from './Button.svelte';
	export let classes: string = '';
	export let disabled: boolean = false;
</script>

<Button
	on:click
	classes={`bg-white ${
		disabled ? 'text-gray-300' : 'text-gray-700'
	}  rounded-md shadow py-2 px-3 text-semibold border-gray border-opacity-10 border ${classes} hover:ring-nintendo hover:ring-4 hover:ring-opacity-20`}
	{disabled}
>
	<slot />
</Button>
