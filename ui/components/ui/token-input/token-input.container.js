import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getShouldShowFiat, getTokensMarketData } from '../../../selectors';
import { getNativeCurrency } from '../../../ducks/metamask/metamask';
import TokenInput from './token-input.component';

const mapStateToProps = (state) => {
  const {
    metamask: { currentCurrency, tokens },
  } = state;

  return {
    currentCurrency,
    marketData: getTokensMarketData(state),
    hideConversion: !getShouldShowFiat(state),
    nativeCurrency: getNativeCurrency(state),
    tokens,
  };
};

const TokenInputContainer = connect(mapStateToProps)(TokenInput);

TokenInputContainer.propTypes = {
  token: PropTypes.shape({
    address: PropTypes.string.isRequired,
    decimals: PropTypes.number,
    symbol: PropTypes.string,
  }).isRequired,
};

export default TokenInputContainer;
