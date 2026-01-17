export interface Config {
  mapping: {
    fields: string[];
    includeWalletAddress: boolean;
    walletAddressField: string;
  };
  output: {
    format: 'csv' | 'json';
    includeIndex: boolean;
  };
  security: {
    clearInputAfterProcessing: boolean;
    hashAlgorithm: 'keccak256' | 'sha256';
  };
}

export interface KycRecord {
  [key: string]: string | number | boolean | undefined;
}

export interface HashOutput {
  index?: number;
  walletAddress?: string;
  kycHash: string;
}

export interface DecryptInput {
  kycHash: string;
  originalData?: KycRecord;
}
