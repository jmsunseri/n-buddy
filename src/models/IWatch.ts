import type { IGame } from './IGame';

interface IWatch {
	game_id: string;
	id?: string;
	user_id: string;
	date_added: string;
	game: IGame;
}

export type { IWatch };
