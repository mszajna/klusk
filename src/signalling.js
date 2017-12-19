
export const serverSignalling = (localId, signalTransform) => data$ => data$
  .groupBy(({from}) => from, ({signal}) => signal)
  .map(client$ => ({
    remoteId: client$.key,
    signal$: signalTransform(client$).map(signal => ({from: localId, signal}))
  }))

export const clientSignalling = (localId, remoteId, signalTransform) => data$ =>
  signalTransform(data$
    .filter(({from}) => from === remoteId)
    .map(({signal}) => signal))
    .map(signal => ({from: localId, signal}))
