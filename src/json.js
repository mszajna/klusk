/* global JSON */
export default requestTransform => request$ =>
  requestTransform(request$.map(JSON.parse)).map(JSON.stringify)
