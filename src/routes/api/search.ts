import { supabase } from '$lib/supabaseClient';
import type { IGame } from '$models/IGame';
import type { EndpointOutput, Request } from '@sveltejs/kit';

export const post = async ({ body }: Request): Promise<EndpointOutput> => {
	const { skip, take, search } = body as any;
	const { data, error } = await supabase
		.from<IGame>('games')
		.select('id, title, url, box_art_url, price_range, release_date')
		.ilike('title', `%${search}%`)
		.range(skip, skip + take);

	if (error) {
		console.error(error);
	}

	try {
		return {
			status: 200,
			body: JSON.stringify({
				games: data.slice(0, take),
				hasMore: data.length > take
			})
		};
	} catch {
		return {
			status: 500
		};
	}
};
