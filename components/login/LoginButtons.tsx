import React, { useState } from 'react';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

import { signIn } from 'next-auth/react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import axios from 'axios';

import { useRouter } from 'next/router';
import { Button } from "@material-tailwind/react";
import ErrorDialog from '../shared/ErrorDialog';

interface Props {
  redirUrl?: string;
}

const LoginButtons: React.FC<Props> = ({ children, redirUrl }) => {

  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();

  const handleAuth = async (event, walletType) => {
    if (isConnected) {
        await disconnectAsync();
    }

    let walletConnector, connectOptions;

    if (walletType == 'metamask') {
      walletConnector = MetaMaskConnector;
      connectOptions = {
        options: {
          appName: 'Legitimize'
        }
      };
    }
    else if (walletType == 'coinbase') {
      walletConnector = CoinbaseWalletConnector;
      connectOptions = {
        options: {
          appName: 'Legitimize'
        }
      };
    }
    else if (walletType == 'walletconnect') {
      walletConnector = WalletConnectConnector;
      connectOptions = {
        options: {
          qrcode: true
        }
      };
    }

    try {
      const connectOptions = {
        options: {
          appName: 'Legitimize',
          qrcode: true,
        }
      };
      const { account, chain } = await connectAsync({ connector: new walletConnector(connectOptions) });

      const userData = { address: account, chain: chain.id, network: 'evm' };

      const { data } = await axios.post('/api/auth/request-message', userData, {
          headers: {
              'content-type': 'application/json',
          },
      });

      const message = data.message;

      const signature = await signMessageAsync({ message });

      // redirect user after success authentication to '/user' page
      const { url } = await signIn('credentials', { message, signature, redirect: false, callbackUrl: redirUrl });
      /**
       * instead of using signIn(..., redirect: "/user")
       * we get the url from callback and push it to the router to avoid page refreshing
       */

      if (url) {
        push(url);
      }
    }
    catch(error) {
      if (error.code == -32002) {
        setErrorMsg("Wallet Locked.  Please open Metamask and verify your connection.");
      }
      if (error.message.indexOf('Cannot destructure property') >= 0) {
        setErrorMsg("Wallet not detected.  Please check to make sure you have installed the wallet correctly");
      }
      else {
        setErrorMsg(error.message);
      }

      setShowErrorMsg(true);
    }
  };

  return (
    <div className="mx-auto text-center">
      <div className="row-auto">
        <Button className="w-60" color="orange" onClick={e => { handleAuth(e, "metamask")}}>
          Connect Via Metamask
        </Button>
      </div>

      <div className="row-auto">
        <Button className="mt-2 w-60 hidden" color="blue" onClick={e => { handleAuth(e, "coinbase")}}>
          Connect Via Coinbase
        </Button>
      </div>

      <div className="row-auto">
        <Button className="mt-2 w-60" color="light-blue" onClick={e => { handleAuth(e, "walletconnect")}}>
          Connect Via WallectConnect
        </Button>
      </div>

      <ErrorDialog
        errorMsg={errorMsg}
        showErrorMsg={showErrorMsg}
        setShowErrorMsg={setShowErrorMsg} />
    </div>);
};

export default LoginButtons;