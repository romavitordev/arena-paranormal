import { readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BASE_CHARACTER,
  BATTLE_DIALOGUES,
  CHARACTER_NAMES,
  INTRO_DIALOGUES,
  INTRO_IDS,
  battleLines,
  victoryLines,
} from '../src/config/dialogues.js';

const FORM_NAMES = {
  deus_morte: 'Deus da Morte',
  diabo: 'Diabo',
  fantasma: 'Fantasma',
  anfitriao: 'O Anfitrião',
};
const characterIds = [...INTRO_IDS, ...Object.keys(BATTLE_DIALOGUES.transform)];
const characterNames = Object.fromEntries(characterIds.map((id) => [id, CHARACTER_NAMES[id] || FORM_NAMES[id]]));
const formatExchange = (scene) => ({
  first: { id: scene.starter, name: characterNames[scene.starter], line: scene.line },
  response: { id: scene.response, name: characterNames[scene.response], line: scene.responseLine },
});

const entries = [];
for (const character of INTRO_IDS) {
  for (const [opponent, scenes] of Object.entries(INTRO_DIALOGUES[character])) {
    entries.push({
      section: 'introductions',
      characterId: character,
      characterName: characterNames[character],
      opponentId: opponent,
      opponentName: characterNames[opponent],
      exchanges: scenes.map(formatExchange),
    });
  }
}

for (const winner of characterIds) {
  for (const loser of characterIds) {
    if (winner === loser) continue;
    const lines = victoryLines(winner, loser, characterNames[loser]);
    if (lines.length) entries.push({
      section: 'victories',
      winnerId: winner,
      winnerName: characterNames[winner],
      loserId: loser,
      loserName: characterNames[loser],
      lines,
    });
  }
}

for (const [event, speakers] of Object.entries(BATTLE_DIALOGUES)) {
  for (const [speakerId, line] of Object.entries(speakers)) {
    const responses = Object.fromEntries(characterIds
      .filter((opponentId) => opponentId !== speakerId)
      .map((opponentId) => {
        const exchange = battleLines(speakerId, opponentId, event);
        return [opponentId, exchange && exchange[1][1]];
      })
      .filter(([, response]) => response));
    entries.push({
      section: 'battle',
      event,
      speakerId,
      speakerName: characterNames[speakerId],
      line,
      responses,
    });
  }
}

const output = {
  description: 'Exportação completa dos diálogos do jogo, separada por seção e personagem/confronto.',
  characterNames,
  formAliases: BASE_CHARACTER,
  entries,
};
const outputPath = resolve('dialogues-export.json');
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

const outputDir = resolve('dialogues-export-parts');
try {
  for (const oldFile of readdirSync(outputDir)) {
    if (/^part-\d{2}\.json$/.test(oldFile)) unlinkSync(resolve(outputDir, oldFile));
  }
  if (readdirSync(outputDir).length === 0) rmdirSync(outputDir);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log(`Exportadas ${entries.length} entradas para ${outputPath}`);
