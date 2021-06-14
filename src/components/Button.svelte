<script lang="ts">
	export let classes: string = '';
	export let disabled: boolean = false;
</script>

<button on:click class={`focus:outline-none ${classes}`} {disabled}>
	<slot />
</button>
