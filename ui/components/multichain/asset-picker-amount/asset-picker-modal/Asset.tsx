import React from 'react';
import { useSelector } from 'react-redux';
import { getTokenList } from '../../../../selectors';
import { useTokenFiatAmount } from '../../../../hooks/useTokenFiatAmount';
import { TokenListItem } from '../../token-list-item';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';

type AssetProps = {
  address?: string | null;
  image?: string;
  symbol: string;
  decimalTokenAmount?: string;
  onClick: (address: string) => void;
  tooltipText?: string;
};

export default function Asset({
  address,
  image,
  symbol,
  decimalTokenAmount,
  onClick,
  tooltipText,
}: AssetProps) {
  const tokenList = useSelector(getTokenList);
  const tokenData = address
    ? Object.values(tokenList).find(
        (token) =>
          isEqualCaseInsensitive(token.symbol, symbol) &&
          isEqualCaseInsensitive(token.address, address),
      )
    : undefined;

  const title = tokenData?.name || symbol;
  const tokenImage = tokenData?.iconUrl || image;
  const formattedFiat = useTokenFiatAmount(
    address ?? undefined,
    decimalTokenAmount,
    symbol,
    {},
    true,
  );

  return (
    <TokenListItem
      onClick={onClick}
      tokenSymbol={symbol}
      tokenImage={tokenImage}
      primary={`${decimalTokenAmount || 0}`}
      secondary={formattedFiat}
      title={title}
      tooltipText={tooltipText}
    />
  );
}
