import { createContext, useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi'; 
import { readContract } from '@wagmi/core'; 
import { formatEther } from 'ethers'; 
import { sepolia } from 'viem/chains'; 
import {
  abi,
  contractAddress,
  testTokenAddress,
} from '../BlockChainContext/helper';
import { config } from '../BlockChainContext/config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { address: userAddress } = useAccount();

  // State variables
  const [inputValue, setInputValue] = useState('');
  const [totalStacked, setTotalStacke] = useState();
  const [gemBalance, setGemBalance] = useState();
  const [stakeAmount, setStakeAmount] = useState(0);
  const [conversionLock, setConversionLock] = useState();
  const [gemBalanceAmount, setGemBalanceAmount] = useState(0);
  const [noOfCompoundsAmount, setNoOfCompoundsAmount] = useState(0);
  const [protectionEndTimeAmount, setProtectionEndTimeAmount] = useState(0);
  const [stakedTokensAmount, setStakedTokensAmount] = useState(0);
  const [stealCooldownAmount, setStealCooldownAmount] = useState(0);
  const [stealStreakAmount, setStealStreakAmount] = useState(0);
  const [ShowUpdatedData, setShowUpdatedData] = useState(false);

  const { data: balanceData, isError, isLoading } = useBalance({
    address: userAddress,
    token: testTokenAddress,
    chainId: sepolia.id,
  });

  useEffect(() => {
    if (userAddress) {
      getUserData();  // Ensure user address is available before calling
    }
  }, [userAddress]);

  async function getUserData() {
    try {
      const result = await readContract(config, {
        abi,
        address: contractAddress,
        functionName: 'getUserData',
        args: [userAddress],
      });

      setShowUpdatedData(true);
      setGemBalance(Number(result.gemBalanceAmount));
      setTotalStacke(formatEther(result.stakedTokensAmount));
      setConversionLock(result.conversionLock); // Assuming conversionLock has a time property
      setGemBalance(formatEther(result.gemBalanceAmount));
      setNoOfCompoundsAmount(Number(result.noOfCompoundsAmount));
      setProtectionEndTimeAmount(Number(result.protectionEndTimeAmount));
      setStakedTokensAmount(Number(result.stakedTokensAmount));
      setStealCooldownAmount(Number(result.stealCooldownAmount));
      setStealStreakAmount(Number(result.stealStreakAmount));

      console.log("User data result:", result);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Default value for contractTime to ensure it works even if conversionLock is not set
  const contractTime = Number(conversionLock?.time) || 0; 

  // console.log("contractTime", contractTime);

  //  console.log("my purchase protection end time", protectionEndTimeAmount);
  return (
    <AppContext.Provider
      value={{
        contractTime:Number(conversionLock?.time) || 0,
        ProtectionTime: Number(protectionEndTimeAmount) || 0,
        CoolDownTime: Number(stealCooldownAmount) || 0,
        gemBalance,
        totalStacked,
        conversionLock,
        gemBalanceAmount,
        noOfCompoundsAmount,
        protectionEndTimeAmount,
        stakedTokensAmount,
        stealCooldownAmount,
        stealStreakAmount,
        ShowUpdatedData,
        setStakeAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
