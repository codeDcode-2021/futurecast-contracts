// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import "../Question/EIP1167_Question.sol";

contract Factory
{
    address[] public questionAddresses;
    
    /// @dev Made changes here. Added betting end time and event end time.
    event newQuestionCreated(address indexed _question, string _description, uint256 _bettingEndTime, uint256 _eventEndTime);
    
    modifier validParams(string memory _question, string[] memory _options, uint256 _bettingEndTime, uint256 _eventEndTime)
    {
        require(_options.length > 1 && _options.length < 6, "Number of options must lie between 2 and 5 (inclusive)");
        require(keccak256(abi.encodePacked(_question)) != keccak256(""), "Empty questions not allowed");
        
        for(uint8 i = 0; i < _numOptions; ++i)
        {
            require(keccak256(abi.encodePacked(_options[i])) != keccak256(""), "Empty options not allowed");
        }
        
        require(_bettingEndTime > block.timestamp && _eventEndTime > block.timestamp, "Timelimit(s) not valid");
        /// @dev Have a discussion about the following condition.
        require(_bettingEndTime != _eventEndTime, "Betting end time and event end time can't be the same !");
        _;
    }
    
    function createQuestion(string calldata _description, string[] calldata _options, uint256 _bettingEndTime, uint256 _eventEndTime) external validParams(_description,  _options, _bettingEndTime, _eventEndTime)
    {
        EIP1167_Question newQuestion = new EIP1167_Question();
        newQuestion.init(msg.sender, _description, _options, _bettingEndTime, _eventEndTime);
        questionAddresses.push(address(newQuestion));
        emit newQuestionCreated(address(newQuestion), _description, _bettingEndTime, _eventEndTime);
    }

    /// @dev Is this function necessary as the addresses are public in the first place.
    function giveQuestionAddresses() public view returns (address[] memory) 
    {
        return questionAddresses;
    }
}