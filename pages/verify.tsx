import { useState, useEffect } from "react";
import MainLayout from '../components/layouts/MainLayout';

import VerifyNFT from '../components/verify/VerifyNFT';

export default function Page(props) {

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-10 md:pt-32 md:pb-10">

              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
                <h3 className="h3 font-red-hat-display">Verify Signed NFT</h3>
              </div>

              <VerifyNFT />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}