export const monitorTx = async (promiseTx, web3ETH, timeoutMillis) => {
  const result = await new Promise(async (resolve, reject) => {
    // first get TxHash
    const txHash = await new Promise((resolve, reject) => {
      promiseTx.once('transactionHash', hash => {
        resolve(hash)
      })
    })
    // then set a timeOut
    const timeoutID = setTimeout(() => {
      console.log(
        `tx ${txHash} timedOut. Process to check if it's pending on node`
      )
      return resolve(txHash)
    }, timeoutMillis)

    // if promiseTx is done beforehand, clearTimeout and return promiseTx result
    promiseTx.then(
      result => {
        clearTimeout(timeoutID)
        return resolve(result)
      },
      reason => {
        clearTimeout(timeoutID)
        return reject(result)
      }
    )
  })

  // if the result is a string, that meant it is a txHash
  if (typeof result === 'string') {
    // if the result is a txHash, that meant it was timedOut
    const tx = await web3ETH.getTransaction(result)
    console.log(tx)
    // if there is no transaction with the tx, that mean it's lost. Otherwise treat it as pending.
    if (tx === null) {
      throw new Error(
        `tx '${result}' can not be found in '${timeoutMillis}' milliseconds. It is now considered as lost`
      )
    } else {
      return promiseTx
    }
  } else {
    return promiseTx
  }
}
