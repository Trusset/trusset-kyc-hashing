import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('config.json not found in working directory. Copy config.example.json to config.json.');
  }

  let raw: string;
  try {
    raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read config.json: ${(err as Error).message}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('config.json is not valid JSON');
  }

  if (!parsed.mapping || typeof parsed.mapping !== 'object') {
    throw new Error('config.json: missing "mapping" section');
  }
  if (!parsed.output || typeof parsed.output !== 'object') {
    throw new Error('config.json: missing "output" section');
  }
  if (!parsed.security || typeof parsed.security !== 'object') {
    throw new Error('config.json: missing "security" section');
  }
  if (!Array.isArray(parsed.mapping.fields) || parsed.mapping.fields.length === 0) {
    throw new Error('config.json: mapping.fields must be a non-empty array');
  }
  if (parsed.mapping.fields.some((f: any) => typeof f !== 'string' || !f.trim())) {
    throw new Error('config.json: mapping.fields must contain non-empty strings');
  }
  const dedup = new Set(parsed.mapping.fields.map((f: string) => f.trim()));
  if (dedup.size !== parsed.mapping.fields.length) {
    throw new Error('config.json: mapping.fields contains duplicates');
  }
  if (typeof parsed.mapping.walletAddressField !== 'string' || !parsed.mapping.walletAddressField.trim()) {
    throw new Error('config.json: mapping.walletAddressField is required');
  }
  if (typeof parsed.mapping.countryField !== 'string' || !parsed.mapping.countryField.trim()) {
    throw new Error('config.json: mapping.countryField is required');
  }
  if (parsed.security.hashAlgorithm !== 'keccak256' && parsed.security.hashAlgorithm !== 'sha256') {
    throw new Error('config.json: security.hashAlgorithm must be "keccak256" or "sha256"');
  }
  if (parsed.output.format !== 'csv' && parsed.output.format !== 'json') {
    throw new Error('config.json: output.format must be "csv" or "json"');
  }
  if (typeof parsed.output.includeIndex !== 'boolean') {
    throw new Error('config.json: output.includeIndex must be a boolean');
  }
  if (typeof parsed.security.clearInputAfterProcessing !== 'boolean') {
    throw new Error('config.json: security.clearInputAfterProcessing must be a boolean');
  }

  return parsed as Config;
}

export function showConfig(): void {
  const config = loadConfig();
  const m = config.mapping;
  const d = config.output.defaults || {};

  console.log('');
  console.log('Trusset KYC Hashing Configuration');
  console.log('---------------------------------');
  console.log('Hash algorithm:            ', config.security.hashAlgorithm);
  console.log('Output format:             ', config.output.format);
  console.log('Include index column:      ', config.output.includeIndex);
  console.log('Clear input after process: ', config.security.clearInputAfterProcessing);
  console.log('');
  console.log('Field mapping:');
  console.log('  walletAddress:    ', m.walletAddressField);
  console.log('  country:          ', m.countryField);
  console.log('  investorType:     ', m.investorTypeField || '(uses default)');
  console.log('  softExpiryDays:   ', m.softExpiryDaysField || '(uses default)');
  console.log('  hardExpiryDays:   ', m.hardExpiryDaysField || '(uses default)');
  console.log('');
  console.log('Defaults:');
  console.log('  investorType:     ', d.investorType || 'RETAIL');
  console.log('  softExpiryDays:   ', d.softExpiryDays ?? 365);
  console.log('  hardExpiryDays:   ', d.hardExpiryDays ?? 730);
  console.log('');
  console.log('Hashed fields (Merkle tree leaves):');
  m.fields.forEach((field, i) => {
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${field}`);
  });
  console.log('');
}