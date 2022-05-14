import * as conf from "../config";
import { task } from "hardhat/config";

task("redeem", "Redeem")
    .addParam("tokenaddr", "Token's address")
    .addParam("chainid", "Chain's id")
    .addParam("value", "Value")
    .addParam("v", "v")
    .addParam("r", "r")
    .addParam("s", "s")
    .addParam("nonce", "nonce")
    .setAction(async (taskArgs, { ethers }) => {
    let Bridge = await ethers.getContractAt("Bridge", conf.CONTRACT_ADDRESS);
    await Bridge.swap(taskArgs.tokenaddr, taskArgs.chainid, taskArgs.value, taskArgs.v, taskArgs.r, taskArgs.s, taskArgs.nonce);
  });
