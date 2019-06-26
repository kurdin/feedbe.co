import Component from 'inferno-component';

class ClipboardArea extends Component {
  componentDidMount () {
    const button = this.button
    const area = this.area
 
    const Clipboard = this.props.clipboard

    this.clipboard = new Clipboard(
      button, {
        target: () => area
      }
    )
  }
  
  componentWillUnmount() {
    this.props.clipboard.destroy()
  }

  render () {
    const {
      value
    } = this.props

    return (
      <div>
        <textarea
          ref={ ref => this.area = ref }
          value={value}
          readOnly
        />
        <button
          ref={ ref => this.button = ref }
        > Copy
        </button>
      </div>
    )
  }
}

//  <ClipboardArea
//    clipboard={Clipboard}
//    value={'I will be copyed in your clipboard'}
//  />


export default ClipboardArea;