export interface IGame {
	id: string;
	last_modified: number;
	title: string;
	description: string;
	url: string;
	slug: string;
	box_art_url: string;
	platform: string;
	price_range: string;
	release_date: string;
	esrb_rating: string;
	msrp: number;
	lowest_price: number;
	sale_price?: number;
	number_of_players: string;
}
