// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TipBoard {
    struct Tip {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    mapping(address => Tip[]) private tipsReceived;
    uint256 public totalTips;

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function sendTip(address recipient, string calldata message) external payable {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(message).length <= 280, "Message too long");

        tipsReceived[recipient].push(Tip({
            sender: msg.sender,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp
        }));

        totalTips += 1;

        if (msg.value > 0) {
            (bool sent, ) = recipient.call{value: msg.value}("");
            require(sent, "Transfer failed");
        }

        emit TipSent(msg.sender, recipient, msg.value, message, block.timestamp);
    }

    function getTips(address recipient) external view returns (Tip[] memory) {
        return tipsReceived[recipient];
    }

    function getTipCount(address recipient) external view returns (uint256) {
        return tipsReceived[recipient].length;
    }
}
