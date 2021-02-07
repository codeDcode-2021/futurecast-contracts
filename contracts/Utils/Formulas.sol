// SPDX-License-Identifier: Unlicensed
pragma solidity >=0.7.0 <0.8.0;
pragma abicoder v2;


import { SafeMath } from "./SafeMath.sol";

contract Formulas
{
    function rightWrongOptionsBalances(uint256 _rightOption, uint256[] calldata _optionBalances) external pure returns(uint256, uint256)
    {
        uint256 _wrongOptionsBalance = 0;
        uint256 _rightOptionBalance = 0;
        for(uint8 i = 0; i < _optionBalances.length; ++i)
            (i != _rightOption)? _wrongOptionsBalance = _wrongOptionsBalance.add(_optionBalances[i]): _rightOptionBalance = _rightOptionBalance.add(_optionBalances[i]);
        
        return (_rightOptionBalance, _wrongOptionsBalance);
    }
    
    function calcPayout(uint256 _userStake, uint256 _rightOptionBalance, uint256 _wrongOptionsBalance)
    {
        
    }
}