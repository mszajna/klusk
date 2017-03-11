import {Observable} from 'rxjs'
import {flow} from 'lodash/fp'

export const mergePipes = (...ts) => x$ => Observable.merge(...ts.map(t => t(x$)))

export const log = transform => data$ => {
  data$.subscribe(data => console.log('received', data))
  const transformed$ = transform(data$)
  transformed$.subscribe(data => console.log('sent', data))
  return transformed$
}

export const type = type => ({type: _type}) => _type === type

export const filter = predicate => x$ => x$.filter(predicate)

export const map = f => x$ => x$.map(f)

export const withLatestFrom = b$ => a$ => a$
  .withLatestFrom(b$)

// Messages

export const isType = (type, unwrap) => filter(({type: _type}) => _type === type)

export const toType = (type, wrap) => map(({rest}) => ({type, ...rest}))

export const unwrap = property => map(({[property]: value}) => value)

export const wrap = property => map(value => ({[property]: value}))

export const ifMatch = matcher => x$ =>
  flow(withLatestFrom(x$), filter(([a, x]) => matcher(a, x)), map(([a]) => a))
