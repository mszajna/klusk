import React from 'react'
import createReactClass from 'create-react-class'
import ace from 'brace'
import 'brace/ext/language_tools.js'
import 'brace/ext/searchbox'

ace.acequire('ace/ext/language_tools')

export const aceEditor = (createEditor, applyProps) =>
  createReactClass({
    displayName: 'AceEditor',

    render () {
      return <div ref={el => { this.editor = createEditor(el); applyProps(this.editor, this.props) }} />
    },

    componentWillReceiveProps (nextProps) {
      applyProps(this.editor, nextProps)
    },

    shouldComponentUpdate () {
      return false
    },

    componentWillUnmount () {
      this.editor.destroy()
      this.editor = null
    }
  })

export const createEditor = el => {
  const editor = ace.edit(el)
  editor.$blockScrolling = Infinity

  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true
  })

  editor.commands.addCommand({
    name: 'save',
    bindKey: {win: 'Ctrl-s', mac: 'Command-s'},
    exec: () => {
      editor.runOnSave()
    }
  })
  return editor
}

export const applyProps = (editor, {session, onSave}) => {
  editor.setSession(session)
  editor.focus()
  editor.runOnSave = () => onSave ? onSave() : undefined
}

export const AceEditor = aceEditor(createEditor, applyProps)
