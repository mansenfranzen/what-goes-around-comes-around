import { earlyGames } from './games-early.js';
import { modernGames } from './games-modern.js';

const games = { ...earlyGames, ...modernGames };

export function mountGame(name, root) {
  if (!Object.hasOwn(games, name)) throw new Error(`Unknown experiment: ${name}`);
  root.onclick = null;
  root.oninput = null;
  root.replaceChildren();
  root.scrollTop = 0;
  games[name](root);
}

export const gameNames = Object.keys(games);
