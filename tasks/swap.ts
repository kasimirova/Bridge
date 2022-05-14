import * as conf from "../config";
import { task } from "hardhat/config";

task("swap", "Swap")
    .addParam("tokenaddr", "Token's address")
    .addParam("addr", "Receiver's address")
    .addParam("chainid", "Chain's id")
    .addParam("value", "Value")
    .setAction(async (taskArgs, { ethers }) => {
    let Bridge = await ethers.getContractAt("Bridge", conf.CONTRACT_ADDRESS);
    await Bridge.swap(taskArgs.tokenaddr, taskArgs.addr, taskArgs.chainid, taskArgs.value);
  });
