import React from 'react';
import ACodeParser from './ACodeParser'
import './css/document.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <div>
        <InputForm />
      </div>
    );
  }
}

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formCode: '',
      inputCode: '',
    }

    this.handleCode = this.handleCode.bind(this);
    this.passCode = this.passCode.bind(this);
  }

  // Takes tabs and whatever
  formatCode() {
    let f = this.state.formCode.split(" ");
    //f = f.replace(/\s{2,}/g, "\t")
    
    for (let i = 0; i < f.length; i++) {
      if (f[i] === "") {
        f[i] = "\t";
      }

      if (f[i].match(/[^\S]*\n+/)) {
        f[i] = f[i].replace(/\n/g, " \n ");
      }
    }
    return f.join(" ");
  }

  handleCode(event) {
    this.setState({ formCode: event.target.value });
  }

  passCode() {
    let f = this.formatCode();
    this.setState({inputCode: f})
  }
  
  render() {
    const { inputCode, formCode } = this.state;
    const { handleCode, passCode } = this;

    return (
      <div>
        <ACodeParser code={inputCode} />
          <div className="InputForm">
            <textarea value={formCode} onChange={handleCode}></textarea>
            <button onClick={passCode}>Parse code</button>
          </div>
      </div>
    );
  }
}

export default App;
