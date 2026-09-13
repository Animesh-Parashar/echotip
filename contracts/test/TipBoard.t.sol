// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipBoard} from "../src/TipBoard.sol";

contract TipBoardTest is Test {
    TipBoard public board;
    address sender = address(0xA11CE);
    address recipient = address(0xB0B);

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function setUp() public {
        board = new TipBoard();
        vm.deal(sender, 1 ether);
    }

    function test_SendTipEmitsEventStoresTipAndTransfersFunds() public {
        uint256 amount = 0.01 ether;
        string memory message = "gm, thanks for ENS!";
        uint256 recipientBalanceBefore = recipient.balance;

        vm.expectEmit(true, true, false, true);
        emit TipSent(sender, recipient, amount, message, block.timestamp);

        vm.prank(sender);
        board.sendTip{value: amount}(recipient, message);

        TipBoard.Tip[] memory tips = board.getTips(recipient);
        assertEq(tips.length, 1);
        assertEq(tips[0].sender, sender);
        assertEq(tips[0].amount, amount);
        assertEq(tips[0].message, message);
        assertEq(tips[0].timestamp, block.timestamp);

        assertEq(board.getTipCount(recipient), 1);
        assertEq(board.totalTips(), 1);
        assertEq(recipient.balance, recipientBalanceBefore + amount);
    }

    function test_RevertsOnInvalidRecipient() public {
        vm.prank(sender);
        vm.expectRevert("Invalid recipient");
        board.sendTip(address(0), "hi");
    }

    function test_RevertsOnMessageTooLong() public {
        string memory longMessage = new string(281);
        vm.prank(sender);
        vm.expectRevert("Message too long");
        board.sendTip(recipient, longMessage);
    }
}
