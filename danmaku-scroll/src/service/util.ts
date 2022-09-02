export async function wait(ms = 1000) {
  await new Promise(resolve => setTimeout(resolve, ms))
}