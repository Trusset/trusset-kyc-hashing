import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('config.json not found. Please create one from config.example.json');
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw) as Config;
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function showConfig(): void {
  const config = loadConfig();
  console.log('\n=== Current Configuration ===\n');
  console.log('Hash Algorithm:', config.security.hashAlgorithm);
  console.log('Output Format:', config.output.format);
  console.log('Include Index:', config.output.includeIndex);
  console.log('Include Wallet Address:', config.mapping.includeWalletAddress);
  console.log('Wallet Address Field:', config.mapping.walletAddressField);
  console.log('Clear Input After Processing:', config.security.clearInputAfterProcessing);
  console.log('\nMapped Fields:');
  config.mapping.fields.forEach((field, i) => {
    console.log(`  ${i + 1}. ${field}`);
  });
  console.log('\n');
}
