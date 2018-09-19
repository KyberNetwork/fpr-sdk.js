export const monitorTx = async (promiseTx, web3ETH, timeoutMillis) => {
  const timedOutPromise = await new Promise(async (resolve, reject) => {
    // first get TxHash
    console.log(Object.getOwnPropertyNames(promiseTx))
    const txHash = await new Promise(resolve => {
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
        return reject(reason)
      }
    )
  })

  // if the timedOutPromise is a string, that meant it is timedOut and a txHash was returned
  if (typeof timedOutPromise === 'string') {
    const tx = await web3ETH.getTransaction(timedOutPromise)
    // if there is no transaction with the tx, that mean it's lost. Otherwise treat it as pending.
    if (tx === null) {
      throw new Error(
        `tx '${timedOutPromise}' can not be found in '${timeoutMillis}' milliseconds. It is now considered as lost`
      )
    } else {
      return promiseTx
    }
  } else {
    return promiseTx
  }
}
