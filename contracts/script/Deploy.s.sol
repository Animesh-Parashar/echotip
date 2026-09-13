// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TipBoard} from "../src/TipBoard.sol";

contract DeployScript is Script {
    function run() external returns (TipBoard) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        TipBoard board = new TipBoard();
        vm.stopBroadcast();

        console.log("TipBoard deployed to:", address(board));
        return board;
    }
}
