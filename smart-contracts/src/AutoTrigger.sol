// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title AutoTrigger
 * @dev A contract that automatically triggers operations on a smart wallet using Chainlink Automation
 */
contract AutoTrigger {
    // Core components
    address public immutable entryPoint;
    address public immutable smartWallet;
    
    // User operation data
    bytes public userOpData;
    
    // Scheduling
    uint256 public nextTriggerTime;
    uint256 public constant DEFAULT_INTERVAL = 1 days;
    
    // Events
    event UpkeepPerformed(bytes userOp);
    event NextTriggerScheduled(uint256 nextTimestamp);
    event UserOpDataUpdated(bytes newData);
    
    /**
     * @dev Constructor sets up the AutoTrigger with required components
     * @param _entryPoint Address of the EntryPoint contract
     * @param _smartWallet Address of the Smart Wallet contract
     */
    constructor(address _entryPoint, address _smartWallet) {
        require(_entryPoint != address(0), "Invalid entryPoint address");
        require(_smartWallet != address(0), "Invalid smartWallet address");
        
        entryPoint = _entryPoint;
        smartWallet = _smartWallet;
        
        // Schedule first trigger
        nextTriggerTime = block.timestamp + DEFAULT_INTERVAL;
        
        emit NextTriggerScheduled(nextTriggerTime);
    }
    
    /**
     * @dev Update the user operation data
     * @param _userOpData New user operation data
     */
    function updateUserOpData(bytes calldata _userOpData) external {
        userOpData = _userOpData;
        emit UserOpDataUpdated(_userOpData);
    }
    
    /**
     * @dev Set the next trigger time
     * @param _nextTriggerTime New trigger time
     */
    function setNextTriggerTime(uint256 _nextTriggerTime) external {
        require(_nextTriggerTime > block.timestamp, "Trigger time must be in the future");
        nextTriggerTime = _nextTriggerTime;
        emit NextTriggerScheduled(_nextTriggerTime);
    }
    
    /**
     * @dev Called by Chainlink node to check if performUpkeep should be called
     * @return upkeepNeeded Boolean indicating if upkeep is needed
     * @return performData Bytes data to be passed to performUpkeep
     */
    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = block.timestamp >= nextTriggerTime;
        return (upkeepNeeded, bytes(""));
    }
    
    /**
     * @dev Called by Chainlink Automation to execute the operation
     */
    function performUpkeep(bytes calldata) external {
        // Recheck condition
        require(block.timestamp >= nextTriggerTime, "Not ready");
        
        // Execute the user operation via the smart wallet
        (bool success, ) = smartWallet.call(abi.encodeWithSignature("executeUserOp(bytes)", userOpData));
        require(success, "Smart wallet execution failed");
        
        // Schedule next trigger
        nextTriggerTime = block.timestamp + DEFAULT_INTERVAL;
        
        // Emit event
        emit UpkeepPerformed(userOpData);
        emit NextTriggerScheduled(nextTriggerTime);
    }
}