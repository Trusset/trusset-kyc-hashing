export type InvestorTypeName = 'NONE' | 'RETAIL' | 'PROFESSIONAL' | 'ELIGIBLE_COUNTERPARTY';

export type HashAlgorithm = 'keccak256' | 'sha256';

export type OutputFormat = 'csv' | 'json';

export interface ConfigDefaults {
  investorType?: InvestorTypeName;
  softExpiryDays?: number;
  hardExpiryDays?: number;
}

export interface Config {
  mapping: {
    fields: string[];
    walletAddressField: string;
    countryField: string;
    investorTypeField?: string;
    softExpiryDaysField?: string;
    hardExpiryDaysField?: string;
  };
  output: {
    format: OutputFormat;
    includeIndex: boolean;
    defaults?: ConfigDefaults;
  };
  security: {
    clearInputAfterProcessing: boolean;
    hashAlgorithm: HashAlgorithm;
  };
}

export interface KycRecord {
  [key: string]: string | number | boolean | null | undefined;
}

export interface HashOutput {
  index?: number;
  walletAddress: string;
  country: string;
  investorType: InvestorTypeName;
  softExpiryDays: number;
  hardExpiryDays: number;
  kycHash: string;
}

export interface DecryptInput {
  kycHash: string;
  [key: string]: string | number | boolean | null | undefined;
}