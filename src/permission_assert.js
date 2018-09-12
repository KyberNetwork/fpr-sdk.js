export const assertOperator = async (contract, address) => {
  const operators = await contract.getOperators()
  for (var op in operators) {
    if (op.toLowerCase() === address.toLowerCase()) {
      return true
    }
  }
  return false
}

export const assertAlerter = async (contract, address) => {
  const alerters = await contract.getAlerters()
  for (var alerter in alerters) {
    if (alerter.toLowerCase() === address.toLowerCase()) {
      return true
    }
  }
  return false
}

export const assertAdmin = async (contract, address) => {
  const admin = contract.admin()
  return admin.toLowerCase() === address.toLowerCase()
}
