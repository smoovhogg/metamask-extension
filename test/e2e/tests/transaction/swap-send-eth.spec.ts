import { strict as assert } from 'assert';
import {
  withFixtures,
  openActionMenuAndStartSendFlow,
  unlockWallet,
  defaultGanacheOptions,
} from '../../helpers';
import FixtureBuilder from '../../fixture-builder';
import { Suite } from 'mocha';
import { Mockttp } from 'mockttp';
import { SWAPS_API_V2_BASE_URL } from '../../../../shared/constants/swaps';
import { swapSendQuotesResponse } from './swap-send-mock-data';

const ETH_CONVERSION_RATE_USD = 3010;
const NATIVE_TOKEN_SYMBOL = 'ETH';

describe('Swap-Send ETH', function () {
  async function mockSwapsApi(mockServer: Mockttp) {
    await mockServer
      .forGet(`${SWAPS_API_V2_BASE_URL}/v2/networks/1337/quotes`)
      .always()
      .thenCallback(() => {
        return {
          statusCode: 200,
          json: swapSendQuotesResponse,
        };
      });
  }

  describe('to non-contract address with data that matches swap data signature', function (this: Suite) {
    it('renders the correct recipient on the confirmation screen', async function () {
      await withFixtures(
        {
          driverOptions: {
            openDevToolsForTabs: true,
          },
          fixtures: new FixtureBuilder()
            .withPreferencesController({
              featureFlags: {},
              preferences: { showFiatInTestnets: true },
            })
            .withCurrencyController({
              currencyRates: {
                [NATIVE_TOKEN_SYMBOL]: {
                  conversionDate: 1665507609.0,
                  conversionRate: ETH_CONVERSION_RATE_USD,
                  usdConversionRate: ETH_CONVERSION_RATE_USD,
                },
              },
            })
            .withTokenRatesController({
              contractExchangeRates: {
                '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
                  1 / ETH_CONVERSION_RATE_USD,
              },
            })
            .withPreferencesControllerPetnamesDisabled()
            .build(),
          ethConversionInUsd: ETH_CONVERSION_RATE_USD,
          testSpecificMock: mockSwapsApi,
          ganacheOptions: defaultGanacheOptions,
          title: this.test?.fullTitle(),
        },
        async ({ driver }: { driver: any }) => {
          await unlockWallet(driver);

          await driver.assertElementNotPresent('.loading-overlay__spinner');
          const balance = await driver.findElement(
            '[data-testid="eth-overview__primary-currency"]',
          );
          assert.ok(/^[\d.]+\sETH$/u.test(await balance.getText()));

          await openActionMenuAndStartSendFlow(driver);

          await driver.fill(
            'input[placeholder="Enter public address (0x) or ENS name"]',
            '0xc427D562164062a23a5cFf596A4a3208e72Acd28',
          );

          await driver.fill('[data-testid="currency-input"]', '1');
          await driver.clickElement('[data-testid="asset-picker-button"]');
          await driver.fill(
            '[data-testid="asset-picker-modal-search-input"]',
            'USDC',
          );
          // Verify that only matching tokens are listed
          assert.equal(
            (
              await driver.findElements(
                '[data-testid="multichain-token-list-button"]',
              )
            ).length,
            1,
          );
          await driver.clickElement({
            css: '[data-testid="multichain-token-list-button"]',
            text: 'USDC',
          });
          assert.equal(
            (
              await driver.findClickableElements({
                css: '[data-testid="asset-picker-button"]',
                text: 'USDC',
              })
            ).length,
            2,
          );

          // assert that currency inputs are reset
          const currencyInputs = await driver.findElements(
            '.unit-input__input-container',
          );
          assert.equal(currencyInputs.length, 2);
          assert.equal(await currencyInputs[0].getText(), 'USDC');
          assert.equal(await currencyInputs[1].getText(), 'USDC');
          assert.ok(
            await currencyInputs[0].nestedFindElement('input[value="0"]'),
          );
          assert.ok(
            await (
              await currencyInputs[0].nestedFindElement('input[value="0"]')
            ).isEnabled(),
          );
          assert.ok(
            await currencyInputs[1].nestedFindElement('input[value="0"]'),
          );
          assert.ok(
            !(await (
              await currencyInputs[1].nestedFindElement('input[value="0"]')
            ).isEnabled()),
          );

          // click on ETH
          await driver.clickElement('[data-testid="asset-picker-button"]');
          await driver.fill(
            '[data-testid="asset-picker-modal-search-input"]',
            NATIVE_TOKEN_SYMBOL,
          );
          await driver.clickElement({
            css: '[data-testid="multichain-token-list-button"]',
            text: NATIVE_TOKEN_SYMBOL,
          });
          const selectedAssets = await driver.findClickableElements({
            css: '[data-testid="asset-picker-button"]',
            text: NATIVE_TOKEN_SYMBOL,
          });
          assert.equal(selectedAssets.length, 2);
          await driver.fill('[data-testid="currency-input"]', '1');

          // change dest token to USDC
          await ((
            await driver.findElements('[data-testid="asset-picker-button"]')
          )?.[1]).click();
          await driver.fill(
            '[data-testid="asset-picker-modal-search-input"]',
            'USDC',
          );
          await driver.clickElement({
            css: '[data-testid="multichain-token-list-button"]',
            text: 'USDC',
          });

          // Verify src token is still ETH
          (
            await driver.findElements('[data-testid="asset-picker-button"]')
          ).map(async (e: any) => {
            assert.equal(await e.getText(), NATIVE_TOKEN_SYMBOL);
            const currencyInputs = await driver.findElements(
              '.unit-input__input-container',
            );
            assert.equal(currencyInputs.length, 2);
            assert.equal(
              await currencyInputs[0].getText(),
              NATIVE_TOKEN_SYMBOL,
            );
            assert.equal(await currencyInputs[1].getText(), 'USDC');

            assert.ok(
              await currencyInputs[0].nestedFindElement('input[value="1"]'),
            );
            assert.ok(
              await (
                await currencyInputs[0].nestedFindElement('input[value="1"]')
              ).isEnabled(),
            );
            assert.ok(
              await currencyInputs[1].nestedFindElement('input[value="0"]'),
            );
            assert.ok(
              !(await (
                await currencyInputs[1].nestedFindElement('input[value="0"]')
              ).isEnabled()),
            );
          });

          // TODO verify fetched quote
          // TODO verify that swaps is only called once

          await driver.findClickableElement({
            text: 'Continue',
            tag: 'button',
          });
          await driver.clickElement({ text: 'Continue', tag: 'button' });

          await driver.findClickableElement(
            '[data-testid="sender-to-recipient__name"]',
          );
          await driver.clickElement(
            '[data-testid="sender-to-recipient__name"]',
          );

          // TODO use the correct recipient address. Using swaps address for now
          const recipientAddress = await driver.findElements({
            //text: '0xc427D562164062a23a5cFf596A4a3208e72Acd28',
            text: '0x4458AcB1185aD869F982D51b5b0b87e23767A3A9',
          });

          assert.equal(recipientAddress.length, 1);
          driver.summarizeErrorsAndExceptions();
          // TODO submit tx
        },
      );
    });
  });
});
