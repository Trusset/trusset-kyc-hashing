import { ethers } from 'ethers';
import { HashOutput, Config, HashAlgorithm, InvestorTypeName, KycRecord } from './types';

const INVESTOR_TYPES: InvestorTypeName[] = ['NONE', 'RETAIL', 'PROFESSIONAL', 'ELIGIBLE_COUNTERPARTY'];
const MAX_EXPIRY_DAYS = 36500;

function hashBytes(bytes: Uint8Array, algorithm: HashAlgorithm): string {
  return algorithm === 'sha256' ? ethers.utils.sha256(bytes) : ethers.utils.keccak256(bytes);
}

function normalizeValue(value: KycRecord[string]): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    throw new Error('Nested objects and arrays are not supported as field values');
  }
  return String(value).trim();
}

function buildLeaf(field: string, value: string, algorithm: HashAlgorithm): string {
  const encoded = ethers.utils.defaultAbiCoder.encode(['string', 'string'], [field, value]);
  return hashBytes(ethers.utils.arrayify(encoded), algorithm);
}

function combinePair(a: string, b: string, algorithm: HashAlgorithm): string {
  const aLow = a.toLowerCase();
  const bLow = b.toLowerCase();
  const [first, second] = aLow <= bLow ? [a, b] : [b, a];
  const combined = ethers.utils.concat([
    ethers.utils.arrayify(first),
    ethers.utils.arrayify(second)
  ]);
  return hashBytes(combined, algorithm);
}

export function hashKycData(record: KycRecord, config: Config): string {
  const fields = config.mapping.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('No fields configured for hashing');
  }
  const algorithm = config.security.hashAlgorithm;

  const leaves = fields.map(field => buildLeaf(field, normalizeValue(record[field]), algorithm));
  const sortedLeaves = [...leaves].sort((a, b) => {
    const aLow = a.toLowerCase();
    const bLow = b.toLowerCase();
    if (aLow < bLow) return -1;
    if (aLow > bLow) return 1;
    return 0;
  });

  if (sortedLeaves.length === 1) return sortedLeaves[0];

  let layer = sortedLeaves;
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : left;
      next.push(combinePair(left, right, algorithm));
    }
    layer = next;
  }
  return layer[0];
}

export function verifyHash(record: KycRecord, expectedHash: string, config: Config): boolean {
  if (!expectedHash || typeof expectedHash !== 'string') return false;
  if (!/^0x[0-9a-fA-F]{64}$/.test(expectedHash)) return false;
  try {
    const computed = hashKycData(record, config);
    return computed.toLowerCase() === expectedHash.toLowerCase();
  } catch {
    return false;
  }
}

function resolveInvestorType(value: KycRecord[string], fallback: InvestorTypeName): InvestorTypeName {
  if (typeof value !== 'string') return fallback;
  const upper = value.toUpperCase().trim() as InvestorTypeName;
  return INVESTOR_TYPES.includes(upper) ? upper : fallback;
}

function resolveExpiryDays(value: KycRecord[string], fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > MAX_EXPIRY_DAYS) return fallback;
  return Math.floor(num);
}

export function processRecords(records: KycRecord[], config: Config, raw: boolean): HashOutput[] {
  const includeIndex = !raw && config.output.includeIndex;
  const m = config.mapping;
  const defaults = config.output.defaults || {};
  const defInvestor: InvestorTypeName = defaults.investorType && INVESTOR_TYPES.includes(defaults.investorType)
    ? defaults.investorType
    : 'RETAIL';
  const defSoft = Number.isFinite(defaults.softExpiryDays as number)
    ? Math.max(0, Math.min(MAX_EXPIRY_DAYS, Math.floor(defaults.softExpiryDays as number)))
    : 365;
  const defHard = Number.isFinite(defaults.hardExpiryDays as number)
    ? Math.max(0, Math.min(MAX_EXPIRY_DAYS, Math.floor(defaults.hardExpiryDays as number)))
    : 730;

  const results: HashOutput[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNum = i + 1;

    const walletRaw = record[m.walletAddressField];
    if (!walletRaw || typeof walletRaw !== 'string') {
      throw new Error(`Record ${rowNum}: missing wallet address (field "${m.walletAddressField}")`);
    }
    const walletTrim = walletRaw.trim();
    if (!ethers.utils.isAddress(walletTrim)) {
      throw new Error(`Record ${rowNum}: invalid wallet address "${walletTrim}"`);
    }
    const walletAddress = ethers.utils.getAddress(walletTrim);

    const countryRaw = normalizeValue(record[m.countryField]);
    if (!countryRaw || countryRaw.length < 2) {
      throw new Error(`Record ${rowNum}: missing or invalid country (field "${m.countryField}")`);
    }
    const country = countryRaw.toUpperCase().slice(0, 3);

    const investorType = m.investorTypeField
      ? resolveInvestorType(record[m.investorTypeField], defInvestor)
      : defInvestor;

    const softExpiryDays = m.softExpiryDaysField
      ? resolveExpiryDays(record[m.softExpiryDaysField], defSoft)
      : defSoft;

    const hardExpiryDays = m.hardExpiryDaysField
      ? resolveExpiryDays(record[m.hardExpiryDaysField], defHard)
      : defHard;

    if (hardExpiryDays > 0 && softExpiryDays > 0 && softExpiryDays > hardExpiryDays) {
      throw new Error(`Record ${rowNum}: softExpiryDays (${softExpiryDays}) cannot exceed hardExpiryDays (${hardExpiryDays})`);
    }

    const kycHash = hashKycData(record, config);

    const output: HashOutput = includeIndex
      ? { index: rowNum, walletAddress, country, investorType, softExpiryDays, hardExpiryDays, kycHash }
      : { walletAddress, country, investorType, softExpiryDays, hardExpiryDays, kycHash };

    results.push(output);
  }

  return results;
}