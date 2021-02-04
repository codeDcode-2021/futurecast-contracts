// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

import "./console.sol";

contract EIP1167_Question
{
    address public owner;
    string private question;
    string[] private options;
    uint256 public endTime;  

    function init(address _owner, string calldata _question, string[] memory _options, uint256 _endTime) external
    {
        owner = _owner;
        question = _question;
        options = _options;
        endTime = _endTime;
        
        // console.log("Address of this contract is %s", address(this));
        // console.log("Owner of this contract is %s", owner);
    }
        
}