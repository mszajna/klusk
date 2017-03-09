import {Observable} from 'rxjs'
import ace from 'brace'

export const fileContents = data$ => data$
  .filter(({type}) => type === 'file/content')

export const fileOverriden = data$ => data$
  .filter(({type}) => type === 'file/overriden')

export const openDocument = (editor, path) => data$ => {
  const editSession = ace.createEditSession('', 'ace/mode/javascript')
  const document = editSession.getDocument()
  document.path = path
  editor.setSession(editSession)

  fileContents(data$)
    .filter(({path: _path}) => _path === path)
    .subscribe(({content}) => document.setValue(content))

  const reopenOnOverride$ = fileOverriden(data$)
    .filter(({path: _path}) => _path === path)
    .map(({path}) => ({type: 'file/open', path}))

  return Observable.of({type: 'file/open', path: '.'}, {type: 'file/open', path}).merge(reopenOnOverride$)
}

export const addCommand = (editor, name, bindKey) => {
  editor.commands.addCommand({name, bindKey, exec: () => {}})
  return Observable.fromEvent(editor.commands, 'exec')
    .filter(({command: {name: _name}}) => name === _name)
}

export const saveCurrentDocument = editor => () =>
  addCommand(editor, 'save', {win: 'Ctrl-s', mac: 'Command-s'})
    .map(({editor}) => editor.getSession().getDocument())
    .map(document => ({type: 'file/save', path: document.path, content: document.getValue()}))
