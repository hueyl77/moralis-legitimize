import { NextRequest, NextResponse } from 'next/server'
// import Moralis from 'moralis';

// authenticate api endpoints by checking that user is logged in
export async function middleware(req: NextRequest) {

  // await Moralis.start({ serverUrl: moralisServerUrl, appId: moralisAppId, masterKey: moralisMasterKey });

  // const currentUser = await Moralis.User.currentAsync();
  // if (!currentUser) {
  //   return new Response('Auth required', {
  //     status: 401
  //   })
  // }

  return NextResponse.next()
}