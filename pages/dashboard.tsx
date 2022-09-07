import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { getSession } from 'next-auth/react';

import MainLayout from '../components/layouts/MainLayout'
import PageIllustration from '../components/shared/PageIllustration'

import Dashboard from '../components/dashboard/Dashboard';

export default function Page({ user }) {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none -z-1" aria-hidden="true">
          <PageIllustration />
        </div>

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">

              {/* Page header */}
              <div className="max-w-4xl mx-auto text-center pb-12 md:pb-16">
                <h3 className="h3 font-red-hat-display mb-4">Dashboard</h3>
              </div>

              <Dashboard />

            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // redirect if not authenticated
  if (!session) {
      return {
          redirect: {
              destination: '/login',
              permanent: false,
          },
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