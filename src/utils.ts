import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Config, KycRecord, HashOutput } from './types';

const INPUT_DIR = path.join(process.cwd(), 'input');
const OUTPUT_DIR = path.join(process.cwd(), 'output');

export function ensureDirectories(): void {
  if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function getInputFiles(): string[] {
  ensureDirectories();
  return fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.json') || f.endsWith('.csv'))
    .map(f => path.join(INPUT_DIR, f));
}

export function readInputFile(filePath: string): KycRecord[] {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.json') {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (ext === '.csv') {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as KycRecord[];
  }

  throw new Error(`Unsupported file format: ${ext}`);
}

export function writeOutput(data: HashOutput[], config: Config, suffix: string = ''): string {
  ensureDirectories();
  const timestamp = Date.now();
  const ext = config.output.format;
  const filename = `kyc_hashes_${timestamp}${suffix}.${ext}`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  if (ext === 'json') {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  } else {
    const columns = Object.keys(data[0] || {});
    const csv = stringify(data, { header: true, columns });
    fs.writeFileSync(outputPath, csv);
  }

  return outputPath;
}

export function clearInputFolder(): void {
  const files = fs.readdirSync(INPUT_DIR);
  files.forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    if (file !== '.gitkeep') {
      fs.unlinkSync(filePath);
    }
  });
}
