import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTransactionOriginCaveat } from '@metamask/snaps-controllers';
import { handleSnapRequest } from '../../store/actions';
import { getPermissionSubjects } from '../../selectors';

const INSIGHT_PERMISSION = 'endowment:transaction-insight';

export function useTransactionInsightSnaps({
  transaction,
  chainId,
  origin,
  insightSnaps,
  insightSnapId = '',
}) {
  const subjects = useSelector(getPermissionSubjects);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let cancelled = false;

    async function fetchInsight() {
      setLoading(true);

      let snapIds = insightSnaps.map((snap) => snap.id);
      if (insightSnapId.length > 0) {
        snapIds = [insightSnapId];
      }
      const newData = await Promise.allSettled(
        snapIds.map((snapId) => {
          const permission = subjects[snapId]?.permissions[INSIGHT_PERMISSION];
          if (!permission) {
            return Promise.reject(
              new Error(
                'This Snap does not have the transaction insight endowment.',
              ),
            );
          }

          const hasTransactionOriginCaveat =
            getTransactionOriginCaveat(permission);
          const transactionOrigin = hasTransactionOriginCaveat ? origin : null;
          return handleSnapRequest({
            snapId,
            origin: '',
            handler: 'onTransaction',
            request: {
              jsonrpc: '2.0',
              method: ' ',
              params: { transaction, chainId, transactionOrigin },
            },
          });
        }),
      );
      const reformattedData = newData.map((promise, idx) => {
        const snapId = snapIds[idx];
        if (promise.status === 'rejected') {
          return {
            error: promise.reason,
            snapId,
          };
        }
        return {
          snapId,
          response: promise.value,
        };
      });

      if (!cancelled) {
        setData(reformattedData);
        setLoading(false);
      }
    }
    if (transaction) {
      fetchInsight();
    }
    return () => (cancelled = true);
  }, [transaction, chainId, origin, subjects, insightSnaps, insightSnapId]);

  return { data, loading };
}
