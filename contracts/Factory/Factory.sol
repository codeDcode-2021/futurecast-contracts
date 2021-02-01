// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

import "../Question/Question.sol";

contract Factory
{
    address[] public marketAddresses;
    
    event newQuestionCreated(address indexed _market, string question);
    
    modifier validParams(string memory _question, string[] memory _options, uint256 _endTime)
    {
        uint _numOptions = _options.length;
        require(_numOptions > 1 && _numOptions < 6, "Number of options must lie between 2 and 5 (inclusive)");
        require(keccak256(abi.encodePacked(_question)) != keccak256(""), "Empty questions not allowed");
            
        for(uint8 i = 0; i < _numOptions; ++i)
        {
            require(keccak256(abi.encodePacked(_options[i])) != keccak256(""), "Empty options not allowed");
        }
        
        require(_endTime > block.timestamp, "Timelimit not valid");
        _;
    }
    
    function createMarket(string calldata _statement, string[] calldata _options, uint256 _endTime) external validParams(_statement,  _options, _endTime)
    {
        Question newQuestion = new Question(_statement, _options, _endTime);
        marketAddresses.push(address(newQuestion));
        emit newQuestionCreated(address(newQuestion), _statement);
    }
}