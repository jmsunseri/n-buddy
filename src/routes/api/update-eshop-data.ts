import { supabase } from '$lib/supabaseClient';
import type { IDeveloper } from '$models/IDeveloper';
import type { IEsrbDescription } from '$models/IEsrbDescription';
import type { IGame } from '$models/IGame';
import type { IGenre } from '$models/IGenre';
import type { IPublisher } from '$models/IPublisher';
import type { EndpointOutput } from '@sveltejs/kit';
import { getGamesAmerica } from 'nintendo-switch-eshop';

export const get = async (): Promise<EndpointOutput> => {
	try {
		console.log('starting eshop update');

		const americanGames = await getGamesAmerica();
		let { data: genres } = await supabase.from<IGenre>('genres').select('id, description');
		let { data: publishers } = await supabase
			.from<IPublisher>('publishers')
			.select('id, description');
		let { data: developers } = await supabase
			.from<IDeveloper>('developers')
			.select('id, description');
		let { data: esrbDescriptions } = await supabase
			.from<IEsrbDescription>('esrb_descriptions')
			.select('id, description');

		console.log('existing reference data fetched');

		// the types description doesn't match what comes back from the API unfortunately
		const newGenres = americanGames.reduce((newGenres: string[], g: any) => {
			return [
				...newGenres,
				...g.genres.filter(
					(s: string) =>
						!newGenres.includes(s) &&
						!genres?.find(
							(gen: IGenre) => s.toLocaleUpperCase() === gen.description.toLocaleUpperCase()
						)
				)
			];
		}, []);

		console.log('new genres', newGenres.length);

		const newPublishers = americanGames.reduce((newPublishers: string[], g: any) => {
			return [
				...newPublishers,
				...g.publishers.filter(
					(s: string) =>
						!newPublishers.includes(s) &&
						!publishers?.find(
							(pub: IPublisher) => s.toLocaleUpperCase() === pub.description.toLocaleUpperCase()
						)
				)
			];
		}, []);

		console.log('new publishers', newPublishers.length);

		const newDevelopers = americanGames.reduce((newDevelopers: string[], g: any) => {
			return [
				...newDevelopers,
				...g.developers.filter(
					(s: string) =>
						!newDevelopers.includes(s) &&
						!developers?.find(
							(dev: IDeveloper) => s.toLocaleUpperCase() === dev.description.toLocaleUpperCase()
						)
				)
			];
		}, []);

		console.log('new developers', newDevelopers.length);

		const newEsrb = americanGames.reduce((newEsrb: string[], g: any) => {
			return [
				...newEsrb,
				...g.esrbDescriptors.filter(
					(s: string) =>
						!newEsrb.includes(s) &&
						!esrbDescriptions?.find(
							(esrb: IEsrbDescription) =>
								s.toLocaleUpperCase() === esrb.description.toLocaleUpperCase()
						)
				)
			];
		}, []);

		console.log('new esrb', newEsrb.length);

		try {
			const updates = await supabase
				.from<IGenre>('genres')
				.insert(newGenres.map((description: string) => ({ description })));

			if (!updates.error) {
				genres = [...(genres || []), ...(updates.data || [])];
				console.log('genres updated');
			} else {
				console.log('error updating genres', updates.error);
			}
		} catch (error) {
			console.log('error updating genres', error);
		}

		try {
			const updates = await supabase
				.from<IDeveloper>('developers')
				.insert(newDevelopers.map((description: string) => ({ description })));
			if (!updates.error) {
				developers = [...(developers || []), ...(updates.data || [])];
				console.log('developers updated');
			} else {
				console.log('error updating developers', updates.error);
			}
		} catch (error) {
			console.log('error updating developers', error);
		}

		try {
			const updates = await supabase
				.from<IPublisher>('publishers')
				.insert(newPublishers.map((description: string) => ({ description })));
			if (!updates.error) {
				publishers = [...(publishers || []), ...(updates.data || [])];
				console.log('publishers updated');
			} else {
				console.log('error updating publishers', updates.error);
			}
		} catch (error) {
			console.log('error updating publishers', error);
		}

		try {
			const updates = await supabase
				.from<IEsrbDescription>('esrb_descriptions')
				.insert(newEsrb.map((description: string) => ({ description })));
			if (!updates.error) {
				esrbDescriptions = [...(esrbDescriptions || []), ...(updates.data || [])];
				console.log('esrb updated');
			} else {
				console.log('error updating esrb', updates.error);
			}
		} catch (error) {
			console.log('error updating esrb', error);
		}

		const games = americanGames
			.filter((ag: any) => (ag.platform = 'Nintendo Switch' && ag.title && ag.objectID))
			.map((g: any): {
				game: IGame;
				developers: { developer_id: string; game_id: string }[];
				genres: { genre_id: string; game_id: string }[];
				publishers: { genre_id: string; game_id: string }[];
				esrbs: { esrb_description_id: string; game_id: string }[];
			} => ({
				developers: g.developers.map((d: string) => ({
					game_id: g.objectID,
					developer_id: developers.find((i) => i.description === d)?.id
				})),
				genres: [...new Set(g.genres)].map((d: string) => ({
					game_id: g.objectID,
					genre_id: genres.find((i) => i.description === d)?.id
				})),
				publishers: g.publishers.map((d: string) => ({
					game_id: g.objectID,
					publisher_id: publishers.find((i) => i.description === d)?.id
				})),
				esrbs: g.esrbDescriptors.map((d: string) => ({
					game_id: g.objectID,
					esrb_description_id: esrbDescriptions.find((i) => i.description === d)?.id
				})),
				game: {
					box_art_url: g.boxart || null,
					description: g.description || null,
					id: g.objectID,
					last_modified: g.lastModified || null,
					platform: g.platform || null,
					price_range: g.priceRange || null,
					slug: g.slug || null,
					title: g.title,
					url: g.url || null,
					release_date: g.releaseDateDisplay || null,
					esrb_rating: g.esrbRating || null,
					lowest_price: g.lowestPrice || null,
					msrp: g.msrp || null,
					number_of_players: g.numOfPlayers || null,
					sale_price: g.salePrice || null
				}
			}));

		let count = 100;

		while (games.length) {
			const temp = games.splice(0, 100);
			const { error } = await supabase.from<IGame>('games').upsert(
				temp.map((t) => t.game),
				{ count: 'exact' }
			);
			const { error: gameDeveloperError } = await supabase.from('game_developers').upsert(
				temp.flatMap((t) => t.developers),
				{ count: 'exact' }
			);
			const { error: gamePublishersError } = await supabase.from('game_publishers').upsert(
				temp.flatMap((t) => t.publishers),
				{ count: 'exact' }
			);
			const { error: gameGenresError } = await supabase.from('game_genres').upsert(
				temp.flatMap((t) => t.genres),
				{ count: 'exact' }
			);
			const { error: gameEsrbError } = await supabase.from('game_esrb_descriptions').upsert(
				temp.flatMap((t) => t.esrbs),
				{ count: 'exact' }
			);

			if (error) {
				console.error('error updating games', error);
			}
			if (gameDeveloperError) {
				console.error('game developer upsert error', gameDeveloperError);
			}
			if (gamePublishersError) {
				console.error('game publisher upsert error', gamePublishersError);
			}
			if (gameGenresError) {
				console.error('game genre upsert error', gameGenresError);
				console.log(temp.map((x) => x.game));
				console.log(temp.map((x) => x.genres));
				return;
			}
			if (gameEsrbError) {
				console.error('game esrb upsert error', gameEsrbError);
			}

			console.log(`${count - temp.length} - ${count} of ${games.length + count}`);
			count += temp.length;
		}

		return {
			status: 200,
			body: JSON.stringify({
				done: true
			})
		};
	} catch (e) {
		console.log(e);
		return {
			status: 500
		};
	}
};
