<script lang="ts">
	export let placeholder: string;
	export let value: string;
	export let disabled = false;
</script>

<div
	class="shadow-inner py-2 px-3 rounded-md border border-gray border-opacity-10 focus-within:ring-nintendo focus-within:ring-4 focus-within:ring-opacity-20 "
>
	<input {placeholder} class="focus:outline-none" type="text" bind:value {disabled} on:keyup />
</div>
