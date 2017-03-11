import React from 'react'
import ace from 'brace'

export const aceEditor = applyProps =>
  React.createClass({
    displayName: 'AceEditor',

    render () {
      return <div ref={el => { this.editor = ace.edit(el); applyProps(this.editor, this.props) }} />
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

export const applyProps = (editor, {className, session}) => {
  editor.setStyle(className) // TODO: this actually ads that style, if className is modified it won't work
  editor.setSession(session)
}

export const AceEditor = aceEditor(applyProps)
