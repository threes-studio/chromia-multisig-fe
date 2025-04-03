export const account = {
  "signers": [
    {
      "name": "Khan Signer",
      "pubKey": "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
      "id": "67e3c10d9205eb7e5ca6aa00"
    },
    {
      "name": "Alice",
      "pubKey": "02b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711",
      "id": "67e3c10d9205eb7e5ca6aa01"
    },
    {
      "name": "Bob",
      "pubKey": "0371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008ea",
      "id": "67e3c10d9205eb7e5ca6aa02"
    }
  ],
  "pendingTx": [
    {
      "amount": 2000000000000000000,
      "assetSymbol": "BUSC"
    }
  ],
  "status": "created",
  "name": "Khan MultiSig Account",
  "signaturesRequired": 3,
  "accountId": "eeff3f65d274ecf7a88fe6b8fabc9e51b75b8bd1318e49c6ef6dfeb26a4eef27",
  "pubKey": "026af1716c69b8316b48488a2a1219c7c71c262c34159007b1ba198c8e24309284",
  "privKey": "23ba56b028ba946ab5cf011ea1d970bca06499f504e22f58c70d5409bcb91f8c",
  "user": "6060490dc3b9792245fd5886",
  "createdAt": "2025-03-25T03:41:32.857Z",
  "updatedAt": "2025-03-25T03:54:07.955Z",
  "mainDescriptor": {
    "account_id": "eeff3f65d274ecf7a88fe6b8fabc9e51b75b8bd1318e49c6ef6dfeb26a4eef27",
    "args": [
      [
        "A",
        "T"
      ],
      3,
      [
        "02b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711",
        "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
        "0371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008ea"
      ]
    ],
    "auth_type": "M",
    "created": 1742874155096,
    "id": "5ec10d8b61451bad46ac35ee1b7dec4e4b83a6e3af1991b3befb2d5fd2b885c6",
    "rules": null,
  },
  "id": "67e225ec2f948b4bb9ad2a8b",
  "userAddress": "0x",
};

export type Account = (typeof account);
export type AccountRegister = {
  tx: string;
  signature: {
    r: string;
    s: string;
    v: number;
  };
  userAddress: string,
}

export type AccountUpdateAuthDescriptor = {
  name: string;
  signers: {
    name: string;
    pubKey: string;
  }[];
  signaturesRequired: number;
  tx: string;
  signature: {
    r: string;
    s: string;
    v: number;
  };
}