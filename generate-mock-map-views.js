import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildLearningMapView } from './src/domain/learningMap/readModelBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'src/mocks/data');
const courses = JSON.parse(fs.readFileSync(path.join(dataDir, 'courses.json'), 'utf8'));
const chapters = JSON.parse(fs.readFileSync(path.join(dataDir, 'chapters.json'), 'utf8'));
const missions = JSON.parse(fs.readFileSync(path.join(dataDir, 'missions.json'), 'utf8'));
// We don't have separate investigations.json in mocks, so just pass missions

const views = courses
  .map(c => buildLearningMapView(c, chapters, missions))
  .filter(v => v !== null);

fs.writeFileSync(path.join(dataDir, 'learning_map_views.json'), JSON.stringify(views, null, 2));
console.log('Generated learning_map_views.json with ' + views.length + ' courses');
