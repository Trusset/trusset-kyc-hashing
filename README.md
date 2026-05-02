<div align="center">

![Batch verification tool](/assets/kyc-intro.png)

# Trusset KYC Hashing Tool

**Generate deterministic KYC Merkle root hashes for on-chain identity verification.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-keccak256-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Quick Start](#quick-start) · [Usage](#usage) · [Configuration](#configuration) · [Security](#security)

</div>

---

## How it works

Each KYC field is hashed into a leaf using `keccak256(abi.encode(fieldName, value))` so that field names are domain separated from the values. Leaves are sorted lexicographically, then combined pairwise (smaller hash first, last node duplicated on odd layers) until a single root remains. That root is the `kycHash` published to the Trusset network. Banks keep all PII locally and can later prove inclusion of any single field with a Merkle proof without disclosing the others.

## Quick Start

```bash
npm install
cp config.example.json config.json
```

## Usage

**Hash KYC data:**

```bash
npm start                 # Hash with index column
npm start -- --raw        # Hash without index column
```

**Verify hashes:**

```bash
npm run decrypt           # Verify hashes against original data
```

**View configuration:**

```bash
npm run show              # Display current field mapping
```

## Input / Output

| Direction | Details |
|-----------|---------|
| **Input** | Place `.json` or `.csv` files in `/input` |
| **Output** | Results appear in `/output`, ready for the Trusset verify APIs |
| **Cleanup** | Input folder is cleared after processing (configurable) |

## Configuration

Edit `config.json` to customize:

```json
{
  "mapping": {
    "fields": ["firstName", "lastName", "dateOfBirth", "..."],
    "walletAddressField": "walletAddress",
    "countryField": "country",
    "investorTypeField": "investorType",
    "softExpiryDaysField": "softExpiryDays",
    "hardExpiryDaysField": "hardExpiryDays"
  },
  "output": {
    "format": "csv",
    "includeIndex": true,
    "defaults": {
      "investorType": "RETAIL",
      "softExpiryDays": 365,
      "hardExpiryDays": 730
    }
  },
  "security": {
    "clearInputAfterProcessing": true,
    "hashAlgorithm": "keccak256"
  }
}
```

`mapping.fields` are the PII columns that get hashed into the Merkle tree. The `*Field` entries point at columns that pass through verbatim into the API output. When an investor type or expiry field is missing or empty, the configured default is used.

## Input Format Example

**JSON:**

```json
[
  {
    "walletAddress": "0xabc...",
    "country": "DEU",
    "investorType": "RETAIL",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "nationality": "DE",
    "documentType": "PASSPORT",
    "documentNumber": "P1234567",
    "documentIssuingCountry": "DE"
  }
]
```

**CSV:**

```csv
walletAddress,country,investorType,firstName,lastName,dateOfBirth,nationality,documentType,documentNumber,documentIssuingCountry
0xabc...,DEU,RETAIL,John,Doe,1990-01-15,DE,PASSPORT,P1234567,DE
```

## Output Format Example

```csv
index,walletAddress,country,investorType,softExpiryDays,hardExpiryDays,kycHash
1,0xAbC...,DEU,RETAIL,365,730,0x9f1c...
```

Each row maps directly to the `/customers/api/identity/verify` request body in the Trusset issuer backend.

## Security

> 🔒 **All operations run entirely on your local machine.**

| Feature | Details |
|---------|---------|
| **Local only** | No data is transmitted externally |
| **Auto cleanup** | Input cleared after processing |
| **Hash algorithms** | [`keccak256`](https://en.wikipedia.org/wiki/SHA-3) (Ethereum standard) or `sha256` |
| **Domain separation** | Each leaf encodes both field name and value to prevent cross field collisions |
| **Sorted Merkle root** | Deterministic and order independent across input layouts |

---

<div align="center">

Built by [Trusset](https://trusset.io) · [Report an Issue](https://github.com/trusset/kyc-hashing-tool/issues)

</div>