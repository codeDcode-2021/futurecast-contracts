// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import { SafeMath } from "./SafeMath.sol";

/***
 * @author codeDcode member Chinmay Vemuri
 * @dev Can change this to library instead with internal functions ?
 * @dev Here, fees are represented in basis points. 1bp = 1/100 percent = 0.01%
 */
 
library Formulas
{
    
    using SafeMath for uint256;
    
    function calcMarketMakerFee(uint256 _marketMakerFeePer, uint256 _amount) internal pure returns(uint256)
    {
        /// @dev Check for overflows. Theoretically, they shouldn't occur here since _amount is in wei and is usually much greater than 10**4.
        /// @dev Since the _amount is in weis, decimals can be ignored as they don't have a lot of value. This functions rounds towards 0.
        /// @notice _marketMakerFeePer = 1% which is equal to 100bp.
        require(_marketMakerFeePer.mul(_amount) > 10**4, "Amount too small !");
        // return _marketMakerFeePer*_amount/10**4;
        return (_marketMakerFeePer.mul(_amount)).div(10**4);
    }

    function calcValidationFee(uint256 _marketMakerFeePer, uint256 _validationFeePer, uint256 _amount) internal pure returns(uint256)
    {
        require((_validationFeePer.sub(_marketMakerFeePer)).mul(_amount) > 10**4, "Amount is too small !");
        return (((_validationFeePer.sub(_marketMakerFeePer)).mul(_amount)).div(10**4));
    }

    function calcRightWrongOptionsBalances(uint256 _rightOption, uint256[] memory _optionBalances) internal pure returns(uint256, uint256)
    {
        uint256 _wrongOptionsBalance = 0;
        uint256 _rightOptionBalance = 0;
        for(uint8 i = 0; i < _optionBalances.length; ++i)
            (i != _rightOption)? _wrongOptionsBalance = _wrongOptionsBalance.add(_optionBalances[i]): _rightOptionBalance = _rightOptionBalance.add(_optionBalances[i]);
        
        return (_rightOptionBalance, _wrongOptionsBalance);
    }
    
    function calcPayout(
        uint256 _userStakeOnRightOption, 
        uint256 _rightOptionBalance, 
        uint256 _wrongOptionsBalance) internal pure returns(uint256)
    {
        // mapping: this user, B=>7.5, right = 1000, wrong 20
        // extraBalance:
        // rightOption += wrongBalance 
        

        // uint256 payout = 0;
        /// @dev payout = userStake + (userStake*_wrongOptionsBalance/_rightOptionBalance);
        /// @dev Decimals are not required here too if we consider _userStake in wei.
        // payout = payout.add(_userStake.add(_userStake.mul(_wrongOptionsBalance.div(_rightOptionBalance))));
        
        

        return _userStakeOnRightOption.add(
            (_userStakeOnRightOption.mul(
                _wrongOptionsBalance)).div(_rightOptionBalance));
    }
    
    function calcValidationFeePer(uint256 _currTime, uint256 _startTime, uint256 _endTime) internal pure returns(uint256)
    {
        /***
         * @dev Check for rounding errors.
         * @dev Return the percentage in bp format. Precision = 2 decimal places.
         * So, 60% = 6000bp, 5% = 500bp, 0.01% = 1bp and so on.
         */
        uint256 fee = 0;
        uint256 calFactor = 10**10; // No scaling factors as this factor is neutralized later

        // uint256 T = (_endTime - _startTime)/86400;
        uint256 T = (_endTime.sub(_startTime)).div(86400);
        // uint256 t = (_currTime - _startTime)/86400;
        uint256 t = (_currTime.sub(_startTime)).div(86400);

        assert(t>=0 && T>0 && t<=T);
        
        uint256 nmin = 0;                   // Func min value
        uint256 nmax = T**5;                // Func max value
        // fee = (calFactor*(t**5-nmin))/(nmax-nmin);
        fee = (((t**5).sub(nmin)).mul(calFactor)).div(nmax.sub(nmin));

        uint256 fmin = 200;                 // The min fee applied * 100
        uint256 fmax = 7500;                // The max fee applied * 100
        // fee = fmin + ((fmax-fmin)*fee)/calFactor; // calFactor neutralized here
        fee = fmin.add((fee.mul(fmax.sub(fmin)).div(calFactor)));
        
        assert(fee>=fmin && fee<=fmax);

        return fee;
    }
    
    function calcWinningOption(uint256[] calldata _reportingOptionBalances) internal pure returns(uint256)
    {
        uint256 maxAmount = 0;
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
}