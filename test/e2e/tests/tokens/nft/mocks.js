function setupAutoDetectMocking(
  server,
  testAddress = '0x5cfe73b6021e818b776b421b1c4db2474086a7e1',
) {
  const nftCollection = {
    name: 'ENS: Ethereum Name Service',
    slug: 'Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.',
    symbol: 'ens',
    isSpam: false,
    imageUrl: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
    isNsfw: false,
  };

  const nfts = {
    tokens: [
      {
        token: {
          chainId: 1,
          contract: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
          tokenId: '0',
          kind: 'erc721',
          name: 'peteryinusa.eth',
          image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          metadata: {
            imageOriginal: 'https://remilio.org/remilio/632.png',
            imageMimeType: 'image/svg+xml',
            tokenURI: 'https://remilio.org/remilio/json/632',
          },
          description:
            'Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.',
          rarityScore: 343.443,
          rarityRank: 8872,
          supply: '1',
          isSpam: false,
          collection: nftCollection,
        },
      },
    ],
  };

  const nftContract = {
    address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    chain: 'ethereum',
    collection: 'ens',
    contract_standard: 'erc721',
    name: 'Unidentified contract',
    supply: 0,
  };

  // Get assets for account
  server
    .forGet(`https://nft.api.cx.metamask.io/users/${testAddress}/tokens`)
    .withQuery({
      chainIds: '1',
      limit: 50,
      includeTopBid: 'true',
      continuation: '',
    })
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: nfts,
      };
    });

  // Get contract
  server
    .forGet(
      'https://proxy.metafi.codefi.network/opensea/v1/api/v2/chain/ethereum/contract/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    )
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: nftContract,
      };
    });

  // Get collection
  server
    .forGet(
      'https://proxy.metafi.codefi.network/opensea/v1/api/v2/collections/ens',
    )
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: nftCollection,
      };
    });

  // eth_blockNumber
  server
    .forPost('/v3/00000000000000000000000000000000')
    .withBodyIncluding('eth_blockNumber')
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: 1111111111111111,
          result: '0x1',
        },
      };
    });

  // eth_getBlockByNumber
  server
    .forPost('/v3/00000000000000000000000000000000')
    .withBodyIncluding('eth_getBlockByNumber')
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: 1111111111111111,
          result: {},
        },
      };
    });

  // eth_call
  server
    .forPost('/v3/00000000000000000000000000000000')
    .withBodyIncluding('eth_call')
    .thenCallback(() => {
      return {
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: 1111111111111111,
          result: '0x1',
        },
      };
    });
}

module.exports = {
  setupAutoDetectMocking,
};
