// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;

/***
 * @title Market creation contract.
 * @author codeDcode member Chinmay Vemuri.
 * @notice Once the market has been created, it can't be modified.
 * @dev Can change the styling format if necessary.
 */
 
contract Market
{
    address public immutable owner;
    string private question;
    string[] private options;
    uint8 private numOptions;
    uint256 public immutable endTime;
    
    // modifier validMarketParams(
    //     string memory _question, 
    //     uint8 _numOptions, string[] memory _options, 
    //     uint256 _endTime
    //     )
    // {
    //     require(
    //         _numOptions > 1 && _numOptions < 6 && _numOptions == _options.length,
    //         "Number of options must lie between 2 and 5 (inclusive)"
    //         );
            
    //     require(
    //         keccak256(abi.encodePacked(_question)) != keccak256(""),
    //         "Empty questions not allowed"
    //         );
            
    //     for(uint8 i = 0; i < _numOptions; ++i)
    //     {
    //         require(
    //             keccak256(abi.encodePacked(_options[i])) != keccak256(""),
    //             "Empty options not allowed"
    //             );
    //     }
        
    //     require(
    //         _endTime > block.timestamp,
    //         "Timelimit not valid"
    //         );
    //     _;
    // }
    
    constructor(string memory _question, uint8 _numOptions, string[] memory _options, uint256 _endTime)
    {

        owner = tx.origin;
        question = _question;
        numOptions = _numOptions;
        options = _options;
        endTime = _endTime;
    }
    
}