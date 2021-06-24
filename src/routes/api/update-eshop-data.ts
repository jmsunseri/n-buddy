import { supabase } from '$lib/supabaseClient';
import readline from 'readline';
import type { IDeveloper, IEsrb, IGame, IGenre, IPublisher, IPrice } from '$models';
import type { EndpointOutput } from '@sveltejs/kit';
import { GameUS, getGamesAmerica } from 'nintendo-switch-eshop';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

interface IDescribed {
	description: string;
}

interface IGameUpdates {
	game: IGame;
	developers: { developer_id: string; game_id: string }[];
	genres: { genre_id: string; game_id: string }[];
	publishers: { publisher_id: string; game_id: string }[];
	esrbs: { esrb_description_id: string; game_id: string }[];
}

dayjs.extend(duration);

const findNew = (
	games: GameUS[],
	existing: IDescribed[],
	getObjectFromGame: (game: GameUS) => string[]
): string[] => {
	return games.reduce((newStuff: string[], g: GameUS) => {
		return [
			...newStuff,
			...getObjectFromGame(g).filter(
				(s: string) =>
					!newStuff.includes(s) &&
					!existing?.find(
						(described: IDescribed) =>
							s.toLocaleUpperCase() === described.description.toLocaleUpperCase()
					)
			)
		];
	}, []);
};

const addNew = async <T extends IDescribed>(
	table: string,
	newItems: string[],
	existingItems: T[]
): Promise<T[]> => {
	try {
		const updates = await supabase
			.from<T>(table)
			.insert(newItems.map((description: string): T => ({ description } as T)));
		if (!updates.error) {
			console.log(`${table} updated ${newItems.length}`);
			return [...(existingItems || []), ...(updates.data || [])];
		} else {
			console.log(`error updating ${table}`, updates.error);
		}
	} catch (error) {
		console.log(`error updating ${table}`, error);
		return existingItems;
	}
};

const toGameUpdates = (
	games: GameUS[],
	developers: IDeveloper[],
	genres: IGenre[],
	publishers: IPublisher[],
	esrbs: IEsrb[]
): IGameUpdates[] =>
	games
		.filter((ag: GameUS) => (ag.platform = 'Nintendo Switch' && ag.title && ag.objectID))
		.map(
			(g: GameUS): IGameUpdates => ({
				developers: g.developers
					.map((d: string) => ({
						game_id: g.objectID,
						developer_id: developers.find((i) => i.description === d)?.id
					}))
					.filter((x) => !!x.developer_id),
				genres: [...new Set(g.genres)]
					.map((d: string) => ({
						game_id: g.objectID,
						genre_id: genres.find((i) => i.description === d)?.id
					}))
					.filter((x) => !!x.genre_id),
				publishers: g.publishers
					.map((d: string) => ({
						game_id: g.objectID,
						publisher_id: publishers.find((i) => i.description === d)?.id
					}))
					.filter((x) => !!x.publisher_id),
				esrbs: g.esrbDescriptors
					.map((d: string) => ({
						game_id: g.objectID,
						esrb_description_id: esrbs.find((i) => i.description === d)?.id
					}))
					.filter((x) => !!x.esrb_description_id),
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
			})
		);

const writeProgressToConsole = (start: number, completed: number, total: number) => {
	const percentComplete = (completed / total) * 100;
	const rate = (dayjs().valueOf() - start) / completed;
	const duration = dayjs.duration(rate * (total - completed));
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(
		`Complete: ${percentComplete.toFixed(1)}%, Est Time Remaining: ${duration.format('mm:ss')}`
	);
	if (percentComplete >= 100) {
		process.stdout.write('\n');
	}
};

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
		let { data: esrbs } = await supabase.from<IEsrb>('esrb_descriptions').select('id, description');

		console.log('existing reference data fetched');

		const newGenres = findNew(americanGames, genres, (game: GameUS) => game.genres);
		const newPublishers = findNew(americanGames, publishers, (game: GameUS) => game.publishers);
		const newDevelopers = findNew(
			americanGames,
			developers,
			(game: GameUS) => game.esrbDescriptors
		);
		const newEsrb = findNew(americanGames, esrbs, (game: GameUS) => game.esrbDescriptors);

		genres = await addNew('genres', newGenres, genres);
		publishers = await addNew('publishers', newPublishers, publishers);
		developers = await addNew('developers', newDevelopers, developers);
		esrbs = await addNew('esrb_descriptions', newEsrb, esrbs);

		const games: IGameUpdates[] = toGameUpdates(
			americanGames,
			developers,
			genres,
			publishers,
			esrbs
		);
		let count = 100;
		let numberOfPriceUpdates = 0;

		const start = dayjs().valueOf();

		while (games.length) {
			const batch = games.splice(0, 75);
			await supabase.from<IGame>('games').upsert(batch.map((t) => t.game));
			await supabase.from('game_developers').upsert(batch.flatMap((t) => t.developers));
			await supabase.from('game_publishers').upsert(batch.flatMap((t) => t.publishers));
			await supabase.from('game_genres').upsert(batch.flatMap((t) => t.genres));
			await supabase.from('game_esrb_descriptions').upsert(batch.flatMap((t) => t.esrbs));

			const { data } = await supabase
				.from<IPrice>('prices')
				.select('game_id, price, date')
				.in(
					'game_id',
					batch.map((gu: IGameUpdates) => gu.game.id)
				);

			const priceMap =
				data
					?.sort((a: IPrice, b: IPrice) => (a < b ? -1 : a === b ? 0 : 1))
					.reduce((map: { [key: string]: IPrice }, p: IPrice) => {
						map[p.game_id] = p;
						return map;
					}, {}) || {};

			const priceUpdates: IPrice[] = batch.reduce((updates: IPrice[], gu: IGameUpdates) => {
				const todayPrice = gu.game.sale_price || gu.game.msrp;
				if (!!todayPrice && priceMap[gu.game.id]?.price !== `$${todayPrice}`) {
					return [
						...updates,
						{
							game_id: gu.game.id,
							price: todayPrice,
							date: dayjs().format('YYYY-MM-DD')
						}
					];
				}
				return updates;
			}, []);

			const { error } = await supabase.from<IPrice>('prices').upsert(priceUpdates);

			numberOfPriceUpdates += priceUpdates.length;

			if (error) {
				console.log('price update error', error);
				return;
			}

			writeProgressToConsole(start, count, count + games.length);
			count += batch.length;
		}

		console.log('prices updated', numberOfPriceUpdates);

		console.log('completed');

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
