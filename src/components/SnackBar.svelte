<script lang="ts">
	let isVisible = false;
	let m = '';

	export const show = (message: string, timeout: number = 5000) => {
		isVisible = true;
		m = message;

		setTimeout(() => {
			isVisible = false;
		}, timeout);
	};
</script>

{#if isVisible}
	<div class="absolute bottom-0 left-0 w-full flex flex-row justify-center pb-5">
		<div class="py-2 px-4 bg-gray rounded-md shadow-md text-white">
			{m}
		</div>
	</div>
{/if}
