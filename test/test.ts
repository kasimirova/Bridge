const { expect } = require("chai");
const { ethers} = require("hardhat");

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
let Bridge : Contract, bridge : Contract, erc20 : Contract, ERC20 : Contract, erc202 : Contract, ERC202 : Contract;
let owner:SignerWithAddress, addr1:SignerWithAddress, addr2:SignerWithAddress, nonce:any;

describe("Bridge", function () {
  before(async function () 
  {
    [owner, addr1, addr2] = await ethers.getSigners();
    nonce = 0;
    Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy(owner.address);
    await bridge.deployed();

    ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("Token1", "Tkn1", 18, ethers.utils.parseEther("10000"));
    await erc20.deployed();

    let MINTER_ROLE = await erc20.MINTER_ROLE();
    erc20.grantRole(MINTER_ROLE, bridge.address);

    let BURNER_ROLE = await erc20.BURNER_ROLE();
    erc20.grantRole(BURNER_ROLE, bridge.address);

    erc20.transfer(addr1.address, ethers.utils.parseEther("500"));
  });

  it("Shouldn't include token and chain as not an owner", async function () {
    await expect(bridge.connect(addr1).includeToken(erc20.address)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(bridge.connect(addr1).excludeToken(erc20.address)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(bridge.connect(addr1).updateChainById(35)).to.be.revertedWith("Ownable: caller is not the owner");
  }
  );

  it("Should include token and chain", async function () {
    await bridge.includeToken(erc20.address);
    await bridge.updateChainById(97);
    expect(await bridge.isTokenIncluded(erc20.address)).to.equal(true);
    expect(await bridge.isChainIncluded(97)).to.equal(true);
  }
  );

  it("Should swap tokens", async function () {
    await bridge.connect(addr1).swap(erc20.address, addr2.address, 97, ethers.utils.parseEther("50"));    
  }
  );

  it("Shouldn't swap with not supported tokens", async function () {
    ERC202 = await ethers.getContractFactory("ERC20");
    erc202 = await ERC202.deploy("Token2", "Tkn2", 18, ethers.utils.parseEther("10000"));
    await erc202.deployed();
    await expect(bridge.connect(addr1).swap(erc202.address, addr2.address, 97, ethers.utils.parseEther("50"))).to.be.revertedWith("This token is not available");
  }
  );

  it("Shouldn't swap with not supported chain", async function () {
    await expect(bridge.connect(addr1).swap(erc20.address, addr2.address, 30, ethers.utils.parseEther("50"))).to.be.revertedWith("This chain is not available");
  }
  );

  it("Should redeem tokens", async function () {
    let msg = ethers.utils.solidityKeccak256(
	    ["address", "uint256", "address", "uint256", "uint256"],
			[addr2.address, ethers.utils.parseEther("50"), erc20.address, 97, nonce]
    )
    let signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);
    await bridge.connect(addr2).redeem(erc20.address, 97, ethers.utils.parseEther("50"), sig.v, sig.r, sig.s, nonce);    
  }
  );

  it("Shouldn't redeem tokens second time", async function () {
    let msg = ethers.utils.solidityKeccak256(
	    ["address", "uint256", "address", "uint256", "uint256"],
			[addr2.address, ethers.utils.parseEther("50"), erc20.address, 97, nonce]
    )
    let signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);

    await expect(bridge.connect(addr2).redeem(erc20.address, 97, ethers.utils.parseEther("50"), sig.v, sig.r, sig.s, nonce)).to.be.revertedWith("This message is already used");   
  }
  );

  it("Shouldn't redeem tokens with wrong nonce", async function () {
    let msg = ethers.utils.solidityKeccak256(
	    ["address", "uint256", "address", "uint256", "uint256"],
			[addr2.address, ethers.utils.parseEther("50"), erc20.address, 97, nonce]
    )
    let signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);

    await expect(bridge.connect(addr2).redeem(erc20.address, 97, ethers.utils.parseEther("50"), sig.v, sig.r, sig.s, 34)).to.be.revertedWith("Validator is not a signer");
  }
  );

  it("Should exclude token", async function () {
    await bridge.excludeToken(erc20.address);
    expect(await bridge.isTokenIncluded(erc20.address)).to.equal(false);
  }
  );
});
