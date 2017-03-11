import React from 'react'
import ace from 'brace'

export const aceEditor = applyProps =>
  React.createClass({
    displayName: 'AceEditor',

    render () {
      return <div className={this.props.className}>
        <div ref={el => { this.editor = ace.edit(el); applyProps(this.editor, this.props) }} />
      </div>
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

export const applyProps = (editor, {session}) => {
  // editor.setStyle(className) // TODO: this actually ads that style, if className is modified it won't work
  if (session) {
    editor.setSession(session)
  }
}

export const AceEditor = aceEditor(applyProps)
