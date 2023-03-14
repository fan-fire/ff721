// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFF721 is IERC165, IERC721, IERC2981 {
    function getTokenIdCounter() external view returns (uint256);

    function selfDestruct(address adr) external;

    function updateBaseTokenURI(string memory uri) external;

    function updateContractURI(string memory uri) external;

    function updateTokenURI(uint256 tokenId, string memory _tokenURI) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function baseTokenURI() external view returns (string memory);

    function contractURI() external view returns (string memory);

    function setRoyalties(
        address newRecipient,
        uint256 newBasisPoints
    ) external;
}
