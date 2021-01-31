// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

import "./console.sol";

contract EIP1167_Market
{
    address public owner;
    string private question;
    string[] private options;
    uint8 private numOptions;
    uint256 public endTime;  

    function init(address _owner, string calldata _question, uint8 _numOptions, string[] memory _options, uint256 _endTime) external
    {
        owner = _owner;
        question = _question;
        numOptions = _numOptions;
        options = _options;
        endTime = _endTime;
        
        console.log("Address of this contract is %s", address(this));
        console.log("Owner of this contract is %s", owner);
    }
        
}