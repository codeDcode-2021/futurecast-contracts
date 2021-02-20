// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import "../Utils/CloneFactory.sol";
import "../Question/EIP1167_Question.sol";
 
contract EIP1167_Factory is CloneFactory 
{
    address public immutable admin; /// @dev May change this to array/mapping to allow bunch of admins.
    address public implementation; /// @dev Market implementation contract. 
    address[] public questionAddresses;
    
    event newQuestionCreated(address indexed _question, string _description, uint256 _bettingEndTime, uint256 _eventEndTime);
    
    /// @dev To check if a market is valid or not.
    modifier validParams(string memory _question, string[] memory _options, uint256 _bettingEndTime, uint256 _eventEndTime)
    {
        require(_options.length > 1 && _options.length < 6, "Number of options must lie between 2 and 5 (inclusive)");
        require(keccak256(abi.encodePacked(_question)) != keccak256(""), "Empty questions not allowed");
        
        for(uint8 i = 0; i < (_options.length); ++i)
        {
            require(keccak256(abi.encodePacked(_options[i])) != keccak256(""), "Empty options not allowed");
        }
        
        require((_bettingEndTime > block.timestamp) && (_eventEndTime > block.timestamp), "Timelimit(s) not valid");
        /// @dev Have a discussion about the following condition.
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
        EIP1167_Question(newQuestion).init(msg.sender, _description, _options, _bettingEndTime, _eventEndTime);
        questionAddresses.push(address(newQuestion));
        
        emit newQuestionCreated(address(newQuestion), _description, _bettingEndTime, _eventEndTime);
    }

    /// @dev Is this function necessary as the addresses are public in the first place.
    function giveQuestionAddresses() public view returns (address[] memory) 
    {
        return questionAddresses;
    }
        
}