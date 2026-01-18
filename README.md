# Trusset KYC Hashing Tool

Generate deterministic KYC hashes for on-chain identity verification.

![Batch verification tool](/assets/labs.png)

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

## Input/Output

- Place `.json` or `.csv` files in `/input`
- Results appear in `/output`
- Input folder is cleared after processing (configurable)

## Configuration

Edit `config.json` to customize:

```json
{
  "mapping": {
    "fields": ["firstName", "lastName", "dateOfBirth", ...],
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

- All operations run locally
- No data transmitted externally
- Input cleared after processing
- Uses keccak256 (Ethereum standard) or sha256
