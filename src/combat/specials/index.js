import { mistField } from './mistField.js';
import { cinematicCombo } from './cinematicCombo.js';
import { teleportStrike } from './teleportStrike.js';
import { ritual } from './ritual.js';
import { erase } from './erase.js';
import { marionette } from './marionette.js';
import { supernova } from './supernova.js';
import { abyssMaze } from './abyssMaze.js';

// Tipos de especial disponíveis. Cada personagem escolhe um em `special.type`.
// Para criar um tipo novo: { canStart(f, sp, world), start(f, sp, world) → {update(dt)→done, cancel()} }
export const SPECIALS = { mistField, cinematicCombo, teleportStrike, ritual, erase, marionette, supernova, abyssMaze };
