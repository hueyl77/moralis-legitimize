import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import MainLayout from '../components/layouts/MainLayout'

import CreateLegitSig from '../components/create/CreateLegitSig';

export default function Page(props) {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-10 md:pt-32 md:pb-10">

              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-4 md:pb-8">
                <h3 className="h3 text-legitBlue-500">Create Your Signature NFT</h3>

                <p>
                  Use one of the methods below to create your handwritten signature NFT.
                </p>
              </div>

              <CreateLegitSig stickers={props.stickers} />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {

  const fs = require('fs');
  let stickers = [];

  /* future feature - nft stamps */
  // fs.readdirSync('../public/images/stamps').forEach(file => {
  //   if (file.match(/.(jpg|jpeg|png|gif)$/i)) {
  //     stickers.push(file);
  //   }
  // });

  return { props: { stickers: stickers } }
}


Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}