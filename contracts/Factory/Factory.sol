// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import "../Question/EIP1167_Question.sol";

contract Factory
{
    address[] public questionAddresses;
    
    event newQuestionCreated(address indexed _question, string _description);
    
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
    
    function createQuestion(string calldata _description, string[] calldata _options, uint256 _endTime) external validParams(_description,  _options, _endTime)
    {
        EIP1167_Question newQuestion = new EIP1167_Question();
        newQuestion.init(msg.sender, _description, _options, _endTime);
        questionAddresses.push(address(newQuestion));
        emit newQuestionCreated(address(newQuestion), _description);
    }

    function giveLastDeployed() public view returns (address) {
        return questionAddresses[questionAddresses.length-1];
    }
}