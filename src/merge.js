import {Observable} from 'rxjs'

export default (...ts) => x$ => Observable.merge(...ts.map(t => t(x$)))
