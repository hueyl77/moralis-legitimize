// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract LegitSignature is ERC721URIStorage {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    uint256 listingPrice = 0.001 ether;
    address payable contractOwner;
    address legitNFTAddress;

    // mapping of tokenIds to Signature NFTs
    mapping(uint256 => SignatureItem) private idToSignatureItem;

    // mapping of NFT addresses + tokenId to Signature tokenId
    mapping(string => uint256) private nftAddrCIDToTokenId;
    mapping(string => string) private nftPreviewImageUrls;

    struct SignatureItem {
      uint256 tokenId;
      address creator;
      string creatorName;
      address payable owner;
      string socialAuthJson;
    }

    event SignatureCreated (
      uint256 indexed tokenId,
      address creator,
      string creatorName,
      address owner,
      string socialAuthJson
    );

    constructor() ERC721("Legit Signature", "LSIG") {
      contractOwner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(contractOwner == msg.sender, "Only the contract owner (Legitimize) can call this function.");
      listingPrice = _listingPrice;
    }

    /* Updates the address of the LegitNFT contract */
    function setLegitNFTAddr(address _legitNFTAddr) public payable {
      require(contractOwner == msg.sender, "Only the contract owner (Legitimize) can call this function.");
      legitNFTAddress = _legitNFTAddr;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    function getTokenCreator(uint256 tokenId) public view returns (address) {
      return idToSignatureItem[tokenId].creator;
    }

    function getSigOwner(uint256 tokenId) public view returns (address) {
      return idToSignatureItem[tokenId].owner;
    }

    /* Mints a token and lists it in the Signatureplace */
    function createToken(string memory tokenURI, string memory creatorName, string memory socialAuthJson) public payable returns (uint) {

      _tokenIds.increment();

      uint256 newTokenId = _tokenIds.current();

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);

      idToSignatureItem[newTokenId] =  SignatureItem(
        newTokenId,
        msg.sender,
        creatorName,
        payable(msg.sender),
        socialAuthJson
      );

      emit SignatureCreated(
        newTokenId,
        msg.sender,
        creatorName,
        msg.sender,
        socialAuthJson
      );

      // console.log(concat("Debug, idToSignatureItem.tokenId: ", idToSignatureItem[newTokenId].tokenId.toString()));
      // console.log(concat("Debug, idToSignatureItem.creator: ", addressToAsciiString(idToSignatureItem[newTokenId].creator)));
      // console.log(concat("Debg, idToSignatureItem.owner: ", addressToAsciiString(idToSignatureItem[newTokenId].owner)));

      return newTokenId;
    }


    /* Link an NFT's address and ipfs CID to a signature token via the signature's token id */
    function linkNFT(string memory nftAddrAndCID, uint256 tokenId) public returns (uint) {
      require(idToSignatureItem[tokenId].owner == msg.sender, "Only signature owner can perform this operation");

      nftAddrCIDToTokenId[nftAddrAndCID] = tokenId;

      return tokenId;
    }

    /* Legitimize Contract call to Link an NFT's address and tokenId to a signature token via the signature's token id */
    function contractLinkNFT(string memory nftAddrAndCID, uint256 tokenId, string memory signedPreviewImageUrl) public returns (uint) {
      require(legitNFTAddress == msg.sender, "Only Legitimize can perform this operation");

      nftAddrCIDToTokenId[nftAddrAndCID] = tokenId;
      nftPreviewImageUrls[nftAddrAndCID] = signedPreviewImageUrl;

      return tokenId;
    }

    /* Returns the Signature linked to an NFT */
    function getNFTSignature(string memory nftAddrAndCID) public view returns (SignatureItem memory) {
      uint tokenId = nftAddrCIDToTokenId[nftAddrAndCID];

      SignatureItem storage sigItem = idToSignatureItem[tokenId];

      return sigItem;
    }

    /* Returns all Signature items */
    function fetchSignatureItems() public view returns (SignatureItem[] memory) {
      require(contractOwner == msg.sender, "Only the contract owner (Legitimize) can call this function.");

      uint itemCount = _tokenIds.current();
      uint currentIndex = 0;

      SignatureItem[] memory items = new SignatureItem[](itemCount);

      for (uint i = 0; i < itemCount; i++) {
        uint currentId = i + 1;
        SignatureItem storage currentItem = idToSignatureItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }

      return items;
    }

    /* Returns LegitSignatures in an account */
    function fetchMySignatures() public view returns (SignatureItem[] memory) {
      uint totalItemCount = _tokenIds.current();

      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToSignatureItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      SignatureItem[] memory items = new SignatureItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToSignatureItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          SignatureItem storage currentItem = idToSignatureItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }

      return items;
    }

    function addressToAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {

      return string(abi.encodePacked(a, b));

    }
}