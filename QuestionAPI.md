# Calling EIP1167_Question.sol
> For detailed information about the functions, visit `contracts/Question/EIP1167_Question.sol`

### publicVariables()
> returns an object of important public variables

returns: 
```
(
  description,
[
  startTime,
  bettingEndTime,
  eventEndTime,
  reportingStartTime,
  bettingRightOptionBalance,
  bettingWrongOptionsBalance,
  reportingRightOptionBalance,
  reportingWrongOptionsBalance,
  marketMakerPool,
  marketPool,
  validationPool,
  validationFeePool,
  stakeChangePool,
  winningOptionId,
  uint256(currState)
],
[
  bettingOptionBalances,
  reportingOptionBalances
],
  options
)
```
### stake(uint256 _optionId)
> staking on a particular option
> payable function
### changeStake(uint256 _fromOptionId, uint256 _toOptionId, uint256 _amount)
> changing your stake from one option to another
### stakeForReporting(uint256 _optionId)
> staking for reporting
> payable function
### redeemStakedPayout()
> redeem your reward related to voting period
### redeemReportingPayout()
> redeem your reward related to reporting period
### redeemMarketMakerPayout()
> redeem your owner fee
### currentValidationFee()
> get the current validation fee applied
```
returns: fee*100
```
