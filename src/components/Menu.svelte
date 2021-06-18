<script lang="ts">
	export let isVisible = false;
</script>

<div class="relative">
	<slot name="anchor" />
	{#if isVisible}
		<div
			on:click
			class="absolute top-8 left-0 bg-white rounded-md shadow-md overflow-hidden flex flex-col gap-1"
		>
			<slot />
		</div>
	{/if}
</div>
