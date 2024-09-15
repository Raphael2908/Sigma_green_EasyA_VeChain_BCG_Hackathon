'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet, WalletButton } from "@vechain/dapp-kit-react";

const DAppKitProvider = dynamic(
  async () => {
    const { DAppKitProvider: _DAppKitProvider } = await import(
      '@vechain/dapp-kit-react'
    );
    return _DAppKitProvider;
  },
  {
    ssr: false,
  }
);

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionChallenge, setSessionChallenge] = useState<''>();


  useEffect(() => {
    fetch('/api/challenge', {
      method: 'GET',
    })
      .then((result) => result.json())
      .then(({ message }) => setSessionChallenge(message))
      .catch(() => {
        /* ignore */
      });
  }, []);

  return (
    <html lang="en">
      <body className='flex container flex-col mx-auto'>
        <DAppKitProvider
          nodeUrl="https://testnet.vechain.org"
          genesis="test"
          requireCertificate
          usePersistence

        >
          <div className=' py-2 flex items-center justify-between'>
            <Link className='underline text-blue-300' href="/event_form">Create an event</Link>
            <WalletButton/>
          </div>

          {children}
        </DAppKitProvider>
      </body>
    </html>
  );
}
