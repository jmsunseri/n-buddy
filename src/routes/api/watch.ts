import { supabase } from '$lib/supabaseClient';
import type { IWatch } from '$models/IWatch';
import type { EndpointOutput, Request } from '@sveltejs/kit';

export const get = async ({ query }: Request): Promise<EndpointOutput> => {
	const userId = query.get('userId');

	const { data, error, status } = await supabase
		.from<IWatch>('watches')
		.select('game_id')
		.match({ user_id: userId });

	if (error) {
		console.error(error);
	}

	try {
		return {
			status: 200,
			body: JSON.stringify({
				ids: data.map((w: IWatch) => w.game_id)
			})
		};
	} catch {
		return {
			status: 500
		};
	}
};

export const post = async ({ body }: Request): Promise<EndpointOutput> => {
	const { userId, skip, take, filter } = body as any;

	const { data, error, status } = await supabase
		.from<IWatch>('watches')
		.select(
			'user_id, game_id, date_added, game:game_id ( id, title, url, box_art_url, price_range, release_date, sale_price, msrp, lowest_price ) '
		)
		.match({ user_id: userId })
		.range(skip, skip + take);

	if (error) {
		console.error(error);
	}

	try {
		return {
			status: 200,
			body: JSON.stringify({
				watches: data,
				hasMore: data.length > take
			})
		};
	} catch {
		return {
			status: 500
		};
	}
};

export const put = async ({ body }: Request): Promise<EndpointOutput> => {
	const { userId, gameId } = body as any;

	const { data, error } = await supabase
		.from<IWatch>('watches')
		.insert({ user_id: userId, game_id: gameId });

	if (error) {
		console.error(error);
	}

	try {
		return {
			status: 200,
			body: JSON.stringify({
				item: data
			})
		};
	} catch {
		return {
			status: 500
		};
	}
};

export const del = async ({ body }: Request): Promise<EndpointOutput> => {
	const { userId, gameId } = body as any;

	const { data, error, count } = await supabase
		.from<IWatch>('watches')
		.delete()
		.match({ user_id: userId, game_id: gameId });

	if (error) {
		console.error(error);
		return {
			status: 500
		};
	}

	return {
		status: 200,
		body: JSON.stringify({
			item: data
		})
	};
};
