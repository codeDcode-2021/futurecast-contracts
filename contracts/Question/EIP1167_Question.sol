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
    
    State private currState;
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
    // uint256 public reportingPool; //Not necessary
    uint256 constant public MARKET_MAKER_FEE_PER = 50; // 0.5% for now. Represented in bp format
    uint256 public winningOptionId;
    bool marketInitialized;
    
    /// @dev mapping(address=>mapping(optionId=>stake))
    mapping(address => mapping(uint256=>uint256)) public stakeDetails; // Change the visibility to private after testing. For Betters AND Validators
    mapping(address => bool) public hasVoted; // For betting purpose. Change the visibility to private after testing. For Betters/Voters.
    mapping(address => bool) public hasStaked; // For open reporting purpose. Change the visibility to private. For Validators.
    
    
    
    event phaseChange(address indexed _market, State _state);
    event stakeChanged(address indexed _market, address indexed _user, uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount); // Make _market indexed ?
    event staked(address indexed _market, address indexed _user, uint256 _optionId, uint256 _amount);
    event payoutReceived(address indexed _market, address indexed _user, uint256 _amount);
    
    
    
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
        if(currState == State.BETTING && block.timestamp >= endTime)
        {
            currState = State.REPORTING;
            
            emit phaseChange(address(this), currState);
        }
        
        else if(currState == State.REPORTING && block.timestamp >= endTime + 2 days)
        {
            currState = State.RESOLVED;
            
            // winningOptionId = formulas.calcWinningOption(reportingOptionBalances);
            // (bettingRightOptionBalance, bettingWrongOptionsBalance) = formulas.calcRightWrongOptionsBalances(winningOptionId, bettingOptionBalances);
            // (reportingRightOptionBalance, reportingWrongOptionsBalance) = formulas.calcRightWrongOptionsBalances(winningOptionId, reportingOptionBalances);
            
            // Library implementation
            winningOptionId = calcWinningOption(reportingOptionBalances); 
            (bettingRightOptionBalance, bettingWrongOptionsBalance) = winningOptionId.calcRightWrongOptionsBalances(bettingOptionBalances);
            (reportingRightOptionBalance, reportingWrongOptionsBalance) = winningOptionId.calcRightWrongOptionsBalances(reportingOptionBalances);
            
            //reportingPool = reportingPool.add(validationPool); //This statement is unecessary
            
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
        require(_optionId >= 0 && _optionId < options.length, "Invalid option selected");
        _;
    }
    
    
    function init(address _owner, string calldata _description, string[] memory _options, uint256 _endTime) external
    {
        /***
         * @dev Function for creating a market
         */
        require(!marketInitialized, "Can't change the market parameters once initialized !");
        owner = payable(_owner);
        description = _description;
        options = _options;
        startTime = block.timestamp;
        endTime = _endTime;
        // reportingEndTime = _endTime + 2 days; /// @dev Change this if necessary
        currState = State.BETTING;
        marketInitialized = true;
        
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
        uint256 maxAmount;
        uint256 optionId = _reportingOptionBalances.length - 1; // By default it is invalid
        
        for(uint8 i = 0; i < _reportingOptionBalances.length; ++i)
        {
            uint256 optionAmount = _reportingOptionBalances[i];
            
            if( optionAmount > maxAmount)
            {
                maxAmount = optionAmount;
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
        //console.log("Function start.");
        hasVoted[msg.sender] = true;
        uint256 amount = msg.value;

        // uint256 validationFeePer = formulas.calcValidationFeePer(block.timestamp, startTime, endTime);
        // uint256 marketMakerFee = formulas.calcMarketMakerFee(MARKET_MAKER_FEE_PER, amount);
        // uint256 validationFee = formulas.calcValidationFee(MARKET_MAKER_FEE_PER, validationFeePer, amount);
        
        // Library implementation.
        uint256 validationFeePer = block.timestamp.calcValidationFeePer(startTime, endTime);
        uint256 marketMakerFee = MARKET_MAKER_FEE_PER.calcMarketMakerFee(amount);
        uint256 validationFee = MARKET_MAKER_FEE_PER.calcValidationFee(validationFeePer, amount);
        uint256 stakeAmount = amount.sub(marketMakerFee.add(validationFee));
        uint256 optionStakeAmount = stakeDetails[msg.sender][_optionId];
        marketMakerPool = marketMakerPool.add(marketMakerFee);
        validationPool = validationPool.add(validationFee);
        marketPool = marketPool.add(stakeAmount);
        
        // // console.log("Amount staked is: %d", stakeAmount);
        stakeDetails[msg.sender][_optionId] = optionStakeAmount.add(stakeAmount);
        
        emit staked(address(this), msg.sender, _optionId, msg.value);
    }
    
    
    function changeStake(uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount) external changeState checkState(State.BETTING) validOption(_fromOptionId) validOption(_toOptionId)
    {
        /***
         * @notice This function allows the user to change the stake from one option to another option.
         * @dev Discuss whether stake change must be taxed by market maker. The code for this case has not been written.
         */
        //require(block.timestamp >= endTime, "Sorry, the betting phase has been completed !");
        require(hasVoted[msg.sender], "You haven't voted before !");
        require(stakeDetails[msg.sender][_fromOptionId] >= _amount, "Stake change amount is higher than the staked amount !");
        require(_fromOptionId != _toOptionId, "Options are the same !");
        require(_amount > 0, "Insufficient stake change amount"); // Is this required ?
    
        uint256 fromOptionStakedAmount = stakeDetails[msg.sender][_fromOptionId];
        uint256 toOptionStakedAmount = stakeDetails[msg.sender][_toOptionId];
        stakeDetails[msg.sender][_fromOptionId] = fromOptionStakedAmount.sub(_amount);
        stakeDetails[msg.sender][_toOptionId] = toOptionStakedAmount.add(_amount);
        
        emit stakeChanged(address(this), msg.sender, _fromOptionId, _toOptionId, _amount);
    }
    
    function stakeForReporting(uint256 _optionId) external payable checkState(State.REPORTING)
    {
        require(!hasVoted[msg.sender] && !hasStaked[msg.sender], "Sorry, you have already staked/voted!");
        //reportingPool = reportingPool.add(msg.value);
        validationPool = validationPool.add(msg.value);
        reportingOptionBalances[_optionId] = reportingOptionBalances[_optionId].add(msg.value);
        stakeDetails[msg.sender][_optionId] = msg.value;
        hasStaked[msg.sender] = true;
        
        emit staked(address(this), msg.sender, _optionId, msg.value);
    }
    
    function redeemBettingPayout() external payable changeState checkState(State.RESOLVED)
    {
        require(hasVoted[msg.sender], "You have not participated in the betting market !");
        require(stakeDetails[msg.sender][winningOptionId] != 0, "You lost your stake as you didn't predict the answer correctly !");
        assert(marketPool > 0); // marketPool can't be empty if the code reaches here !
        
        // uint256 amount = formulas.calcPayout(stakeDetails[msg.sender][winningOptionId], bettingRightOptionBalance, bettingWrongOptionsBalance);
        
        // Library implementation.
        uint256 amount = stakeDetails[msg.sender][winningOptionId].calcPayout(bettingRightOptionBalance, bettingWrongOptionsBalance);
        hasVoted[msg.sender] = false;
        stakeDetails[msg.sender][winningOptionId] = 0;
        marketPool = marketPool.sub(amount);
        address payable receiver = msg.sender;
        require(receiver.send(amount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, amount);
    }
    
    function redeemStakedPayout() external changeState checkState(State.RESOLVED)
    {
        require(hasStaked[msg.sender], "You haven't participated in reporting phase !");
        require(stakeDetails[msg.sender][winningOptionId] != 0, "You staked on the wrong option !");
        assert(validationPool > 0); // validationPool can't be empty if the code reaches here !
        
        // uint256 amount = formulas.calcPayout(stakeDetails[msg.sender][winningOptionId], reportingRightOptionBalance, reportingWrongOptionsBalance.add(validationPool));
        
        // Library implementation.
        uint256 amount = stakeDetails[msg.sender][winningOptionId].calcPayout(reportingRightOptionBalance, reportingWrongOptionsBalance.add(validationPool));
        hasStaked[msg.sender] = false;
        stakeDetails[msg.sender][winningOptionId] = 0;
        validationPool = validationPool.sub(amount);
        address payable receiver = msg.sender;
        require(receiver.send(amount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, amount);
    }
    
    function redeemMarketMakerPayout() external changeState checkState(State.RESOLVED) onlyOwner
    {
        require(marketMakerPool != 0, "Market maker has already collect the fees !");
        uint256 amount = marketMakerPool;
        marketMakerPool = 0;
        require(owner.send(amount), "Transaction failed !"); // Check if the transaction fails then every other state change in this function is undone.
        
        emit payoutReceived(address(this), msg.sender, amount);
    }
    
    function giveOptions() public view returns (string[] memory) 
    {
        return options;
    }
}