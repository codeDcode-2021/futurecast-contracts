// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;
 
contract Question
{
    address public immutable owner;
    string public question;
    string[] public options;
    uint256 public immutable endTime;

    bool private contractState = true;

    mapping(address=>uint16) hasVotedFor;
    mapping(address=>uint) hasPaid;
    // hasVoted is not added, as that functionality can be checked using hasPaid.
    // If someone has paid 0, represents no participation


    
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
    
    constructor(string memory _question, string[] memory _options, uint256 _endTime)
    {
        owner = tx.origin;
        question = _question;
        options = _options;
        endTime = _endTime;
    }
    
    function giveOptions() public view returns (string[] memory) {
        return options;
    }

    function vote(uint16 optionIndex) public payable {
        require(hasPaid[msg.sender] == 0);
        require(optionIndex < options.length);
        require(msg.value >= 1000000000); // You can change the value later
        require(contractState);

        hasPaid[msg.sender] = msg.value;
        hasVotedFor[msg.sender] = optionIndex;
    }


    // function haveIVoted() public view {
        
    // }

}