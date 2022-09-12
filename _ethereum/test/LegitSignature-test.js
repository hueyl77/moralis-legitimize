const { expect } = require("chai");

describe("LegitSignature", function() {

  let LegitSignature;
  let legitSignature;

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
   * Test creating signature tokens
   */
  it("Should create LegitSignature NFTs", async function() {

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    // create two tokens
    const tokenId1 = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                          "John Doe",
                                          '{authType: "twitter", authHandle: "tester1"}',
                                          { value: listingPrice });

    const tokenId2 = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                          "John Doe",
                                          '{authType: "twitter", authHandle: "tester1"}',
                                          { value: listingPrice });

    // const mySignatures = await legitSignature.connect(addr2).fetchMySignatures();
    // console.log("mySignatures: ", mySignatures);

    const tokenBalance = await legitSignature.balanceOf(addr2.address);
    const ownerOf = await legitSignature.ownerOf(1);

    expect(tokenBalance).to.equal(2);
    expect(ownerOf).to.equal(addr2.address);
  })

  /*
   * Test linking signature tokens to an NFT
   */
  it("Should link NFTs to LegitSignature", async function() {

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    let socialAuthJson = JSON.stringify({
      "socialLinks": [
        {
          authType: "twitter",
          socialName: "John Doe",
          socialHandle: "@tester1",
          dateLinked: "2022-06-01 13:07:01 UTC"
        },
        {
          authType: "facebook",
          socialName: "John Doe",
          socialHandle: "fb.profile1",
          dateLinked: "2022-06-01 13:07:01 UTC"
        }
      ]
    });

    await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                                      'John Doe',
                                                      socialAuthJson,
                                                      { value: listingPrice });

    let nftAddrAndCID = '0x1234.abc123xyz';
    let tokenId = 1;

    await legitSignature.connect(addr2).linkNFT(nftAddrAndCID, tokenId);

    let result = await legitSignature.connect(addr2).getNFTSignatures(nftAddrAndCID);
    // console.log("result: ", result);
    expect(result[0].tokenId).to.equal(tokenId);
    expect(result[0].creator).to.equal(addr2.address);
    expect(result[0].owner).to.equal(addr2.address);

    // should let non-owner get signature
    let result2 = await legitSignature.connect(addr3).getNFTSignatures(nftAddrAndCID);
    expect(result2[0].creator).to.equal(addr2.address);
  })

  /*
   * Test fail linking signature tokens to an NFT because sender is not signature owner
   */
  it("Should fail linking NFTs to LegitSignature - sender is not owner", async function() {

    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
        'John Doe',
        '{authType: "twitter", authHandle: "tester1"}',
        { value: listingPrice });

    let nftAddrAndCID = '0x1234.abc123zyz';
    let tokenId = 1;

    // should not let not-owner of signature to call link nft
    try {
      await legitSignature.connect(addr3).linkNFT(nftAddrAndCID, tokenId);
    }
    catch (err) {
      expect(err.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only signature owner can perform this operation'");
    }
  })


  it("Should fetch all signatures in an account", async function () {
    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    // create two tokens
    const tokenId1 = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                          "John Doe",
                                          '{authType: "twitter", authHandle: "tester1"}',
                                          { value: listingPrice });

    const tokenId2 = await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                          "John Doe",
                                          '{authType: "twitter", authHandle: "tester1"}',
                                          { value: listingPrice });

    const signatures = await legitSignature.connect(addr2).fetchMySignatures();
    expect(signatures.length).to.equal(2);
  })

  it("Should fetch one signature from LegitNFTAddr and CID", async function () {
    let listingPrice = await legitSignature.getListingPrice();
    listingPrice = listingPrice.toString();

    // create two tokens
    await legitSignature.connect(addr2).createToken("https://www.mytokenlocation.com",
                                          "John Doe",
                                          '{authType: "twitter", authHandle: "tester1"}',
                                          { value: listingPrice });

    const cid = 'some-hash-from-ipfs';
    const origFileCid = "some-hash-for-orig-file";
    const legitTokenUri = "https://legitimize.mypinata.cloud/ipfs/some-hash-from-ipfs";

    const nftResult = await legitNFT.connect(addr2).mint(
        legitTokenUri,
        cid,
        legitSignature.address,
        1,
        "https://legitimize.mypinata.cloud/ipfs/preview/some-hash-from-ipfs",
        origFileCid,
        "https://legitimize.mypinata.cloud/ipfs/original/some-hash-from-ipfs");

    const nftAddrAndCID = legitNFT.address.toString().toLowerCase() + "." + origFileCid;

    const retrievedSigs = await legitSignature.getNFTSignatures(nftAddrAndCID);
    // console.log("retrievedSig: ", retrievedSig);

    expect(retrievedSigs[0].tokenId).to.equal(1);
  })

})