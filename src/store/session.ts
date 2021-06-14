import type { Session } from '@supabase/gotrue-js';
import { writable } from 'svelte/store';

const session = writable<Session>(undefined);

export { session };
