const { expect } = require("chai");

describe("LegitNFT", function() {

  let LegitSignature;
  let legitSignature;

  let LegitNFT;
  let legitNFT;

  let contractOwner;
  let addr2;
  let addr3;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {

    LegitNFT = await ethers.getContractFactory("LegitNFT");
    legitNFT = await LegitNFT.deploy();

    LegitSignature = await ethers.getContractFactory("LegitSignature");
    legitSignature = await LegitSignature.deploy();

    [contractOwner, addr2, addr3] = await ethers.getSigners();

    await legitSignature.setLegitNFTAddr(legitNFT.address);
  });

  /*
   * Test minting LegitNFT
   */
  it("Should mint LegitNFT", async function() {

    const cid = 'some-hash-from-ipfs';
    const origFileCid = "some-hash-for-orig-file";

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    const legitSigToken = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                            'John Doe',
                                            '{authType: "twitter", authHandle: "tester1"}',
                                            { value: listingPrice });

    const tokenUri = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";
    const amount = 1;
    const sigTokenId = 1;

    await legitNFT.connect(addr2).mint(
        tokenUri,
        cid,
        legitSignature.address,
        sigTokenId,
        "https://legitimize.mypinata.cloud/ipfs/preview/some-hash-from-ipfs",
        origFileCid,
        "https://legitimize.mypinata.cloud/ipfs/original/some-hash-from-ipfs");

    const tokenBalance = await legitNFT.balanceOf(addr2.address);
    expect(tokenBalance).to.equal(amount);
  })

  it("Should fail to mint LegitNFT - not owner of signature", async function() {

    const tokenUri2 = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";
    const cid = 'some-hash-from-ipfs';
    const sigTokenId = 1;

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    const legitSigToken = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                            'John Doe',
                                            '{authType: "twitter", authHandle: "tester1"}',
                                            { value: listingPrice });
    try {
      await legitNFT.connect(addr3).mint(
        tokenUri2,
        cid,
        legitSignature.address,
        sigTokenId,
        "",
        "",
        "");
    }
    catch (err) {
      expect(err.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Owner of LegitSignature does not match the tokenId.'");
    }
  })

  it("Should fetch all LegitItems in an account", async function () {
    const cid = 'some-hash-from-ipfs';
    const origFileCid = "some-hash-for-orig-file";

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    const legitSigToken = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                            'John Doe',
                                            '{authType: "twitter", authHandle: "tester1"}',
                                            { value: listingPrice });

    const tokenUri = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";
    const amount = 1;
    const sigTokenId = 1;

    await legitNFT.connect(addr2).mint(
        tokenUri,
        cid,
        legitSignature.address,
        sigTokenId,
        "https://legitimize.mypinata.cloud/ipfs/preview/some-hash-from-ipfs",
        origFileCid,
        "https://legitimize.mypinata.cloud/ipfs/original/some-hash-from-ipfs");

    const legitItems = await legitNFT.connect(addr2).fetchMyLegitItems();

    expect(legitItems.length).to.equal(1);
  })

  it("Should fetch one LegitItem", async function () {
    const cid = 'some-hash-from-ipfs';
    const origFileCid = "some-hash-for-orig-file";

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    const legitSigToken = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                            'John Doe',
                                            '{authType: "twitter", authHandle: "tester1"}',
                                            { value: listingPrice });

    const tokenUri = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";
    const tokenId = 1;
    const sigTokenId = 1;

    await legitNFT.connect(addr2).mint(
        tokenUri,
        cid,
        legitSignature.address,
        sigTokenId,
        "https://legitimize.mypinata.cloud/ipfs/preview/some-hash-from-ipfs",
        origFileCid,
        "https://legitimize.mypinata.cloud/ipfs/original/some-hash-from-ipfs");

    const legitItem = await legitNFT.fetchLegitItem(tokenId);

    // console.log("LegitItem: ", legitItem)

    expect(legitItem).to.not.equal(null);
  })

  it("Should fetch one LegitItem by origCID", async function () {
    const cid = 'some-hash-from-ipfs';
    const origFileCid = "some-hash-for-orig-file";

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    const legitSigToken = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                            'John Doe',
                                            '{authType: "twitter", authHandle: "tester1"}',
                                            { value: listingPrice });

    const tokenUri = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";
    const tokenId = 1;
    const sigTokenId = 1;

    await legitNFT.connect(addr2).mint(
        tokenUri,
        cid,
        legitSignature.address,
        sigTokenId,
        "https://legitimize.mypinata.cloud/ipfs/preview/some-hash-from-ipfs",
        origFileCid,
        "https://legitimize.mypinata.cloud/ipfs/original/some-hash-from-ipfs");

    const legitItem = await legitNFT.fetchLegitItem(tokenId);

    // console.log("LegitItem: ", legitItem)

    expect(legitItem).to.not.equal(null);
  })
})