import React from 'react';
import { Provider } from 'react-redux';
import testData from '../../../../../.storybook/test-data';
import configureStore from '../../../../store/store';
import { PercentageChange } from '.';

export default {
  title: 'Components/App/PercentageChange',
  component: PercentageChange,
  argTypes: {
    value: {
      control: 'number',
    },
    valueChange: {
      control: 'number',
    },
    includeNumber: {
      control: 'boolean',
    },
  },
  args: {
    value: 5.23,
    valueChange: 100,
    includeNumber: true,
  },
};

const customData = {
  ...testData,
  metamask: {
    ...testData.metamask,
    currentCurrency: 'USD',
    intlLocale: 'en-US',
  },
};
const customStore = configureStore(customData);

const Template = (args) => {
  return (
    <Provider store={customStore}>
      <PercentageChange {...args} />
    </Provider>
  );
};

export const PositiveChange = Template.bind({});
PositiveChange.args = {
  value: 5.23,
  valueChange: 100,
  includeNumber: true,
};

export const NegativeChange = Template.bind({});
NegativeChange.args = {
  value: -2.47,
  valueChange: -50,
  includeNumber: true,
};

export const NoChange = Template.bind({});
NoChange.args = {
  value: 0,
  includeNumber: false,
};

export const WithCustomFormatting = (args) => (
  <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
    <PercentageChange {...args} />
  </div>
);
WithCustomFormatting.decorators = [
  (Story) => (
    <Provider store={customStore}>
      <Story />
    </Provider>
  ),
];
WithCustomFormatting.args = {
  value: 0.56,
  valueChange: 20,
  includeNumber: true,
};
