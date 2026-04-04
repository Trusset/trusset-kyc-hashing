<div align="center">

![Batch verification tool](/assets/kyc-intro.png)

# Trusset KYC Hashing Tool

**Generate deterministic KYC hashes for on-chain identity verification.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-keccak256-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Quick Start](#quick-start) · [Usage](#usage) · [Configuration](#configuration) · [Security](#security)

</div>

---

## Quick Start

```bash
npm install
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
| **Output** | Results appear in `/output` |
| **Cleanup** | Input folder is cleared after processing (configurable) |

## Configuration

Edit `config.json` to customize:

```json
{
  "mapping": {
    "fields": ["firstName", "lastName", "dateOfBirth", "..."],
    "includeWalletAddress": false,
    "walletAddressField": "walletAddress"
  },
  "output": {
    "format": "csv",
    "includeIndex": true
  },
  "security": {
    "clearInputAfterProcessing": true,
    "hashAlgorithm": "keccak256"
  }
}
```

## Input Format Example

**JSON:**

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "walletAddress": "0x..."
  }
]
```

**CSV:**

```csv
firstName,lastName,dateOfBirth,walletAddress
John,Doe,1990-01-15,0x...
```

## Security

> 🔒 **All operations run entirely on your local machine.**

| Feature | Details |
|---------|---------|
| **Local only** | No data transmitted externally |
| **Auto-cleanup** | Input cleared after processing |
| **Hash algorithms** | [`keccak256`](https://en.wikipedia.org/wiki/SHA-3) (Ethereum standard) or `sha256` |

---

<div align="center">

Built by [Trusset](https://trusset.io) · [Report an Issue](https://github.com/trusset/kyc-hashing-tool/issues)

</div>
