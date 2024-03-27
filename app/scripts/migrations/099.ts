import { cloneDeep, isEmpty } from 'lodash';
import { v1 as uuid } from 'uuid';

type VersionedData = {
  meta: { version: number };
  data: Record<string, unknown>;
};

export const version = 99;

/**
 * The core TransactionController uses strings for transaction IDs, specifically UUIDs generated by the uuid package.
 * For the sake of standardisation and minimising code maintenance, the use of UUIDs is preferred.
 * This migration updates the transaction IDs to UUIDs.
 *
 * @param originalVersionedData
 */
export async function migrate(
  originalVersionedData: VersionedData,
): Promise<VersionedData> {
  const versionedData = cloneDeep(originalVersionedData);
  versionedData.meta.version = version;
  transformState(versionedData.data);
  return versionedData;
}

// TODO: Replace `any` with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformState(state: Record<string, any>) {
  const transactionControllerState = state?.TransactionController || {};
  const transactions = transactionControllerState?.transactions || {};

  if (isEmpty(transactions)) {
    return;
  }

  const newTxs = Object.keys(transactions).reduce(
    // TODO: Replace `any` with type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (txs: { [key: string]: any }, oldTransactionId) => {
      // Clone the transaction
      const transaction = cloneDeep(transactions[oldTransactionId]);

      // Assign a new id to the transaction
      const newTransactionID = uuid();
      transaction.id = newTransactionID;

      return {
        ...txs,
        [newTransactionID]: transaction,
      };
    },
    {},
  );

  state.TransactionController = {
    ...transactionControllerState,
    transactions: newTxs,
  };
}
