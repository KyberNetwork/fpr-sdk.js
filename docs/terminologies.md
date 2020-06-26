# Concepts

These are important concepts to understand for on-chain market making.

## minimalRecordResolution : 
Per trade imbalance values are recorded and stored in the contract. Since this storage of data is an expensive operation, the data is squeezed into one bytes32 object. To prevent overflow while squeezing data, a resolution unit exists. 

Recommended value is the token wei equivalent of $0.001 - $0.01. Eg: Assume 1 KNC = $1. $0.001 = 0.001 KNC .Now KNC has 18 decimals, so 0.001*(10^18) = 1000000000000000

## maxPerBlockImbalance: 
The maximum wei amount of net absolute (+/-) change for a token in an ethereum block. We recommend this value to be larger than the maximum allowed tradable token amount for a whitelisted user. Suppose we want the maximum change in 1 block to be 2700 KNC, then we use 2700 * (10 ^18) = 2700000000000000000000.

Eg:  Suppose we have 2 users Alice and Bob. Alice tries to buy 1000 KNC and Bob tries to buy 2000 KNC. Assuming both transactions are included in the same block and Alice's transaction gets processed first, Bob's transaction will fail because the resulting net change of -3000 KNC would exceed the limit of 2700 KNC. However, if Bob decides to sell instead of buy, then the net change becomes +1000 KNC, which means an additional 3700 KNC can be bought, or 1700 KNC sold.

## maxTotalImbalance 
Should be >= maxPerBlockImbalance. Represents the amount in wei for the net token change that happens between 2 price updates. This number is reset every time setBaseRate() is called in ConversionRates contract. 

This acts as a safeguard measure to prevent reserve depletion from unexpected events between price updates. We recommend this to reflect up to 20-30% of your inventory or any other amount you deem to be safe.