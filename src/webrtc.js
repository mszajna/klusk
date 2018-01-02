import {Observable, Subject} from 'rxjs'
/* global JSON */

const type = expected => ({type}) => type === expected
const prop = name => ob => ob[name]
const identity = a => a

const inSignal = inSignal$ => ({
  inOffer$: inSignal$.filter(type('offer')).map(prop('sdp')),
  inAnswer$: inSignal$.filter(type('answer')).map(prop('sdp')),
  inIce$: inSignal$.filter(type('ice')).map(prop('candidate'))
})

const outSignal = ({outOffer$, outAnswer$, outIce$}) => Observable.merge(
  outOffer$.map(sdp => ({type: 'offer', sdp})),
  outAnswer$.map(sdp => ({type: 'answer', sdp})),
  outIce$.filter(identity).map(candidate => ({type: 'ice', candidate}))
)

export const iceServers = [
  {url: 'stun:stun.l.google.com:19302'},
  {
    url: 'turn:numb.viagenie.ca',
    username: 'fulguratingsportiveness@maildrop.cc',
    credential: 'dPFmGz`LjDd6]J=)'
  }
]

export const createWebrtcPeer = (wrtc, initiate) => requestTransform => inSignal$ => {
  const {inOffer$, inAnswer$, inIce$} = inSignal(inSignal$)
  const outOffer$ = new Subject()
  const outAnswer$ = new Subject()
  const outIce$ = new Subject()
  const inData$ = new Subject()
  const connect$ = new Subject()
  const disconnect$ = new Subject()
  const {data$: outData$} = requestTransform({data$: inData$.map(JSON.parse), connect$, disconnect$})
  const rtcPeerConnection = new wrtc.RTCPeerConnection({iceServers})
  inOffer$.subscribe(sdp =>
    rtcPeerConnection
      .setRemoteDescription(new wrtc.RTCSessionDescription(sdp))
      .then(() => rtcPeerConnection.createAnswer())
      .then(answer => outAnswer$.next(answer)))
  inAnswer$.subscribe(answer => rtcPeerConnection.setRemoteDescription(answer))
  outAnswer$.subscribe(answer => rtcPeerConnection.setLocalDescription(answer))
  outOffer$.subscribe(offer => rtcPeerConnection.setLocalDescription(offer))

  rtcPeerConnection.onnegotiationneeded = () =>
    rtcPeerConnection
      .createOffer()
      .then(offer => outOffer$.next(offer))

  rtcPeerConnection.onicecandidate = ({candidate}) => outIce$.next(candidate)
  inIce$.subscribe(candidate => rtcPeerConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate)))

  const setupChannel = channel => {
    channel.onmessage = ({data}) => inData$.next(data)
    channel.onopen = () => connect$.next()
    channel.onclose = () => disconnect$.next()
    outData$.map(JSON.stringify).skipUntil(connect$).takeUntil(disconnect$).subscribe(data => channel.send(data))
  }
  if (initiate) {
    setupChannel(rtcPeerConnection.createDataChannel('klusk'))
  }
  rtcPeerConnection.ondatachannel = ({channel}) => setupChannel(channel)

  return outSignal({outOffer$, outAnswer$, outIce$})
}
