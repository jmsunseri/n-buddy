import { supabase } from '$lib/supabaseClient';
import type { IGame } from '$models/IGame';
import type { EndpointOutput } from '@sveltejs/kit';
import { getGamesAmerica } from 'nintendo-switch-eshop';

export const get = async (): Promise<EndpointOutput> => {
	try {
		const americanGames = await getGamesAmerica();

		const games = americanGames
			.filter((ag: any) => (ag.platform = 'Nintendo Switch' && ag.title))
			.map(
				(g: any): IGame => ({
					box_art_url: g.boxart || null,
					description: g.description || null,
					id: g.objectID,
					last_modified: g.lastModified,
					platform: g.platform || null,
					price_range: g.priceRange || null,
					slug: g.slug,
					title: g.title,
					url: g.url || null,
					release_date: g.releaseDateDisplay || null
				})
			);

		while (games.length) {
			const temp = games.splice(0, 100);
			const { error } = await supabase.from<IGame>('games').upsert(temp, { count: 'exact' });

			if (error) {
				console.error(error);
			}
		}

		return {
			status: 200,
			body: JSON.stringify({
				done: true
			})
		};
	} catch {
		return {
			status: 500
		};
	}
};
