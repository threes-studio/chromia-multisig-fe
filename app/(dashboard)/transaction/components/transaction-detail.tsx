"use client";

import * as pcl from "postchain-client";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import CpSignerAvatarList from "@/components/cp-signer-avatar-list";
import TransactionTimeLine from "./transaction-timeline";
import { Transaction } from "@/config/api/transactions/types";
import { transformBuffersToStrings } from "@/lib/utils";
import CpAddress from '@/components/cp-address';
import { Badge } from "@/components/ui/badge";
import CpStatus from "@/components/cp-status";

const TransactionDetail = ({ transaction }: { transaction: Transaction }) => {
  const [isTransactionDataCollapsed, setIsTransactionDataCollapsed] = useState(false);
  const decodeTx = transaction.tx ? transformBuffersToStrings(
    pcl.decodeTransactionToGtx(Buffer.from(transaction.tx, 'hex'))
  ) : {};

  // Handle BigInt serialization
  const stringifyWithBigInt = (obj: any) => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  };

  decodeTx.operations = decodeTx.operations.map((op: any) => {
    if (op.opName === 'ft4.evm_signatures') {
      op.args = transaction.signatures.map(s => s.signature);
    }

    if (op.opName === 'ft4.evm_auth') {
      op.args[op.args.length - 1] = transaction.signatures.map(s => s.signature).map((sig: any) => {
        return [sig.r, sig.s, sig.v];
      });
    }

    return op;
  });

  const serializedDecodeTx = JSON.parse(stringifyWithBigInt(decodeTx));
  const author = transaction.signers.find(s => s.pubKey === transaction.userAddress);

  return (
    <div className="flex w-full">
      {/* Right column */}
      <div className="flex-auto shrink-0 w-1/2 pl-4">
        <Card className="mt-4 text-left">
          <CardHeader>
            <h3 className="font-semibold">Transaction Details</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Status and Type Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <Label>Status:</Label>
                  <CpStatus status={transaction.status} className="ml-2" />
                </div>
                <div className="text-left">
                  <Label>Type:</Label>
                  <CpStatus status={transaction.type} className="ml-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <Label>Author:</Label>
                  <p className="text-sm text-gray-600">{author?.name || "N/A"}</p>
                </div>
                <div className="text-left">
                  <Label>Date:</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-left">
                <Label>Signature required:</Label>
                <p className="text-sm text-gray-600">{transaction.signaturesRequired}</p>
              </div>

              <div className="text-left">
                <Label>Signers:</Label>
                <CpSignerAvatarList signers={transaction.signers} className="mt-2" />
              </div>


              {transaction.amount && (
                <div className="text-left">
                  <Label>Asset:</Label>
                  <p className="text-sm text-gray-600">{`-${transaction.amount} ${transaction.assetSymbol}`}</p>
                </div>
              )}

              {transaction.recipient && (
                <div className="text-left">
                  <Label>From:</Label>
                  <p className="text-sm text-gray-600">
                    <CpAddress address={transaction.accountId} type="account" truncate={false} />
                  </p>
                </div>
              )}

              {transaction.recipient && (
                <div className="text-left">
                  <Label>Recipient:</Label>
                  <p className="text-sm text-gray-600">
                    <CpAddress address={transaction.recipient} type="account" truncate={false} />
                  </p>
                </div>
              )}

              {transaction.type === 'updateDescriptor' && (
                <div>
                  <div className="text-left">
                    <Label>Request Data Modification:</Label>
                  </div>
                  <div className="border border-gray-300 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-left">
                        <Label>New Signers</Label>
                        <CpSignerAvatarList signers={transaction.signersToUpdate} className="mt-2" />
                      </div>
                      <div className="text-left mt-1">
                        <Label>New Threshold</Label>
                        <p className="text-sm text-gray-600 mt-1">{transaction.signaturesRequiredToUpdate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-left">
                <Label>Note:</Label>
                <p className="text-sm text-gray-600">{transaction.note || "N/A"}</p>
              </div>

              {transaction.txRid && (
                <div className="text-left">
                  <Label>txRid:</Label>
                  <p className="text-sm text-gray-600"><CpAddress address={transaction.txRid} truncate={false} type="hash" /></p>
                </div>
              )}

              <div className="text-left pb-2">
                <Label>Tx Timeline:</Label>
              </div>
              <div>
                <TransactionTimeLine logs={transaction.logs} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Left column */}
      {
        serializedDecodeTx && (
          <div className="flex-auto shrink-0 w-1/2 pl-4">
            <Card className="mt-4 text-left">
              <CardHeader>
                <h3 className="font-semibold flex items-center space-x-2">
                  <Switch id="airplane-mode" onClick={() => setIsTransactionDataCollapsed(!isTransactionDataCollapsed)} />
                  <span>Transaction data</span>
                </h3>
              </CardHeader>
              {isTransactionDataCollapsed && (
                <CardContent>
                  {/* @ts-ignore */}
                  <SyntaxHighlighter
                    language="json"
                    className="w-full rounded-md text-sm mt-6 justify-start"
                    style={atomOneDark}
                    customStyle={{
                      padding: "24px",
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    {JSON.stringify(serializedDecodeTx, null, 2)}
                  </SyntaxHighlighter>
                </CardContent>
              )}
            </Card>
          </div>
        )
      }
    </div >
  );
};

export default TransactionDetail;
