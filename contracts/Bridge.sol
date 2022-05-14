//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Bridge is Ownable {
    address validator;

    mapping(uint256=>bool) chains;
    mapping(address=>bool) tokens;
    mapping(bytes32=>bool) messages;

    event SWAP(address addr, address tokenAddr, uint256 chainId, uint256 value);
    event REDEEM(address addr, uint256 value, uint8 v, bytes32 r,  bytes32 s);

    constructor(address _validator) {
        validator = _validator;
    }

    function updateChainById(uint256 id) external onlyOwner{
        chains[id] = chains[id] ? false : true;
    }
    
    function includeToken(address addr) external onlyOwner{
        tokens[addr] = true;
    }

    function excludeToken(address addr) external onlyOwner{
        tokens[addr] = false;
    }

    function swap(address tokenAddr, address addr, uint256 chainId, uint256 value) external{
        require(tokens[tokenAddr] == true, "This token is not available");
        require(chains[chainId] == true, "This chain is not available");
        IERC20(tokenAddr).burn(msg.sender, value);
        emit SWAP(addr, tokenAddr,  chainId, value);
    }

    function redeem(address tokenAddr, uint256 chainId, uint256 value, uint8 v, bytes32 r,  bytes32 s, uint256 nonce) external {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, value, tokenAddr, chainId, nonce));
       	bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        message = keccak256(abi.encodePacked(prefix, message));
        require(messages[message] == false, "This message is already used");
        messages[message] = true;
        address addr = ecrecover(message, v, r, s);
        require(addr == validator, "Validator is not a signer");
        IERC20(tokenAddr).mint(msg.sender, value);
        emit REDEEM(msg.sender, value, v, r, s);
    }

    function isTokenIncluded(address tokenAddr) external view returns (bool) {
       	return tokens[tokenAddr];
    }

    function isChainIncluded(uint256 chainId) external view returns (bool) {
       	return chains[chainId];
    }
}
