// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.8.0;
import "./console.sol";

contract Question
{
    address public immutable owner;
    string public description;
    string[] public options;
    uint256 public immutable endTime;
    uint256 public immutable startTime;
    

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
    
    constructor(string memory _description, string[] memory _options, uint256 _endTime)
    {
        owner = tx.origin;
        description = _description;
        options = _options;
        endTime = _endTime;
        startTime = block.timestamp;
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


    function haveIVoted() public view returns (bool) {
        return hasPaid[msg.sender]!=0;    
    }

    function additionalFee() public view returns(uint){
        uint T = (endTime - startTime)/86400;
        uint t = (endTime - block.timestamp)/86400;
        assert(t>0 && T>0 && t<T);


        t = 8; // just for testing purpose


        uint calFactor = 10**3;

        uint nmin = 0;
        uint nmax = T;

        uint fmin = 1*calFactor;
        uint fmax = 100*calFactor;

        t = calFactor*(t - nmin)/(nmax - nmin);   
        t = fmin + (fmax-fmin)*t;

        assert(t>nmin && t<nmax);
        
        return t;
    }
}