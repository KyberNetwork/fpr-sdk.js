export const assertOperator = async (contract, address) => {
  const operators = await contract.getOperators()
  for (let idx in operators) {
    if (operators.hasOwnProperty(idx)) {
      if (operators[idx].toLowerCase() === address.toLowerCase()) {
        return
      }
    }
  }

  throw new Error(`not operator address: '${address}'`)
}

export const assertAlerter = async (contract, address) => {
  const alerters = await contract.getAlerters()
  for (let idx in alerters) {
    if (alerters.hasOwnProperty(idx)) {
      if (alerters[idx].toLowerCase() === address.toLowerCase()) {
        return
      }
    }
  }

  throw new Error(`not alerter address: '${address}'`)
}

export const assertAdmin = async (contract, address) => {
  const admin = await contract.admin()
  if (admin.toLowerCase() !== address.toLowerCase()) {
    throw new Error(`not alerter address address: '${address}'`)
  }
}
