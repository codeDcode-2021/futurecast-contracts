// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

/***
 * @title MarketFactory contract.
 * @author codeDcode member Chinmay Vemuri.
 * @notice This contract creates markets and stores the addresses of markets.
 * @dev This doesn't use EIP 1167. Try to implement that later.
 */

import "../Markets/Market.sol";

contract MarketFactory
{
    address[] public marketAddresses;
    
    event newMarketCreated(address indexed _market, string question);
    
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
    
    function createMarket(string calldata _question, uint8 _numOptions, string[] calldata _options, uint256 _endTime) external validMarketParams(_question, _numOptions, _options, _endTime)
    {
        Market newMarket = new Market(_question, _numOptions, _options, _endTime);
        marketAddresses.push(address(newMarket));
        emit newMarketCreated(address(newMarket), _question);
    }
    
}


 
