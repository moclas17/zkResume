// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract zkResumeSnapshot is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct Snapshot {
        bytes32 resumeHash; // Hash del snapshot confidencial
        uint256 issuedAt;
    }

    mapping(uint256 => Snapshot) public snapshots;

    constructor() ERC721URIStorage() Ownable(msg.sender) {
        _tokenIds = 0;
    }

    /// @notice Minter: solo el usuario (o backend autorizado) puede mintear
    function mint(address recipient, bytes32 resumeHash, string memory metadataURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        snapshots[newItemId] = Snapshot({
            resumeHash: resumeHash,
            issuedAt: block.timestamp
        });

        return newItemId;
    }
}
