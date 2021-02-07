// SPDX-License-Identifier: Unlicensed
pragma solidity >= 0.7.0 < 0.8.0;
pragma abicoder v2;

import "../Utils/console.sol";
import { SafeMath } from "../Utils/SafeMath.sol";

contract EIP1167_Question 
{
    using SafeMath for uint256;
    
    enum State {BETTING, REPORTING, RESOLVED}
    
    State private currState;
    address public owner;
    string public question;
    string[] public options;
    uint256 public startTime;
    uint256 public endTime;  
    uint256 public reportingEndTime;
    uint256[] public optionBalances;
    uint256 public marketPool;
    uint256 public validationPool;
    uint256 public reportingPool;
    uint256 constant public MARKET_MAKER_FEE_PER = 995; // 0.5% for now.
    uint256 public winningOptionId;
    bool marketInitialized;
    /// @dev mapping(address=>mapping(optionId=>stake))
    mapping(address => mapping(uint256=>uint256)) public stakeDetails; // Change the visibility to private after testing
    mapping(address => bool) public hasVoted; // For betting purpose. Change the visibility to private after testing
    mapping(address => bool) public hasStaked; // For open reporting purpose. Change the visibility to private.
    // mapping(address => uint256) reportingStakeDetails;
    
    
    
    event phaseChange(address indexed _market, State _state);
    event stakeChanged(address _market, address indexed _user, uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount); // Make _market indexed ?
    event staked(address _market, address indexed _user, uint256 _optionId, uint256 _amount);
    
    
    modifier checkState(State _state)
    {
        require(currState == _state, "This function is not allowed in the current phase of the market");
        _;
    }
    
    modifier onlyOwner
    {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validOption(uint256 _optionId)
    {
        /// @dev _optionId represents the index of the option.
        require(_optionId >= 0 && _optionId < options.length);
        _;
    }
    
    
    
    function init(address _owner, string calldata _question, string[] memory _options, uint256 _endTime) external
    {
        /***
         * @dev Function for creating a market
         */
        require(!marketInitialized, "Can't change the market parameters once initialized !");
        owner = _owner;
        question = _question;
        options = _options;
        startTime = block.timestamp;
        endTime = _endTime;
        reportingEndTime = _endTime + 2 days; /// @dev Change this if necessary
        currState = State.BETTING;
        marketInitialized = true;
        
        for(uint8 i = 0; i <= _options.length; ++i) // <= So that invalid option can also be accounted for.
            optionBalances.push(0);
        
        // Code for testing purpose
        // console.log("Address of this contract is %s", address(this));
        // console.log("Owner of this contract is %s", owner);
    }
    
    function getMarketBalance() external view returns (uint256)
    {
        return address(this).balance;
    }
    
    function changeState() external
    {
        /***
         * @notice Ideally, we want only the owner to change the state but if anything unforeseen happens to the owner then anyone should be able to change the state as long as it is fair.
         */ 
        if(currState == State.BETTING)
        {
            require(block.timestamp >= endTime, "You can't change the phase now !");
            currState = State.REPORTING;
        }
        
        else if(currState == State.REPORTING)
        {
            require(block.timestamp >= reportingEndTime, "You can't change the phase now !");
            currState = State.RESOLVED;
        }
    }
    
    function stake(uint256 _optionId) external payable checkState(State.BETTING) validOption(_optionId)
    {
        /***
         * @TODO
         * Test this function for rounding errors.
         * Check if there is a better way to collect fees.
         * Uncomment the lines in this function after importing validationFee code.
         * Add a require statement to check for validationFee.
         * Check for gas costs.
         */
        uint256 amount = msg.value;
        uint256 marketMakerFee = amount.sub(MARKET_MAKER_FEE_PER*amount/1000);
        //uint256 validationFee = amount.sub((VALIDATION_FEE.sub(MARKET_MAKER_FEE_PER))*amount/1000)
        //uint256 stakeAmount = amount.sub(marketMakerFee.add(validationFee));
        uint256 optionStakeAmount = stakeDetails[msg.sender][_optionId];
        marketPool = marketPool.add(marketMakerFee);
        //validationPool = validationPool.add(validationFee);
        
        //stakeDetails[msg.sender][_optionId] = optionStakeAmount.add(stakeAmount);
        hasVoted[msg.sender] = true;
        
        emit staked(address(this), msg.sender, _optionId, msg.value);
    }
    
    
    function changeStake(uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount) external checkState(State.BETTING) validOption(_fromOptionId) validOption(_toOptionId)
    {
        /***
         * @notice This function allows the user to change the stake from one option to another option.
         * @dev Discuss whether stake change must be taxed by market maker. The code for this case has not been written.
         */
        require(block.timestamp < endTime, "Sorry, the betting phase has been completed !");
        require(hasVoted[msg.sender], "You haven't staked before !");
        require(stakeDetails[msg.sender][_fromOptionId] >= _amount, "Stake change amount is higher than the staked amount !");
        require(_fromOptionId != _toOptionId, "Options are the same !");
        require(_amount > 0, "Insufficient stake change amount"); // Is this required ?
    
        uint256 _fromOptionStakedAmount = stakeDetails[msg.sender][_fromOptionId];
        uint256 _toOptionStakedAmount = stakeDetails[msg.sender][_toOptionId];
        stakeDetails[msg.sender][_fromOptionId] = _fromOptionStakedAmount.sub(_amount);
        stakeDetails[msg.sender][_toOptionId] = _toOptionStakedAmount.add(_amount);
        
        emit stakeChanged(address(this), msg.sender, _fromOptionId, _toOptionId, _amount);
    }
    
    
    // function declareResult(uint256 _optionId) external checkState(State.REPORTING) onlyOwner
    // {
    //     /// @dev This function may not be required as the market will have a resolved option after reporting phase.
    //     winningOptionId = _optionId;
        
    // }
    
    function stakeForReporting(uint256 _optionId) external payable checkState(State.REPORTING)
    {
        require(!hasVoted[msg.sender] && !hasStaked[msg.sender], "Sorry, you have already staked/voted!");
        reportingPool = reportingPool.add(msg.value);
        stakeDetails[msg.sender][_optionId] = msg.value;
        hasStaked[msg.sender] = true;
    }
    
    function redeemBettingPayout() external checkState(State.RESOLVED)
    {
        // TODO
        require(hasVoted[msg.sender], "You have not participated in the market !");
        
    }
}