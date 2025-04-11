import { useState } from "react";
import {
  createClient,
  Operation,
  GTX,
  gtx,
  IClient,
  formatter,
  gtv,
} from "postchain-client";
import {
  createKeyStoreInteractor,
  createWeb3ProviderEvmKeyStore,
  nop,
  Signature,
  registerAccountOp,
  createConnection,
  registrationStrategy,
  compactArray,
  evmSignatures,
  registerAccountMessage,
  updateMainAuthDescriptor,
  createMultiSigAuthDescriptorRegistration,
  AuthFlag,
  Amount,
  transfer,
  evmAuth,
  createAuthDataService,
  ACCOUNT_ID_PLACEHOLDER,
  AUTH_DESCRIPTOR_ID_PLACEHOLDER,
  BLOCKCHAIN_RID_PLACEHOLDER,
  NONCE_PLACEHOLDER,
  deriveNonce,
  createSingleSigAuthDescriptorRegistration,
  registerAccount,
  Session,
  aggregateSigners,
  pendingTransferStrategies,
  getBalanceByAccountId,
} from "@chromia/ft4";
import { ethers, verifyMessage } from 'ethers';
import { env } from "@/config/env";
import useBlockchainStore from "@/store/use-blockchain-store";

export type StrategiesType =
  | "basic"
  | "transfer"
  | "fee"
  | "";

const TESTNET_NODE_URL = [
  'https://node0.testnet.chromia.com:7740',
  'https://node1.testnet.chromia.com:7740',
  'https://node2.testnet.chromia.com:7740',
  'https://node3.testnet.chromia.com:7740',
];

const MAINNET_NODE_URL = [
  'https://chromia-sp.bwarelabs.com:7740',
  'https://chromia-api.hashkey.cloud:7740',
];

const createChromiaClient = async () => {
  const { currentNetwork, currentBlockchain } = useBlockchainStore.getState();
  const nodeUrlPool = currentNetwork === 'testnet'
    ? TESTNET_NODE_URL
    : MAINNET_NODE_URL;
  return createClient({
    nodeUrlPool,
    blockchainRid: currentBlockchain?.rid || 'E592E9C2A048753CB39818B9926A1FD09F4BD02CD673648284356540BC9ADD4E',
  });
}

type Web3Error = string | null;

