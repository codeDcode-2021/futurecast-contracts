// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

import "./CloneFactory.sol";
import "../Question/EIP1167_Question.sol";
 
contract EIP1167_Factory is CloneFactory 
{
    address public immutable admin; /// @dev May change this to array/mapping to allow bunch of admins.
    address public implementation; /// @dev Market implementation contract. 
    address[] public markets;
    
    event newQuestionCreated(address indexed newMarket, string _question);
    
    /// @dev To check if a market is valid or not.
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
    
    /// @dev Sets the original Market contract during deployment of MarketFactory contract
    constructor(address _implementation)
    {
        admin = msg.sender;
        implementation = _implementation;     
    }
    
    /// @dev Set's implementation (Market) contract
    function setImplementation(address _implementation) external
    {
        require(msg.sender == admin, "Only admin can change the implementation contract");
        implementation = _implementation;
    }
    
    function createMarket(string calldata _question, string[] calldata _options, uint256 _endTime) external 
    validParams(_question, _options, _endTime)
    {
        address newQuestion = createClone(implementation);
        EIP1167_Question(newQuestion).init(msg.sender, _question, _options, _endTime);
        
        markets.push(newQuestion);
        emit newQuestionCreated(newQuestion, _question);
    }
        
}