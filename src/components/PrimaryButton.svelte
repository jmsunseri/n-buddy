<script lang="ts">
	import Button from './Button.svelte';
	export let classes: string = '';
	export let disabled: boolean = false;
</script>

<Button
	on:click
	classes={`${
		disabled ? 'bg-gray text-black' : 'bg-nintendo text-white'
	}  rounded-md shadow-md py-2 px-3 text-semibold ${classes}`}
	{disabled}
>
	<slot />
</Button>
