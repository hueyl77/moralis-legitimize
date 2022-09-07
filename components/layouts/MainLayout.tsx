import { useState, useEffect } from 'react';

import { ThemeProvider } from "@material-tailwind/react";

import Head from 'next/head';
import Link from "next/link";
import Script from 'next/script';

import HeaderNav from './HeaderNav';
import PageFooter from './PageFooter';

export default function MainLayout({ children }) {

  return (
    <ThemeProvider>
      <main>
        <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Legitimize</title>
            <meta name="description" content="Convert Your Handwritten Signatures to NFTs and use it to sign any documents and digital assets." />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex flex-col min-h-screen overflow-hidden">
          <HeaderNav />
          <main className="grow">
            {children}
          </main>
          <PageFooter />
        </div>
      </main>
    </ThemeProvider>
  )
}