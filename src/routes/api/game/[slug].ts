import { supabase } from '$lib/supabaseClient';
import type { IGame } from '$models/IGame';
import type { EndpointOutput } from '@sveltejs/kit';

export const get = async ({ params }): Promise<EndpointOutput> => {
	try {
		const { slug } = params;
		let { data: game } = await supabase
			.from<IGame>('games')
			.select(
				`id, 
        title, 
        description, 
        url, 
        box_art_url, 
        price_range, 
        release_date, 
        msrp, 
        lowest_price, 
        sale_price,
        number_of_players,
        genres:game_genres( genre:genre_id( id, description ) ),
        developers:game_developers( developer:developer_id( id, description ) ),
        publishers:game_publishers( publisher:publisher_id( id, description ) ),
        esrbs:game_esrb_descriptions( esrb:esrb_description_id( id, description ) )`
			)
			.eq('slug', slug)
			.maybeSingle();
		return {
			status: 200,
			body: JSON.stringify({
				game
			})
		};
	} catch (e) {
		console.log(e);
		return {
			status: 500
		};
	}
};
