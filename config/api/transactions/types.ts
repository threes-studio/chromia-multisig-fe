import { account } from '../accounts/types';

const transaction = {
  "status": "ready",
  "amount": 10000000,
  "assetSymbol": "BTC",
  "note": "",
  "multiSigAccount": account,
  "assetDecimals": 18,
  "signers": [
    {
      "name": "Khan Signer",
      "pubKey": "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
      "id": "67e4a7caac9af1912d6f53d0"
    },
    {
      "name": "Alice",
      "pubKey": "02b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711",
      "id": "67e4a7caac9af1912d6f53d1"
    },
    {
      "name": "Bob",
      "pubKey": "0371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008ea",
      "id": "67e4a7caac9af1912d6f53d2"
    }
  ],
  "signaturesRequired": 3,
  "type": "updateDescriptor",
  "tx": "a58202df308202dba582028f3082028ba1220420e592e9c2a048753cb39818b9926a1fd09f4bd02cd673648284356540bc9add4ea58201c9308201c5a55d305ba20d0c0b6674342e66745f61757468a54a3048a1220420cfeeb9f29cad1eee19e436d1cb6e822ca348185fb7ec411a8a583ee77b064753a12204205d3de6f47c8a4cfc70608e3fb37157f4199069788b3f9224d61101c7003483a9a582012f3082012ba2210c1f6674342e7570646174655f6d61696e5f617574685f64657363726970746f72a582010430820100a581fd3081faa303020101a581ee3081eba50c300aa2030c0141a2030c0154a303020103a581d53081d2a2440c42303334303732333061383231643537396333336566663065383961623435623632613264363835313238313963363835396136323562633962633934646362383864a2440c42303262313235383839376239326434653136616161653833386232633134373566343939376136303131616637633064623132636263613937616531376339373131a2440c42303337313036313132346335303065653438643365623932633438636237303163343734636361613365626366303938613436366166323032633865393030386561a0020500a531302fa2050c036e6f70a5263024a12204202883a928968b26dc63ee8752e15244ad92daf587bab7bb111a4f8fe23204b75fa58197308194a1230421038862653dff01af0082eb8a3170084eab113c38c2a1048288e8d734832ef0adaca123042102b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711a123042103407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88da12304210371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008eaa5463044a142044016b5e2fecab4e807de8433f44b91f99cb208e37d81f5161bd7f349543bf0ebff2245b62032c111180109e12c876cebfe3e7e2cb6e7c00380ac58ebf69cd36ebb",
  "signatures": [
    {
      "pubKey": "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
      "createdAt": "2025-03-27T02:39:15.207Z",
      "signature": "6434e854ea83c2d0d26e3ca59cdf5530ffdb12d3e643393375404ddc70c3841212f23ae48556f1102d19516870e7ae62b33c6afce2382af79b32236d7c2dc902",
      "id": "67e4ba5987cacd96078498f7"
    },
    {
      "pubKey": "0371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008ea",
      "createdAt": "2025-03-27T02:39:18.550Z",
      "signature": "e97ebd53d75820e4052129e2ca14c971f4a990eeb504eedf196bda00c46331b023c45c798c9d12585cf4ce20358e05c6375b989962e5a9dc4497518732e4ac5c",
      "id": "67e4ba5987cacd96078498f8"
    },
    {
      "pubKey": "02b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711",
      "createdAt": "2025-03-27T02:39:21.919Z",
      "signature": "af006a4c1816af6a17d9c61014a562145bca6b27b3786c323ca06e89a9f20015721efda0489a68a6dd94b6df5b779357d937ddf8e2d1d060fd00750f300c5521",
      "id": "67e4ba5987cacd96078498f9"
    }
  ],
  "logs": [
    {
      "action": "signed",
      "pubKey": "0371061124c500ee48d3eb92c48cb701c474ccaa3ebcf098a466af202c8e9008ea",
      "signerName": "Bob",
      "createdAt": "2025-03-27T04:27:12.761Z",
      "id": "67e4d3b9b86af9a2126e2b1a"
    },
    {
      "action": "signed",
      "pubKey": "02b1258897b92d4e16aaae838b2c1475f4997a6011af7c0db12cbca97ae17c9711",
      "signerName": "Alice",
      "createdAt": "2025-03-27T04:27:15.608Z",
      "id": "67e4d3b9b86af9a2126e2b1b"
    },
    {
      "action": "executed",
      "pubKey": "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
      "signerName": "Khan Signer",
      "createdAt": "2025-03-27T04:27:37.835Z",
      "id": "67e4d3b9b86af9a2126e2b1c"
    }
  ],
  "txRid": "bca82c02406b8642e003779512ac86dcde178c211062889aabdad3d53c3f0abc",
  "createdAt": "2025-03-27T01:20:10.971Z",
  "updatedAt": "2025-03-27T02:39:21.924Z",
  "recipient": "1Khan",
  "accountId": "67e4a7caac9af1912d6f53cf",
  "assetId": "67e4a7caac9af1912d6f53ce",
  "id": "67e4a7caac9af1912d6f53cf",
  "signaturesRequiredToUpdate": 3,
  "signersToUpdate": [
    {
      "name": "Khan Signer",
      "pubKey": "03407230a821d579c33eff0e89ab45b62a2d68512819c6859a625bc9bc94dcb88d",
      "id": "67e4a7caac9af1912d6f53d0"
    },
  ],
  "authDescriptorId": "67e4a7caac9af1912d6f53d3",
  "userAddress": "0x0000000000000000000000000000000000000000",
};

export type Transaction = (typeof transaction);
export type CreateTransaction = {
  userAddress: string;
  type: string;
  multiSigAccount: string;
  recipient?: string;
  amount: number;
  assetSymbol: string;
  assetId: string;
  assetDecimals: number;
  note: string;
  tx: string;
  signature: {
    r: string;
    s: string;
    v: number;
  }
};

export type TransactionSign = {
  userAddress: string;
  signature: {
    r: string;
    s: string;
    v: number;
  };
};

export type TransactionExecute = {
  userAddress: string;
};
