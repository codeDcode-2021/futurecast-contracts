// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import "../Utils/CloneFactory.sol";
import "./EIP1167_BiconomyQuestion.sol";
 
/***
 * @dev Make sure that msg.sender is changes to msgSender() in accordance with Biconomy Mexa SDK 
 */

contract EIP1167_BiconomyFactory is CloneFactory 
{
    address public immutable admin; /// @dev May change this to array/mapping to allow bunch of admins.
    address public implementation; /// @dev Market implementation contract. 
    address[] public questionAddresses;
    
    event newQuestionCreated(address indexed _question, string _description, uint256 _bettingEndTime, uint256 _eventEndTime, uint256 _blockNumber);
    
    /// @dev To check if a market is valid or not.
    modifier validParams(string memory _question, string[] memory _options, uint256 _bettingEndTime, uint256 _eventEndTime)
    {
        require(_options.length > 1 && _options.length < 6, "Number of options must lie between 2 and 5 (inclusive)");
        require(keccak256(abi.encodePacked(_question)) != keccak256(""), "Empty questions not allowed");
        
        for(uint8 i = 0; i < (_options.length); ++i)
        {
            require(keccak256(abi.encodePacked(_options[i])) != keccak256(""), "Empty options not allowed");
        }
        
        /// @dev This condition states that gap between market creation time and betting end time must be grater than a day.
        require((_bettingEndTime > block.timestamp + 1 days) && (_eventEndTime > block.timestamp + 1 days), "Timelimit(s) not valid");
        
        require(_bettingEndTime <= _eventEndTime, "Event end time can't be smaller than the betting end time !");
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
    
    function createQuestion(string calldata _description, string[] calldata _options, uint256 _bettingEndTime, uint256 _eventEndTime) external validParams(_description,  _options, _bettingEndTime, _eventEndTime)
    {
        address newQuestion = createClone(implementation);
        EIP1167_BiconomyQuestion(newQuestion).init(admin, _description, _options, _bettingEndTime, _eventEndTime);
        questionAddresses.push(address(newQuestion));
        
        emit newQuestionCreated(address(newQuestion), _description, _bettingEndTime, _eventEndTime, block.number);
    }

    /// @dev This function is not covered by Biconomy. Hence, may not be required to call this function from factory contract.
    function stake(address payable _market, uint256 _optionId) external payable 
    {
        /// @dev Check if this works.
        EIP1167_BiconomyQuestion(_market).stake(msg.sender, _optionId).send(msg.value, "Transaction failed from factory contract !");
    }

    function changeStake(address _market, uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount) external 
    {
        ///@dev Add msgSender()
        EIP1167_BiconomyQuestion(_market).changeStake(msgSender(), _fromOptionId, _toOptionId,  _amount);
    }

    /// @dev This function is not covered by Biconomy. Hence, may not be required to call this function from factory contract.
    function stakeForReporting(address payable _market, uint256 _optionId) external
    {
        EIP1167_BiconomyQuestion(_market).stake(_optionId).send(msg.value, "Transaction failed from factory contract !");

        require(_market.send(msg.value), "Transaction failed from factory contract !");
    }

    function redeemStakedPayout(address _market) external 
    {
        EIP1167_BiconomyQuestion(_market).redeemStakedPayout(msgSender());
    }

    function redeemReportingPayout(address _market) external
    {
        EIP1167_BiconomyQuestion(_market).redeemReportingPayout(msgSender());
    }

    /// @dev Is this function necessary as the addresses are public in the first place.
    function giveQuestionAddresses() public view returns (address[] memory) 
    {
        return questionAddresses;
    }

}