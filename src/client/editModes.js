import 'brace/mode/jsx'
import 'brace/mode/json'
import 'brace/mode/css'
import 'brace/mode/html'
import 'brace/mode/markdown'
import 'brace/mode/yaml'
import 'brace/mode/golang'
import 'brace/mode/clojure'
import 'brace/mode/java'
import 'brace/mode/xml'

export default filename => {
  const [,, ext] = filename.match(/(\.([^.]+))?$/)
  switch (ext) {
    case 'js': return 'ace/mode/jsx'
    case 'json': return 'ace/mode/json'
    case 'css': return 'ace/mode/css'
    case 'html': return 'ace/mode/html'
    case 'md': return 'ace/mode/markdown'
    case 'yml': return 'ace/mode/yaml'
    case 'go': return 'ace/mode/golang'
    case 'boot':
    case 'clj': return 'ace/mode/clojure'
    case 'java': return 'ace/mode/java'
    case 'xml': return 'ace/mode/xml'
    default: return 'ace/mode/text'
  }
}
