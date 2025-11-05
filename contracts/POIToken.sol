// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POIToken
 * @dev Proof of Influence Token - ERC20代币合约
 * 
 * 代币信息:
 * - 名称: Proof of Influence
 * - 符号: POI
 * - 小数位: 18
 * - 总供应量: 1,000,000,000 POI (10亿)
 * 
 * 功能:
 * - 标准ERC20功能
 * - 可销毁
 * - 所有者可以铸造新代币
 */
contract POIToken is ERC20, ERC20Burnable, Ownable {
    
    // 初始供应量: 1,000,000,000 POI (10亿)
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    
    /**
     * @dev 构造函数 - 铸造初始供应量给部署者
     */
    constructor() ERC20("Proof of Influence", "POI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev 铸造新代币 (仅所有者)
     * @param to 接收地址
     * @param amount 数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev 批量转账
     * @param recipients 接收地址数组
     * @param amounts 数量数组
     */
    function batchTransfer(address[] memory recipients, uint256[] memory amounts) public {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }
}


