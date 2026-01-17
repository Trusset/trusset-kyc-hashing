import { ethers } from 'ethers';
import { Config, KycRecord, HashOutput } from './types';

export function hashKycData(record: KycRecord, config: Config): string {
  const fields = config.mapping.fields;
  const values: string[] = [];

  for (const field of fields) {
    const value = record[field];
    values.push(value !== undefined && value !== null ? String(value) : '');
  }

  const concatenated = values.join('|');

  if (config.security.hashAlgorithm === 'sha256') {
    return ethers.utils.sha256(ethers.utils.toUtf8Bytes(concatenated));
  }

  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(concatenated));
}

export function processRecords(records: KycRecord[], config: Config, raw: boolean): HashOutput[] {
  const results: HashOutput[] = [];
  const includeIndex = !raw && config.output.includeIndex;
  const includeWallet = config.mapping.includeWalletAddress;
  const walletField = config.mapping.walletAddressField;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const kycHash = hashKycData(record, config);
    
    // Build output with correct key order: index, walletAddress, kycHash
    const output: HashOutput = { kycHash };
    
    if (includeIndex) {
      output.index = i + 1;
    }
    
    if (includeWallet && record[walletField]) {
      output.walletAddress = String(record[walletField]);
    }

    // Reconstruct with proper ordering
    const ordered: HashOutput = { kycHash };
    if (includeIndex) {
      ordered.index = output.index;
    }
    if (includeWallet && output.walletAddress) {
      ordered.walletAddress = output.walletAddress;
    }
    
    // Use Object.assign to maintain insertion order: index -> wallet -> hash
    const final: HashOutput = Object.assign(
      {},
      includeIndex ? { index: output.index } : {},
      output.walletAddress ? { walletAddress: output.walletAddress } : {},
      { kycHash }
    ) as HashOutput;

    results.push(final);
  }

  return results;
}

export function verifyHash(record: KycRecord, expectedHash: string, config: Config): boolean {
  const computedHash = hashKycData(record, config);
  return computedHash.toLowerCase() === expectedHash.toLowerCase();
}