const useChromia = () => {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<Web3Error>(null);

  const handleWeb3Call = async <T>(web3Call: () => Promise<T>): Promise<T | null> => {
    setIsSigning(true);
    setError(null);
    try {
      return await web3Call();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Web3 call error:", errorMessage);
      throw err;
    } finally {
      setIsSigning(false);
    }
  };

  function getEvmAddress(evmAddress: string) {
    return Buffer.from(evmAddress.slice(2), "hex");
  }

  const getEvmKeyStoreInteractor = async (client: IClient) => {
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    return createKeyStoreInteractor(client, evmKeyStore);
  };

  const getPendingTxs = async (accountId: Buffer): Promise<string[]> => {
    try {
      const client = await createChromiaClient();
      const connection = await createConnection(client);
      return await connection.query(pendingTransferStrategies(accountId));
    } catch (error) {
      console.error("Error getting pending transfers:", error);
      return [];
    }
  };

  async function getAccountIdForNewAccount(): Promise<Buffer> {
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const ad = createSingleSigAuthDescriptorRegistration(
      [AuthFlag.Account, AuthFlag.Transfer],
      evmKeyStore.id
    );
    const signers = aggregateSigners(ad);
    return gtv.gtvHash(
      signers.length === 1 ? signers[0] : signers.sort(Buffer.compare), 1
    );
  }

  const checkAccountChromiaExist = async () => {
    try {
      const client = await createChromiaClient();
      const evmKeyStoreInteractor = await getEvmKeyStoreInteractor(client);
      const accounts = await evmKeyStoreInteractor.getAccounts();
      return !!accounts.length;
    } catch (e) {
      throw e;
    }
  };

  const loginToChromia = async (): Promise<Session | null> => {
    const result = await handleWeb3Call(async () => {
      const client = await createChromiaClient();
      const evmKeyStoreInteractor = await getEvmKeyStoreInteractor(client);
      const accounts = await evmKeyStoreInteractor.getAccounts();

      if (accounts.length > 0) {
        const session = await evmKeyStoreInteractor.getSession(accounts[0].id);
        return session;
      } else {
        null;
      }
    });

    return result ?? null;
  };

  const registerAccountToChromia = async (accountId: string, feeAssetSymbol: string): Promise<Session | null> => {
    if (!accountId) return null;

    return await handleWeb3Call(async () => {
      const client = await createChromiaClient();
      const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
      const ad = createSingleSigAuthDescriptorRegistration(
        [AuthFlag.Account, AuthFlag.Transfer],
        evmKeyStore.id
      );

      const accountBufferId = Buffer.from(accountId, 'hex');
      const pendingTxs = await getPendingTxs(accountBufferId);

      if (!pendingTxs.length) {
        throw new Error("No pending transactions found for the account.");
      }

      const asset = await getAssetBySymbol(client, feeAssetSymbol);

      const { session } = await registerAccount(
        client,
        evmKeyStore,
        registrationStrategy.transferFee(asset, ad),
      );

      return session;
    });
  };

  const transferFeeToAccount = async (accountID: string, feeAmount: number = 2, feeAssetId: string, feeDecimals: number): Promise<Boolean> => {
    const result = await handleWeb3Call(async () => {
      if (!accountID) throw new Error("Account ID is required.");

      const feeBufferId = Buffer.from(feeAssetId, 'hex');
      const client = await createChromiaClient();
      const evmKeyStoreInteractor = await getEvmKeyStoreInteractor(client);
      const accounts = await evmKeyStoreInteractor.getAccounts();
      if (accounts.length === 0) throw new Error("No accounts found in the key store.");

      const accountBufferId = Buffer.from(accountID, 'hex');
      const pendingTxs = await getPendingTxs(accountBufferId);
      if (pendingTxs && pendingTxs.length) return true;

      const session = await evmKeyStoreInteractor.getSession(accounts[0].id);
      const assetBalance = await client.query("ft4.get_asset_balance", {
        account_id: session.account.id,
        asset_id: feeBufferId,
      });

      if (!assetBalance) throw new Error("Insufficient balance");
      const { amount: balance } = assetBalance as any;

      const feeInWei = BigInt(feeAmount) * BigInt(10 ** feeDecimals);
      if (BigInt(balance) < BigInt(feeInWei)) {
        throw new Error("Insufficient balance");
      }

      const { receipt } = await session.call({
        name: "ft4.transfer",
        args: [accountBufferId, feeBufferId, feeInWei],
      });

      return receipt.status === 'confirmed';
    });

    return result ?? false;
  };

  const queryAuthDescriptor = async (accountId: string) => {
    return await handleWeb3Call(async () => {
      const client = await createChromiaClient();
      return await client.query("ft4.get_account_main_auth_descriptor", { account_id: accountId });
    });
  };

  const getAssetBySymbol = async (client: IClient, assetSymbol: string) => {
    return await handleWeb3Call(async () => {
      const assets: any = await client.query("ft4.get_assets_by_symbol", {
        symbol: assetSymbol,
        page_size: 10,
        page_cursor: null,
      });

      const asset = assets.data[0];
      if (!asset) throw new Error("No asset found");
      return asset;
    });
  };

  const getTransferAssetMessage = async (accountId: Buffer, assetId: Buffer, receiverId: Buffer, amount: Amount) => {
    return await handleWeb3Call(async () => {
      const client = await createChromiaClient();
      const connection = await createConnection(client);
      const multiAD: any = await queryAuthDescriptor(accountId.toString('hex'));
      if (!multiAD) throw new Error('Multisig account not found');

      const authDataService = createAuthDataService(connection);
      const operation = transfer(receiverId, assetId, amount);
      const messageTemplate = await authDataService.getAuthMessageTemplate(operation);
      const counter = await authDataService.getAuthDescriptorCounter(accountId, multiAD.id);
      const blockchainRid = authDataService.getBlockchainRid();

      return {
        message: messageTemplate
          .replace(ACCOUNT_ID_PLACEHOLDER, formatter.toString(formatter.ensureBuffer(accountId)))
          .replace(AUTH_DESCRIPTOR_ID_PLACEHOLDER, formatter.toString(formatter.ensureBuffer(multiAD.id)))
          .replace(BLOCKCHAIN_RID_PLACEHOLDER, formatter.toString(blockchainRid))
          .replace(NONCE_PLACEHOLDER, deriveNonce(blockchainRid, operation, counter || 0)),
        multisigAuthDescriptorId: multiAD.id,
      };
    });
  };

  const ft4SignatureToEthersSignature = (signature: Signature): ethers.Signature => {
    return ethers.Signature.from({
      r: ethers.hexlify(signature.r),
      s: ethers.hexlify(signature.s),
      v: signature.v
    });
  }

  function sortSignatureByAddress(signatures: Signature[], message: string): Signature[] {
    const clonedSignatures = Array.from(signatures);
    const sortedSignatures = clonedSignatures.sort((a, b) => {
      const signA = ft4SignatureToEthersSignature(a);
      const signB = ft4SignatureToEthersSignature(b);

      const aAddress = verifyMessage(message, signA.compactSerialized);
      const bAddress = verifyMessage(message, signB.compactSerialized);
      return Buffer.compare(Buffer.from(aAddress), Buffer.from(bAddress));
    });

    return sortedSignatures;
  }

  // * Account creation
  async function getCreateAccountMessage(strategyOperation: Operation, registerAccountOperation: Operation): Promise<Signature> {
    const client = await createChromiaClient();
    const connection = await createConnection(client);
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);

    const message = await connection.query(registerAccountMessage(strategyOperation, registerAccountOperation));
    const signature = await evmKeyStore.signMessage(message);
    return signature;
  }

  async function signCreateMultisigAccount(
    signers: string[],
    signaturesRequired: number,
    feeAssetSymbol: string,
  ): Promise<Signature> {
    const client = await createChromiaClient();
    const connection = await createConnection(client);
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const registerAccountOperation = registerAccountOp();

    const multiAD = createMultiSigAuthDescriptorRegistration(
      [AuthFlag.Account, AuthFlag.Transfer],
      [...signers.map(getEvmAddress)],
      signaturesRequired,
      null,
    );

    const feeAsset = await getAssetBySymbol(client, feeAssetSymbol);

    const strategy = registrationStrategy.transferFee(feeAsset, multiAD);
    const { strategyOperation } = await strategy.getRegistrationDetails(connection, evmKeyStore);
    const sig = await getCreateAccountMessage(strategyOperation, registerAccountOperation);

    return sig;
  }

  async function createRegisterAccountTx(
    signatures: Signature[] | string[],
    signers: string[],
    signaturesRequired: number,
    feeAssetSymbol: string,
  ) {
    const client = await createChromiaClient();
    const connection = await createConnection(client);
    const ownersAddress = new Set(signers.map((key) => Buffer.from(key, "hex")));
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const registerAccountOperation = registerAccountOp();

    const multiAD = createMultiSigAuthDescriptorRegistration(
      [AuthFlag.Account, AuthFlag.Transfer],
      [...signers.map(getEvmAddress)],
      signaturesRequired,
      null,
    );

    const feeAsset = await getAssetBySymbol(client, feeAssetSymbol);
    let strategy = registrationStrategy.transferFee(feeAsset, multiAD);
    const { strategyOperation } = await strategy.getRegistrationDetails(connection, evmKeyStore);
    const registerMessage = await connection.query(registerAccountMessage(strategyOperation, registerAccountOperation));
    const sortedOwners = Array.from(ownersAddress).sort(Buffer.compare);
    const filteredSignatures = signatures.filter((sig): sig is Signature => typeof sig !== 'string');
    const sortedSignatures = sortSignatureByAddress(filteredSignatures, registerMessage);
    const evmSignaturesOperation = evmSignatures(sortedOwners, sortedSignatures);

    const operations = compactArray([evmSignaturesOperation, strategyOperation, registerAccountOperation, nop()]);
    const ops = operations.map(({ name, args }) => ({
      opName: name,
      args: args || [],
    }));
    const transaction: GTX = {
      blockchainRid: connection.blockchainRid,
      operations: ops,
      signers: [],
      signatures: [],
    };

    return gtx.serialize(transaction).toString('hex');
  }


  // * Account updation
  async function getUpdateAccountMessage(
    signers: string[],
    signaturesRequired: number,
    accountId: Buffer,
    descriptorId: Buffer,
  ): Promise<string> {
    const client = await createChromiaClient();
    const connection = await createConnection(client);
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const authDataService = createAuthDataService(connection);

    const multiAD: any = createMultiSigAuthDescriptorRegistration(
      [AuthFlag.Account, AuthFlag.Transfer],
      [...signers.map(getEvmAddress)],
      signaturesRequired,
      null,
    );
    const operation = updateMainAuthDescriptor(multiAD)
    const messageTemplate = await authDataService.getAuthMessageTemplate(operation);

    const counter = await authDataService.getAuthDescriptorCounter(accountId, descriptorId);
    const blockchainRid = authDataService.getBlockchainRid();
    const message = messageTemplate
      .replace(
        ACCOUNT_ID_PLACEHOLDER,
        formatter.toString(formatter.ensureBuffer(accountId)),
      )
      .replace(BLOCKCHAIN_RID_PLACEHOLDER, formatter.toString(blockchainRid))
      .replace(NONCE_PLACEHOLDER, deriveNonce(blockchainRid, operation, counter || 0));
    return message;
  }

  const signUpdateAuthDescriptorAccount = async (
    signers: string[],
    signaturesRequired: number,
    accountId: Buffer,
    authDescriptorId: Buffer,
  ): Promise<Signature> => {
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);

    const message = await getUpdateAccountMessage(signers, signaturesRequired, accountId, authDescriptorId);
    const signature = await evmKeyStore.signMessage(message);
    return signature;
  };


  async function createUpdateAuthDescriptorTx(
    signatures: (Signature | null)[],
    signers: string[],
    signaturesRequired: number,
    accountId: Buffer,
    authDescriptorId: Buffer,
  ) {
    const client = await createChromiaClient();
    const connection = await createConnection(client);
    const multiAD: any = createMultiSigAuthDescriptorRegistration(
      [AuthFlag.Account, AuthFlag.Transfer],
      [...signers.map(getEvmAddress)],
      signaturesRequired,
      null,
    );

    const updateAuthMessage = await getUpdateAccountMessage(signers, signaturesRequired, accountId, authDescriptorId);
    const ownersAddress = signers.map(getEvmAddress);

    const sortedOwners = Array.from(ownersAddress).sort(Buffer.compare);
    const filteredSignatures = signatures.filter((sig): sig is Signature => typeof sig !== 'string');
    const sortedSignatures = sortSignatureByAddress(filteredSignatures, updateAuthMessage);
    const evmSignaturesOperation = evmSignatures(sortedOwners, sortedSignatures);
    const evmAuthOp = evmAuth(accountId, authDescriptorId, signatures);
    const updateMainAuthDescriptorOperation = updateMainAuthDescriptor(multiAD);

    const operations = compactArray([evmSignaturesOperation, evmAuthOp, updateMainAuthDescriptorOperation, nop()]);
    const ops = operations.map(({ name, args }) => ({
      opName: name,
      args: args || [],
    }));
    const transaction: GTX = {
      blockchainRid: connection.blockchainRid,
      operations: ops,
      signers: [],
      signatures: [],
    };

    return gtx.serialize(transaction).toString('hex');
  }

  async function signTransferAssetTx(accountId: Buffer, assetId: Buffer, receiverId: Buffer, amount: Amount): Promise<Signature> {
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const transferAssetMessage = await getTransferAssetMessage(accountId, assetId, receiverId, amount);
    if (!transferAssetMessage) {
      throw new Error("Failed to retrieve transfer asset message.");
    }
    const { message } = transferAssetMessage;
    const signature = await evmKeyStore.signMessage(message);
    return signature;
  }

  async function createTransferAssetTx(
    signatures: (Signature | null)[],
    assetId: Buffer,
    receiverId: Buffer,
    amount: Amount,
    accountId: Buffer,
  ) {
    const client = await createChromiaClient();
    const connection = await createConnection(client);

    const multiAD: any = await queryAuthDescriptor(accountId.toString('hex'));
    if (!multiAD) {
      throw new Error('Multisig account not found');
    }

    const transferOp = transfer(receiverId, assetId, amount);
    const evmAuthOp = evmAuth(accountId, multiAD.id, signatures);
    const operations = compactArray([evmAuthOp, transferOp, nop()]);
    const ops = operations.map(({ name, args }) => ({
      opName: name,
      args: args || [],
    }));
    const transaction: GTX = {
      blockchainRid: connection.blockchainRid,
      operations: ops,
      signers: [],
      signatures: [],
    };

    return gtx.serialize(transaction).toString('hex');
  }

  async function getActiveBlockchains(network: 'testnet' | 'mainnet') {
    const { currentNetwork } = useBlockchainStore.getState();
    const chromiaClient = await createClient({
      nodeUrlPool: currentNetwork === 'testnet'
        ? TESTNET_NODE_URL
        : MAINNET_NODE_URL,
      blockchainIid: 0
    });

    const data: {
      name: string;
      rid: Buffer,
    }[] = await chromiaClient.query("get_blockchains", {
      include_inactive: false,
    });

    return data.map((item) => ({
      name: item.name,
      rid: item.rid.toString('hex'),
    }));
  }

  return {
    checkAccountChromiaExist,
    getAccountIdForNewAccount,
    loginToChromia,
    registerAccountToChromia,

    signCreateMultisigAccount,
    createRegisterAccountTx,

    signTransferAssetTx,
    createTransferAssetTx,

    signUpdateAuthDescriptorAccount,
    createUpdateAuthDescriptorTx,

    transferFeeToAccount,
    getActiveBlockchains,

    isSigning,
    error,
  };
};

export default useChromia;
