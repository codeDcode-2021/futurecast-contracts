// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;

import { SafeMath } from "./SafeMath.sol";

contract Formulas
{
    
    using SafeMath for uint256;
    
    function rightWrongOptionsBalances(uint256 _rightOption, uint256[] calldata _optionBalances) external pure returns(uint256, uint256)
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
    
    function validationFee(uint256 _currTime, uint256 _startTime, uint256 _endTime) external pure returns(uint256)
    {
        uint256 T = _endTime.sub(_startTime);
        uint256 t = _endTime.sub(_currTime);
        T = T.div(86400);
        t = t.div(86400);
        assert(t>0 && T>0 && t<T);

        t = 8; // just for testing purpose

        uint256 calFactor = 10**3;

        uint256 nmin = 0;
        uint256 nmax = T;

        uint256 fmin = calFactor.mul(1);
        uint256 fmax = calFactor.mul(100);
        
        uint256 f1 = t.sub(nmin);
        uint256 f2 = nmax.sub(nmin);
        uint256 f3 = t.mul(fmax.sub(fmin));
        
        t = calFactor.mul(f1.div(f2));
        t = fmin.add(f3);

        assert(t>nmin && t<nmax);
        
        return t;
    }
}