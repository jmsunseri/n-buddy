<script lang="ts">
	import dayjs from 'dayjs';
	import type { IGame } from '$models/IGame';
	export let game: IGame;

	let release_date = '???';

	$: release_date = dayjs(game.release_date).isValid()
		? dayjs(game.release_date).format('YYYY-MM-DD')
		: game.release_date || '';
</script>

<div class="flex flex-col md:flex-row gap-3 p-2 relative">
	<img src={game.box_art_url} class="h-44 w-44" alt={`Box Art ${game.title}`} />
	<div class="flex flex-col gap-3 flex-1">
		<div class="flex flex-col md:flex-row justify-between gap-3">
			<div class="text-xl font-bold">{game.title}</div>
			<div class="md:absolute md:top-1 md:right-1">
				<slot />
			</div>
		</div>
		<div>
			{`Release Date: ${release_date}`}
		</div>
		<div>
			{`Current Price: ${game.sale_price || game.msrp || ''}, Range ${game.price_range || ''}`}
		</div>
		<a class="underline text-blue-600" href={game.url}>eShop Link</a>
	</div>
</div>
