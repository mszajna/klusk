import {Observable} from 'rxjs'

export const merge = (...ts) => x$ => Observable.merge(...ts.map(t => t(x$)))

export const log = transform => data$ => {
  data$.subscribe(data => console.log('received', data))
  const transformed$ = transform(data$)
  transformed$.subscribe(data => console.log('sent', data))
  return transformed$
}
