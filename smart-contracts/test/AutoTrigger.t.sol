// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/AutoTrigger.sol";

// Mock for IEntryPoint
contract EntryPointMock {
    function handleOps(
        bytes calldata userOp,
        address beneficiary
    ) external pure {}
}

// Mock for ISmartWallet
contract SmartWalletMock {
    bytes public lastUserOp;

    function executeUserOp(bytes calldata userOp) external {
        lastUserOp = userOp;
    }
}

contract AutoTriggerTest is Test {
    AutoTrigger public autoTrigger;
    EntryPointMock public entryPointMock;
    SmartWalletMock public smartWalletMock;

    function setUp() public {
        entryPointMock = new EntryPointMock();
        smartWalletMock = new SmartWalletMock();
        autoTrigger = new AutoTrigger(address(entryPointMock), address(smartWalletMock));
    }

    function test_Constructor() public {
        assertEq(address(autoTrigger.entryPoint()), address(entryPointMock));
        assertEq(address(autoTrigger.smartWallet()), address(smartWalletMock));
        assertApproxEqAbs(autoTrigger.nextTriggerTime(), block.timestamp + 1 days, 1); // Allow for slight timestamp variations
    }

    function test_UpdateUserOpData() public {
        bytes memory newData = abi.encodePacked("some_new_data");
        autoTrigger.updateUserOpData(newData);
        assertEq(autoTrigger.userOpData(), newData);
    }

    function test_SetNextTriggerTime() public {
        uint256 newTime = block.timestamp + 5 days;
        autoTrigger.setNextTriggerTime(newTime);
        assertEq(autoTrigger.nextTriggerTime(), newTime);
    }

    function test_CheckUpkeep_NotNeeded() public {
        // nextTriggerTime is block.timestamp + 1 day from constructor
        (bool upkeepNeeded, ) = autoTrigger.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }

    function test_CheckUpkeep_Needed() public {
        vm.warp(block.timestamp + 2 days); // Advance time past nextTriggerTime
        (bool upkeepNeeded, ) = autoTrigger.checkUpkeep("");
        assertTrue(upkeepNeeded);
    }

    function test_PerformUpkeep_RevertsIfNotReady() public {
        vm.expectRevert("Not ready");
        autoTrigger.performUpkeep("");
    }

    function test_PerformUpkeep_Success() public {
        bytes memory testUserOp = abi.encodePacked("test_user_op");
        autoTrigger.updateUserOpData(testUserOp);

        vm.warp(block.timestamp + 2 days); // Advance time past nextTriggerTime

        vm.expectEmit(true, true, true, true, address(autoTrigger));
        emit AutoTrigger.UpkeepPerformed(testUserOp);

        autoTrigger.performUpkeep("");

        // Verify smart wallet mock received the call
        assertEq(smartWalletMock.lastUserOp(), testUserOp);

        // Verify nextTriggerTime is updated
        assertApproxEqAbs(autoTrigger.nextTriggerTime(), block.timestamp + 1 days, 1);
    }
}
