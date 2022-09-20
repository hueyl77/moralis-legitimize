import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import MainLayout from '../components/layouts/MainLayout';
import SignNFT from '../components/sign/SignNFT';

export default function Page(props) {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pt-32 pb-12">

              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-8 md:pb-12">
                <h3 className="h3 text-legitBlue-500">Create a Signed NFT</h3>
                <p>Upload and create a signed NFT of a media file or document</p>
              </div>

              <SignNFT />

          </div>
        </section>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {

  return { props: { } }
}


Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}