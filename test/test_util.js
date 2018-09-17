import assert from 'assert'

export const assertThrowAsync = async fn => {
  let dummy = () => {}
  try {
    await fn()
  } catch (err) {
    dummy = () => {
      throw err
    }
  } finally {
    assert.throws(dummy)
  }
}
