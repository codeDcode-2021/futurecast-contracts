// SPDX-License-Identifier: Unlicensed
pragma solidity >= 0.7.0 < 0.8.0;
pragma abicoder v2;

import "../Utils/console.sol";
import { SafeMath } from "../Utils/SafeMath.sol";
import { Formulas } from "../Utils/Formulas.sol";

contract EIP1167_Question 
{
    using SafeMath for uint256;
    using Formulas for uint256;
    
    // Formulas formulas;
    
    enum State {BETTING, REPORTING, RESOLVED}
    
    State public currState;
    address payable public owner;
    string public description;
    string[] public options;
    uint256[] public bettingOptionBalances;
    uint256[] public reportingOptionBalances;
    uint256 public startTime;
    uint256 public endTime;  
    // uint256 public reportingEndTime; // Not necessary
    uint256 public bettingRightOptionBalance;
    uint256 public bettingWrongOptionsBalance;
    uint256 public reportingRightOptionBalance;
    uint256 public reportingWrongOptionsBalance;
    uint256 public marketMakerPool;
    uint256 public marketPool;
    uint256 public validationPool;
    uint256 public stakeChangePool;
    // uint256 public reportingPool; //Not necessary
    uint256 constant public MARKET_MAKER_FEE_PER = 100; // 1% for now. Represented in bp format
    uint256 public winningOptionId;
    bool public marketInitialized;
    
    /// @dev mapping(address=>mapping(optionId=>stake))
    mapping(address => mapping(uint256=>uint256)) public stakeDetails; // Change the visibility to private after testing. For Betters AND Validators
    mapping(address => bool) public hasVoted; // For betting purpose. Change the visibility to private after testing. For Betters/Voters.
    mapping(address => bool) public hasStaked; // For open reporting purpose. Change the visibility to private. For Validators.
    
    
    
    event phaseChange(address indexed _market, State _state);
    event stakeChanged(address indexed _market, address indexed _user, uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount); // Make _market indexed ?
    event staked(address indexed _market, address indexed _user, uint256 _optionId, uint256 _amount);
    event payoutReceived(address indexed _market, address indexed _user, uint256 _amount);
    
    
    uint256 public fakeTimeStamp = block.timestamp;

    
    modifier checkState(State _state)
    {
        require(currState == _state, "This function is not allowed in the current phase of the market");
        _;
    }
    
    modifier changeState()
    {
        /***
         * @notice Ideally, we want only the owner to change the state but if anything unforeseen happens to the owner then anyone should be able to change the state as long as it is fair.
         * @dev Maybe change this to a modifier ?
         */ 
         
        if(currState == State.BETTING && fakeTimeStamp >= endTime)
        {
            currState = State.REPORTING;
            
            emit phaseChange(address(this), currState);
        }
        
        else if(currState == State.REPORTING && fakeTimeStamp >= endTime + 2 days)
        {
            currState = State.RESOLVED;
            
            // winningOptionId = formulas.calcWinningOption(reportingOptionBalances);
            // (bettingRightOptionBalance, bettingWrongOptionsBalance) = formulas.calcRightWrongOptionsBalances(winningOptionId, bettingOptionBalances);
            // (reportingRightOptionBalance, reportingWrongOptionsBalance) = formulas.calcRightWrongOptionsBalances(winningOptionId, reportingOptionBalances);
            
            // Library implementation
            winningOptionId = calcWinningOption(reportingOptionBalances); 
            (bettingRightOptionBalance, bettingWrongOptionsBalance) = winningOptionId.calcRightWrongOptionsBalances(bettingOptionBalances);
            (reportingRightOptionBalance, reportingWrongOptionsBalance) = winningOptionId.calcRightWrongOptionsBalances(reportingOptionBalances);
            
            emit phaseChange(address(this), currState);
        }
        
        
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
        require(_optionId >= 0 && _optionId <= options.length, "Invalid option selected");
        _;
    }
    
    
    function init(address _owner, string calldata _description, string[] memory _options, uint256 _endTime) external
    {
        /***
         * @dev Function for creating a market
         */
        require(marketInitialized == false, "Can't change the market parameters once initialized !");
        marketInitialized = true;
        owner = payable(_owner);
        description = _description;
        options = _options;
        // startTime = block.timestamp;
        startTime = fakeTimeStamp;
        endTime = _endTime;
        // reportingEndTime = _endTime + 2 days; /// @dev Change this if necessary
        currState = State.BETTING;
        
        /// @dev Check if fix sized arrays are better here.
        for(uint8 i = 0; i <= _options.length; ++i) // '<=' So that invalid option can also be accounted for.
        {
            bettingOptionBalances.push(0);
            reportingOptionBalances.push(0);
        }
        
        // formulas = new Formulas();
        // Code for testing purpose
        console.log("Address of this contract is %s", address(this));
        console.log("Owner of this contract is %s", owner);
    }
    
    function calcWinningOption(uint256[] memory _reportingOptionBalances) internal pure returns(uint256)
    {
        uint256 maxAmount = _reportingOptionBalances[_reportingOptionBalances.length-1];
        uint256 optionId = _reportingOptionBalances.length - 1; // By default it is invalid
        
        for(uint8 i = 0; i < _reportingOptionBalances.length; ++i)
        {   
            if( _reportingOptionBalances[i] > maxAmount)
            {
                maxAmount = _reportingOptionBalances[i];
                optionId = i;
            }
        }
        
        return optionId;
    }
    
    function getMarketBalance() external view returns (uint256)
    {
        return address(this).balance;
    }
    
    function stake(uint256 _optionId) external payable changeState checkState(State.BETTING) validOption(_optionId)
    {
        /***
         * @TODO
         * Modify this function to calculate the decimal values properly.
         * Test this function for rounding errors.
         * Check if there is a better way to collect fees.
         * Write separate formulas in Formulas contract for collecting fees and replace the below code.
         * Uncomment the lines in this function after importing validationFee code.
         * Check for gas costs.
         */
        // Can be called multiple times
        require(msg.value > 10**4, "Invalid amount to stake.");
        hasVoted[msg.sender] = true;

        uint256 amount = msg.value;

        // uint256 validationFeePer = formulas.calcValidationFeePer(block.timestamp, startTime, endTime);
        // uint256 marketMakerFee = formulas.calcMarketMakerFee(MARKET_MAKER_FEE_PER, amount);
        // uint256 validationFee = formulas.calcValidationFee(MARKET_MAKER_FEE_PER, validationFeePer, amount);
        
        // Library implementation.
        // uint256 validationFeePer = block.timestamp.calcValidationFeePer(startTime, endTime);
        uint256 validationFeePer = fakeTimeStamp.calcValidationFeePer(startTime, endTime);
        uint256 marketMakerFee = MARKET_MAKER_FEE_PER.calcMarketMakerFee(amount);
        uint256 validationFee = MARKET_MAKER_FEE_PER.calcValidationFee(validationFeePer, amount);
        uint256 stakeAmount = amount.sub(marketMakerFee.add(validationFee));
        uint256 optionStakeAmount = stakeDetails[msg.sender][_optionId];
        marketMakerPool = marketMakerPool.add(marketMakerFee);
        validationPool = validationPool.add(validationFee);
        marketPool = marketPool.add(stakeAmount);
        
        assert(marketMakerFee + validationFee + stakeAmount == amount); // Dangerous statement, try to round-off some error

        stakeDetails[msg.sender][_optionId] = optionStakeAmount.add(stakeAmount);
        bettingOptionBalances[_optionId] = bettingOptionBalances[_optionId].add(stakeAmount);
        
        emit staked(address(this), msg.sender, _optionId, msg.value);
    }
    
    
    function changeStake(uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount) external changeState checkState(State.BETTING) validOption(_fromOptionId) validOption(_toOptionId)
    {
        // Can be called multiple times
        /***
         * @notice This function allows the user to change the stake from one option to another option.
         * @dev 1% is being deducted from _amount.
         */

        require(hasVoted[msg.sender], "You haven't voted before!");
        require(stakeDetails[msg.sender][_fromOptionId] >= _amount, "Stake change amount is higher than the staked amount !");
        require(_fromOptionId != _toOptionId, "Options are the same !");
        require(_amount > 100, "Insufficient stake change amount"); // Is this required ?

        uint256 fromOptionStakedAmount = stakeDetails[msg.sender][_fromOptionId];
        uint256 toOptionStakedAmount = stakeDetails[msg.sender][_toOptionId];
        stakeChangePool = stakeChangePool.add(_amount.div(100));

        stakeDetails[msg.sender][_fromOptionId] = fromOptionStakedAmount.sub(_amount);
        _amount = _amount.sub(_amount.div(100)); // Deducting 1% fee.
        bettingOptionBalances[_fromOptionId] = bettingOptionBalances[_fromOptionId].sub(_amount);
        bettingOptionBalances[_toOptionId] = bettingOptionBalances[_toOptionId].add(_amount);
        stakeDetails[msg.sender][_toOptionId] = toOptionStakedAmount.add(_amount);

        emit stakeChanged(address(this), msg.sender, _fromOptionId, _toOptionId, _amount);
    }
    
    function stakeForReporting(uint256 _optionId) external payable changeState checkState(State.REPORTING)
    {
        // One time calling function
        
        require(!hasVoted[msg.sender] && !hasStaked[msg.sender], "Sorry, you have already staked/voted!");
        hasStaked[msg.sender] = true;
        
        validationPool = validationPool.add(msg.value);
        reportingOptionBalances[_optionId] = reportingOptionBalances[_optionId].add(msg.value);
        stakeDetails[msg.sender][_optionId] = msg.value;
        
        emit staked(address(this), msg.sender, _optionId, msg.value);
    }
    
    function redeemStakedPayout() external payable changeState checkState(State.RESOLVED)
    {
        require(hasVoted[msg.sender], "You have not participated in the betting market !");
        require(stakeDetails[msg.sender][winningOptionId] != 0, "You lost your stake as you didn't predict the answer correctly !");
        hasVoted[msg.sender] = false;

        // payout = userStake + (userStake*(bettingWrongOptionsBalance + stakeChangePool)/bettingRightOptionBalance)
        uint256 rewardAmount = stakeDetails[msg.sender][winningOptionId]
        .calcPayout(bettingRightOptionBalance, bettingWrongOptionsBalance.add(stakeChangePool));

        stakeDetails[msg.sender][winningOptionId] = 0;

        address payable receiver = msg.sender;
        require(receiver.send(rewardAmount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, rewardAmount);
    }
    
    function redeemReportingPayout() external changeState checkState(State.RESOLVED)
    {
        require(hasStaked[msg.sender], "You haven't participated in reporting phase !");
        require(stakeDetails[msg.sender][winningOptionId] != 0, "You staked on the wrong option !");
        assert(validationPool > 0); //validationPool can't be empty if the code reaches here!
        hasStaked[msg.sender] = false;
        
        // payout = userStake + (userStake*(reportingWrongOptionsBalance + validationFees)/reportingRightOptionBalance)
        uint256 rewardAmount = stakeDetails[msg.sender][winningOptionId]
        .calcPayout(
            reportingRightOptionBalance, 
            validationPool.sub(reportingRightOptionBalance)
        );
        
        stakeDetails[msg.sender][winningOptionId] = 0;

        address payable receiver = msg.sender;
        require(receiver.send(rewardAmount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, rewardAmount);
    }
    
    function redeemMarketMakerPayout() external changeState checkState(State.RESOLVED) onlyOwner
    {
        require(marketMakerPool != 0, "Market maker has already collect the fees !");
        uint256 amount = marketMakerPool;
        marketMakerPool = 0;
        require(owner.send(amount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, amount);
    }
    
    
    // Waste functions
    function TcalcValidationFeePer(uint256 _currTime, uint256 _startTime, uint256 _endTime) public pure returns (uint256){
        return Formulas.calcValidationFeePer(_currTime, _startTime, _endTime);
    }
    function changeFakeTimestamp(uint256 x) public {
        fakeTimeStamp = x;
    }
}