export const assertOperator = async (contract, address) => {
  const operators = await contract.getOperators()
  for (var op in operators) {
    if (op.toLowerCase() === address.toLowerCase()) {
      return
    }
  }
  throw new Error(`not operator address: '${address}'`)
}

export const assertAlerter = async (contract, address) => {
  const alerters = await contract.getAlerters()
  for (var alerter in alerters) {
    if (alerter.toLowerCase() === address.toLowerCase()) {
      return
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
