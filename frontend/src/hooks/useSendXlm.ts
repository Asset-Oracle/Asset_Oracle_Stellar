import * as StellarSdk from "stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET; // Use MAINNET for production

export const useSendXLM = () => {
  async function sendXLM(
    sourcePublicKey: string,
    destination: string,
    amount: string,
    memo?: string,
  ) {
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org",
    );

    // Load account
    const account = await server.loadAccount(sourcePublicKey);

    let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(), // XLM
          amount: amount,
        }),
      )
      .setTimeout(30);

    if (memo) {
      transactionBuilder = transactionBuilder.addMemo(
        StellarSdk.Memo.text(memo),
      );
    }

    const tx = transactionBuilder.build();

    // Sign with Freighter
    const { signedTxXdr } = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Submit
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTxXdr,
      "https://horizon-testnet.stellar.org",
    );

    const result = await server.submitTransaction(signedTransaction);
    return result;
  }
  return { sendXLM };
};
