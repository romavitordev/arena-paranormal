import { distXZ } from '../core/util.js';

const BUTTON_PRESS_RADIUS = 1.4;

export function chooseButtonWinner(presses, center, frame) {
  const eligible = presses
    .map((fighter) => ({ fighter, distance: distXZ(fighter.pos, center) }))
    .filter(({ distance }) => distance <= BUTTON_PRESS_RADIUS)
    .sort((a, b) => a.distance - b.distance);
  if (!eligible.length) return null;

  const closest = eligible[0].distance;
  const tied = eligible.filter(({ distance }) => Math.abs(distance - closest) < 0.001);
  if (tied.length === 1) return tied[0].fighter;
  const priority = Math.abs(frame % 2);
  return tied.find(({ fighter }) => fighter.index === priority)?.fighter
    ?? tied.sort((a, b) => a.fighter.index - b.fighter.index)[0].fighter;
}
