# Legitimize.io

<a href="https://moralis-legitimize.vercel.app" target="_blank">Legitimize.io</a> is a handwritten-signature NFT validation system, allowing users to create NFTs from their human signatures and link them to social profiles for proof of identity. Legitimate signatures can be used to sign documents and assets for authentication and legality purposes.

## Moralis-Filecoin Hackathon

Demo Video: <a href="https://www.youtube.com/watch?v=5GnQw7faOdE" target="_blank">https://www.youtube.com/watch?v=5GnQw7faOdE</a>

This web application leverage the ease of web3 functionalities using the **Moralis API** and **IPFS**'s data storage system.  The **Pinata pinning service** is used to upload and pin files to IPFS. 

Two custom ERC721 contracts, LegitSignature and LegitNFT, provide the core functionalities of NFT creation and verification.  The contracts are deployed to the **Polygon** chain (the Mumbai testnet), and uses **MATIC** for transaction fees.

The intuitive UI is built using NextJS and a handful of APIs and libraries.  Check out the technologies used section below.

### Hackathon Tracks:
- Cloning Web2
- Doing Good

### Team Member(s):

Huey Ly - (Designer and coder) - HueyL77@gmail.com

Github: <a href="https://github.com/hueyl77" target="_blank">https://github.com/hueyl77</a>

Twitter: <a href="https://twitter.com/hueyly" target="_blank">https://twitter.com/hueyly</a>

LinkedIn: <a href="https://www.linkedin.com/in/huey-ly-488ba713b" target="_blank">https://www.linkedin.com/in/huey-ly-488ba713b</a>

------------

## Technologies Used

### <a href="https://moralis.io/" target="_blank">Moralis.io</a>

Currently, this web application uses Moralis's API to authenticate and connect to the user's wallet.  On the roadmap are plans to create a managed wallet system that allows non-web3 users (without wallets) to manage their funds and NFTs.  

References:
- [request-message.ts](https://github.com/hueyl77/moralis-legitimize/blob/master/pages/api/auth/request-message.ts "request-message.ts")

- [next-auth.js](https://github.com/hueyl77/moralis-legitimize/blob/master/pages/api/auth/%5B...nextauth%5D.js "next-auth.js")

### <a href="https://pinata.cloud/" target="_blank">Pinata</a>

The Pinata pinning service is used to upload and pin the signature NFTs and signed documents and assets to IPFS.

References: 
- [api/sig-nft.tsx](http://https://github.com/hueyl77/moralis-legitimize/blob/master/pages/api/sig-nft.tsx "api/sig-nft.tsx")

- [api/legit-nft.tsx](https://github.com/hueyl77/moralis-legitimize/blob/master/pages/api/legit-nft.tsx "api/legit-nft.tsx")

- [api/lib/pinata-utils.js](https://github.com/hueyl77/moralis-legitimize/blob/master/pages/api/lib/pinata-utils.js "api/lib/pinata-utils.js")

### <a href="https://hardhat.org/" target="_blank">Hardhat</a>

The Hardhat development environment is used to develop, test, and deploy the smart contracts to Polygon Mumbai.

References:
- [_ethereum/contracts/LegitSignature.sol](https://github.com/hueyl77/moralis-legitimize/blob/master/_ethereum/contracts/LegitSignature.sol "_ethereum/contracts/LegitSignature.sol")

- [_ethereum/contracts/LegitSignature.sol](https://github.com/hueyl77/moralis-legitimize/blob/master/_ethereum/contracts/LegitSignature.sol "_ethereum/contracts/LegitSignature.sol")

- [_ethereum/scripts/deploy.js](https://github.com/hueyl77/moralis-legitimize/blob/master/_ethereum/scripts/deploy.js "deploy.js")

- [_ethereum/test/LegitNFT-test.js](https://github.com/hueyl77/moralis-legitimize/blob/master/_ethereum/test/LegitNFT-test.js "_ethereum/test/LegitNFT-test.js")

- [_ethereum/test/LegitSignature-test.js](https://github.com/hueyl77/moralis-legitimize/blob/master/_ethereum/test/LegitSignature-test.js")

## How It Works
1. The user utilizes the intuitive UI to create an NFT of their handwritten signature.  The SignatureNFT token is stored with the following metadata:

- name: the name of the person is also the name of the NFT
- description: an optional description of the NFT
- socialAuth: a json of linked social profiles (e.g. Twitter, Facebook, LinkedIn)
- image: the image url (on IPFS) of the signature
- external_url: the external image url

![Creating a handwritten-signature NFT](https://moralis-legitimize.vercel.app/_next/image?url=%2Fimages%2Flegitimize-howitworks-create-sig.png&w=3840&q=75 "Creating a handwritten-signature NFT")


The SignatureNFT contract also has custom functions to:
- link another NFT's address and IPFS content ID to a LegitSignature token
- retrieve the signatures linked to an NFT given its address and content ID.

------------

2. To create a signed NFT, the user uploads the file to the Legitimize interface and selects a signature from their connected wallet.  Legitimize will mint a new NFT linked to the signature with the following metadata:

- name: the name of the NFT
- description: an optional description of the NFT
- image: the preview image of the NFT with the signature overlayed,
- originalFile: the original file without a signature overlay, this can be any file type
- origFileType: the MIME type of the original file
- origFileCid: the IPFS content ID of the original file
- legalTerms: any embedded legal text associated with the file

![Signing an NFT](https://moralis-legitimize.vercel.app/_next/image?url=%2Fimages%2Flegitimize-howitworks-sign-nft.png&w=3840&q=75 "Signing an NFT")

3. Metadata such as the NFT's address and IPFS Content ID are stored as EXIF data in the preview image of the signed NFT.  To verify the linked signatures of an NFT, extract the EXIF data and call the smart contract function **LegitSignature.getNFTSignatures()**.

![Verify a signed NFT](https://moralis-legitimize.vercel.app/_next/image?url=%2Fimages%2Flegitimize-howitworks-verify-nft.png&w=3840&q=75 "Verify a signed NFT")

4. With their NFTs signed and stored on IPFS, users can easily sell their creations in marketplaces such as OpenSea and Rarible while assuring that the NFTs are their legitimate creations. In addition, legal contracts can be drafted and signed as NFTs to be stored safely and permanently on a blockchain, providing ease of verification in judicial systems worldwide.
------------

## Local Setup

- Clone this repo to your local environment:

```bash
git@github.com:hueyl77/moralis-legitimize.git
```

- In the project's directory install node dependencies

```bash
npm install
```

- Create a .env.local file to store local environment variables, see env.local.example

## Runnning the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run type-check before committing:

```bash
npm run type-check
```

## Solidity Dev

```bash
cd _ethereum
npx hardhat test
npx hardhat deploy-dev
```

## CSS and Style Guide

- TailwindCss
https://tailwindcss.com/

- Material-tailwind
https://material-tailwind.com/documentation/quick-start


## APIs and Packages

- Moralis.io
https://moralis.io/

- Pinata
http://pinata.cloud/

- Pintura Image Editor
https://pqina.nl/pintura/docs

- Magic Auth
https://magic.link/

- Hardhat
https://hardhat.org/

- Remove.bg
https://www.remove.bg/

- NextJs
https://nextjs.org/
