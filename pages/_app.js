import { useEffect } from 'react';

import '../styles/main.scss'
import '../local_modules/pintura/pintura.css';

import AOS from 'aos';
import { useRouter } from 'next/router';

import { createClient, configureChains, defaultChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { SessionProvider } from 'next-auth/react';

const { provider, webSocketProvider } = configureChains(defaultChains, [publicProvider()]);

const nextAuthClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const currentPath = router.pathname;

  useEffect(() => {

    AOS.init({
      once: true,
      disable: 'phone',
      duration: 750,
      easing: 'ease-out-quart',
    });

  }, []); // on pageload

  useEffect(() => {
    if (typeof window == undefined) {
      return
    }

    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [currentPath]); // triggered on page url change

  const getLayout = Component.getLayout || ((page) => page)

  return (
    <WagmiConfig client={nextAuthClient}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        {getLayout(<Component {...pageProps} />)}
      </SessionProvider>
    </WagmiConfig>
  )
}

export default MyApp