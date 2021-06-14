<script lang="ts">
	import RotateClockwise2 from 'tabler-icons-svelte/icons/RotateClockwise2.svelte';
	export let size = 24;
</script>

<span class={`fill-current animate-spin`}>
	<RotateClockwise2 {size} />
</span>
