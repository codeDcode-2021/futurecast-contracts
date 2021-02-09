// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import { SafeMath } from "./SafeMath.sol";
import "./console.sol";

/***
 * @author codeDcode member Chinmay Vemuri
 * @dev Can change this to library instead with internal functions ?
 */
 
contract Formulas
{
    
    using SafeMath for uint256;
    
    function calcMarketMakerFee(uint256 _marketMakerFeePer, uint256 _amount) external pure returns(uint256)
    {
        return _amount.sub(_marketMakerFeePer*_amount/1000);
    }

    function calcValidationFee(uint256 _marketMakerFeePer, uint256 _validationFeePer, uint256 _amount) external pure returns(uint256)
    {
        return _amount.sub((_validationFeePer.sub(_marketMakerFeePer))*_amount/1000);
    }

    function calcRightWrongOptionsBalances(uint256 _rightOption, uint256[] calldata _optionBalances) external pure returns(uint256, uint256)
    {
        uint256 _wrongOptionsBalance = 0;
        uint256 _rightOptionBalance = 0;
        for(uint8 i = 0; i < _optionBalances.length; ++i)
            (i != _rightOption)? _wrongOptionsBalance = _wrongOptionsBalance.add(_optionBalances[i]): _rightOptionBalance = _rightOptionBalance.add(_optionBalances[i]);
        
        return (_rightOptionBalance, _wrongOptionsBalance);
    }
    
    function calcPayout(uint256 _userStake, uint256 _rightOptionBalance, uint256 _wrongOptionsBalance) external pure returns(uint256)
    {
        uint256 payout = 0;
        /// @dev payout = userStake + (userStake*_wrongOptionsBalance/_rightOptionBalance);
        payout = payout.add(_userStake.add(_userStake.mul(_wrongOptionsBalance.div(_rightOptionBalance))));
        
        return payout;
    }
    
    function calcValidationFeePer(uint256 _currTime, uint256 _startTime, uint256 _endTime) external pure returns(uint256)
    {
        /***
         * @dev Should return a value such that value/1000 is the real percentage
         * Check for rounding errors
         */

        uint256 fee = 0;
        uint256 calFactor = 10**10; // No scaling factors as this factor is neutralized later

        // uint256 T = (_endTime - _startTime)/86400;
        uint256 T = SafeMath.div(SafeMath.sub(_endTime, _startTime), 86400);
        // uint256 t = (_currTime - _startTime)/86400;
        uint256 t = SafeMath.div(SafeMath.sub(_currTime, _startTime), 86400);

        assert(t>0 && T>0 && t<T);
        
        
        uint256 nmin = 0;                   // Func min value
        uint256 nmax = T**5;                // Func max value
        // fee = (calFactor*(t**5-nmin))/(nmax-nmin);
        fee = SafeMath.div(
            SafeMath.mul(
                calFactor, 
                SafeMath.sub(t**5, nmin)
            ), 
            SafeMath.sub(nmax, nmin)
        );

        uint256 fmin = 500000;              // Fee range min
        uint256 fmax = 100000000;           // Fee range max
        // fee = fmin + ((fmax-fmin)*fee)/calFactor; // calFactor neutralized here
        fee = SafeMath.add(
            fmin,
            SafeMath.div(
                SafeMath.mul(
                    SafeMath.sub(fmax, fmin),
                    fee
                ),
                calFactor
            )
        ); // calFactor neutralized here
        
        
        assert(fee>fmin && fee<fmax);

        return fee;
    }
    
    function calcWinningOption(uint256[] calldata _reportingOptionBalances) external pure returns(uint256)
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