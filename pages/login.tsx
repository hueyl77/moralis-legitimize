import MainLayout from '../components/layouts/MainLayout';

import LoginButtons from '../components/login/LoginButtons';
import { getSession } from 'next-auth/react';


export default function Page(props) {

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h3 className="h3 text-legitBlue-500">Connect Wallet</h3>

            <p className="mb-8">
              Connect your wallet to view and create your handwritten signatures and signed NFTs.
            </p>

            <LoginButtons redirUrl={`/dashboard`} />
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // redirect if not authenticated
  if (!session) {
      return {
        props: { user: null },
      };
  }

  return {
      props: { user: session.user },
  };
}

Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}