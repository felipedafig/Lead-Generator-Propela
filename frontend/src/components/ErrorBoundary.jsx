import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace' }}>
          <h2 style={{ color: '#b00' }}>Something broke while rendering.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/login' }}
            style={{ padding: '8px 16px', marginTop: 12 }}
          >
            Go to Login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
