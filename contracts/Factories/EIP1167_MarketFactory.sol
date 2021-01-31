// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

import "./CloneFactory.sol";
import "../Markets/EIP1167_Market.sol";

/***
 * @title EIP1167_MarketFactory
 * @author codeDcode member Chinmay Vemuri
 * @notice EIP1167 compliant factory contract
 * @dev Testing required. Also check for the gas costs.
 */
 
contract EIP1167_MarketFactory is CloneFactory 
{
    address public immutable admin; /// @dev May change this to array/mapping to allow bunch of admins.
    address public implementation; /// @dev Market implementation contract. 
    address[] public markets;
    
    event newMarketCreated(address indexed newMarket, string _question);
    
    /// @dev To check if a market is valid or not.
    modifier validMarketParams(string memory _question, uint8 _numOptions, string[] memory _options, uint256 _endTime)
    {
        require(_numOptions > 1 && _numOptions < 6 && _numOptions == _options.length, "Number of options must lie between 2 and 5 (inclusive)");
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
    
    function createMarket(string calldata _question, uint8 _numOptions, string[] calldata _options, uint256 _endTime) external 
    validMarketParams(_question, _numOptions, _options, _endTime)
    {
        address newMarket = createClone(implementation);
        EIP1167_Market(newMarket).init(msg.sender, _question, _numOptions, _options, _endTime);
        
        markets.push(newMarket);
        emit newMarketCreated(newMarket, _question);
    }
        
}