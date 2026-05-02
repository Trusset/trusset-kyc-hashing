import { Config, DecryptInput, KycRecord } from './types';
import { hashKycData } from './hash';

const HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/;

export type VerificationInput = DecryptInput;

export interface VerificationResult {
  index: number;
  walletAddress: string;
  kycHash: string;
  computedHash: string;
  isValid: 'valid' | 'invalid';
}

export function verifyRecords(records: VerificationInput[], config: Config): VerificationResult[] {
  const results: VerificationResult[] = [];
  const walletField = config.mapping.walletAddressField;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const expected = typeof record.kycHash === 'string' ? record.kycHash.trim() : '';
    const walletRaw = record[walletField];
    const walletAddress = typeof walletRaw === 'string' ? walletRaw.trim() : '';

    if (!expected || !HASH_PATTERN.test(expected)) {
      results.push({
        index: i + 1,
        walletAddress,
        kycHash: expected,
        computedHash: '',
        isValid: 'invalid'
      });
      continue;
    }

    try {
      const computed = hashKycData(record as KycRecord, config);
      const isValid = computed.toLowerCase() === expected.toLowerCase();
      results.push({
        index: i + 1,
        walletAddress,
        kycHash: expected,
        computedHash: computed,
        isValid: isValid ? 'valid' : 'invalid'
      });
    } catch {
      results.push({
        index: i + 1,
        walletAddress,
        kycHash: expected,
        computedHash: '',
        isValid: 'invalid'
      });
    }
  }

  return results;
}