// SPDX-License-Identifier: Unlicensed
pragma solidity >= 0.7.0 < 0.8.0;
pragma abicoder v2;

import "./console.sol";
import { SafeMath } from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/math/SafeMath.sol";



contract EIP1167_Question
{
    using SafeMath for uint256;
    
    enum State {Betting, Declared, Reporting, Resolved}
    
    address public owner;
    string public question;
    string[] public options;
    uint256 public endTime;  
    uint256[] public optionBalances;

    function init(address _owner, string calldata _question, string[] memory _options, uint256 _endTime) external
    {
        /***
         * @dev Function for creating a market
         */
         
        owner = _owner;
        question = _question;
        options = _options;
        endTime = _endTime;
        
        // Code for testing purpose
        // console.log("Address of this contract is %s", address(this));
        // console.log("Owner of this contract is %s", owner);
    }
    
    
        
}