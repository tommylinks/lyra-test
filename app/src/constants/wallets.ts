import { Chain, getWalletConnectConnector, Wallet } from '@rainbow-me/rainbowkit'

import getAssetSrc from '../utils/getAssetSrc'

type WalletOptions = {
  chains: Chain[]
}

export const qredo = ({ chains }: WalletOptions): Wallet => ({
  id: 'qredo',
  name: 'Qredo',
  iconUrl: getAssetSrc('/options/images/qredo.webp'),
  downloadUrls: {
    qrCode: 'https://qredo.network/register',
  },
  iconBackground: '#e8e8e8',
  createConnector: () => {
    const connector = getWalletConnectConnector({ chains })
    return {
      connector,
      mobile: {
        getUri: async () => (await connector.getProvider()).connector.uri,
      },
      qrCode: {
        getUri: async () => (await connector.getProvider()).connector.uri,
        instructions: {
          learnMoreUrl: 'https://www.qredo.com/product',
          steps: [
            {
              description: 'After you scan, a connection prompt will appear for you to connect your wallet.',
              step: 'scan',
              title: 'Tap the scan button',
            },
          ],
        },
      },
    }
  },
})

export const rabby = ({ chains }: WalletOptions): Wallet => ({
  id: 'rabby',
  name: 'Rabby Wallet',
  iconUrl: getAssetSrc('/options/images/rabby.jpeg'),
  downloadUrls: {
    qrCode: 'https://chrome.google.com/webstore/detail/rabby/acmacodkjbdgmoleebolmdjonilkdbch?hl=en',
    browserExtension: 'https://chrome.google.com/webstore/detail/rabby/acmacodkjbdgmoleebolmdjonilkdbch?hl=en',
  },
  iconBackground: '#e8e8e8',
  createConnector: () => {
    const connector = getWalletConnectConnector({ chains })
    return {
      connector,
      mobile: {
        getUri: async () => (await connector.getProvider()).connector.uri,
      },
      qrCode: {
        getUri: async () => (await connector.getProvider()).connector.uri,
        instructions: {
          learnMoreUrl: 'https://rabby.io/',
          steps: [
            {
              description: 'After you scan, a connection prompt will appear for you to connect your wallet.',
              step: 'scan',
              title: 'Tap the scan button',
            },
          ],
        },
      },
    }
  },
})
