import { Config, KycRecord } from './types';
import { verifyHash } from './hash';

export interface VerificationInput {
  kycHash: string;
  [key: string]: string | number | boolean | undefined;
}

export interface VerificationResult {
  index: number;
  kycHash: string;
  isValid: string;
  walletAddress?: string;
}

export function verifyRecords(records: VerificationInput[], config: Config): VerificationResult[] {
  const results: VerificationResult[] = [];
  const walletField = config.mapping.walletAddressField;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const { kycHash, ...kycData } = record;

    if (!kycHash) {
      results.push({
        index: i + 1,
        kycHash: 'MISSING',
        isValid: 'invalid'
      });
      continue;
    }

    const isValid = verifyHash(kycData as KycRecord, kycHash, config);
    const result: VerificationResult = {
      index: i + 1,
      kycHash,
      isValid: isValid ? 'valid' : 'invalid'
    };

    if (kycData[walletField]) {
      result.walletAddress = String(kycData[walletField]);
    }

    results.push(result);
  }

  return results;
}
