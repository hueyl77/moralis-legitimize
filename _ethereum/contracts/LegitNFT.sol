// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

interface ILegitSigContract {

  function contractLinkNFT(string memory nftAddrAndCID, uint tokenId,
    string memory signedPreviewImageUrl) external;

  function getSigOwner(uint tokenId) external returns(address);
}

contract LegitNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    using Strings for uint;

    Counters.Counter private _tokenIds;

    uint listingPrice = 0.001 ether;

    address proxyContractAddr = 0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c; // Mumbai opensea proxy
    address payable contractOwner;

    struct LegitItem {
      address payable owner;
      uint tokenId;
      address legitSigAddress;
      uint legitSigTokenId;
      string signedPreviewImageUrl;
      string originalFileUrl;
    }

    event LegitNFTCreated (
      address owner,
      uint indexed tokenId,
      address legitSigAddress,
      uint legitSigTokenId,
      string signedPreviewImageUrl,
      string originalFileUrl,
      string nftAddrAndCID
    );

    // mapping of ipfs CIDs to tokenIds
    mapping(string => uint) private cidToTokenIds;

    // mapping of tokenIds to Legit  NFTs
    mapping(uint => LegitItem) private idToLegitItem;

    mapping(string => uint) private origFileCidToTokenIds;

    ILegitSigContract internal legitSigContract;

    constructor() ERC721("LegitNFT", "LEGIT") {
      contractOwner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(contractOwner == msg.sender, "Only the contract owner (Legitimize) can call this function.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint) {
      return listingPrice;
    }

    function mint(
        string memory tokenURI,
        string memory cid,
        address legitSigAddress,
        uint legitSigTokenId,
        string memory signedPreviewImageUrl,
        string memory origFileCid,
        string memory originalFileUrl)
        public payable returns (uint)
    {

        legitSigContract = ILegitSigContract(legitSigAddress);

        address sigOwner = legitSigContract.getSigOwner(legitSigTokenId);

        require(sigOwner == msg.sender, "Owner of LegitSignature does not match the tokenId.");

        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();

        // link minted token ID to preview image CID
        cidToTokenIds[cid] = newTokenId;

        // link tokenId to original file CID
        origFileCidToTokenIds[origFileCid] = newTokenId;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        // create the LegitItem struct and save to mapping array
        idToLegitItem[newTokenId] =  LegitItem(
            payable(msg.sender),
            newTokenId,
            legitSigAddress,
            legitSigTokenId,
            signedPreviewImageUrl,
            originalFileUrl);

        // link NFT to Signature NFT.  minter address has to the same as owner of Signature NFT
        string memory nftAddrAndCID = concat('0x', concat(concat(addressToAsciiString(address(this)), '.'), origFileCid));

        legitSigContract.contractLinkNFT(nftAddrAndCID, legitSigTokenId, signedPreviewImageUrl);

        emit LegitNFTCreated(
          msg.sender,
          newTokenId,
          legitSigAddress,
          legitSigTokenId,
          signedPreviewImageUrl,
          originalFileUrl,
          nftAddrAndCID
        );

        return newTokenId;
    }

    /* Returns all Legit items */
    function fetchAll() public view returns (LegitItem[] memory) {
      require(contractOwner == msg.sender, "Only the contract owner (Legitimize) can call this function.");

      uint itemCount = _tokenIds.current();
      uint currentIndex = 0;

      LegitItem[] memory items = new LegitItem[](itemCount);

      for (uint i = 0; i < itemCount; i++) {
        uint currentId = i + 1;
        LegitItem storage currentItem = idToLegitItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }

      return items;
    }

    /* Returns LegitSignatures in an account */
    function fetchMyLegitItems() public view returns (LegitItem[] memory) {
      uint totalItemCount = _tokenIds.current();

      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToLegitItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      LegitItem[] memory items = new LegitItem[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToLegitItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          LegitItem storage currentItem = idToLegitItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }

      return items;
    }

    function fetchLegitItem(uint tokenId) public view returns (LegitItem memory) {

      LegitItem storage currentItem = idToLegitItem[tokenId];

      return currentItem;
    }

    function fetchLegitItemByCID(string memory origFileCid) public view returns (LegitItem memory) {

      uint tokenId = origFileCidToTokenIds[origFileCid];
      LegitItem storage currentItem = idToLegitItem[tokenId];

      return currentItem;
    }

    /**
    * Override isApprovedForAll to auto-approve OS's proxy contract
    */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
      // if OpenSea's ERC721 Proxy Address is detected, auto-return true
      // for Polygon's Mumbai testnet, use 0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c
        if (_operator == address(proxyContractAddr)) {
            return true;
        }

        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
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