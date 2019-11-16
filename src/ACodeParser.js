import React from 'react';
import './css/syntax.css';

let Muh = {
  keywords: [
    'if', 'for', 'var', 'let', 'const',
    'while', 'function', 'switch', 'case',
    'return'
  ]
}

// Parse [code] tag and return formatted code stuff I think
class ACodeParser extends React.Component {
  constructor(props) {
    super(props); 
   //this.state = { code: props.code.split(" ") }
    this.formatToJSX = this.formatToJSX.bind(this);
  }

  // Takes token/keyword etc. and adds necesssary markup
  addTag(token, type = undefined, word) {
    if (!token) {
      switch (type) {
        case 'if':
          return <syn className="if">{word}</syn>
        case 'func':
          return <syn className="func">{word}</syn>
        default:
          return <syn className="default">{word}</syn>
      }
    } else {
      switch (token) {
        case 'semic':
          return <syn className="semic">;</syn>;
        case 'lparen':
          return <syn className="paren">(</syn>;
        case 'rparen':
          return <syn className="paren">)</syn>;
        case 'lbrack':
          return <syn className="brack">{'{'}</syn>;
        case 'rbrack':
          return <syn className="brack">{'}'}</syn>
        case 'dquote':
          return <syn className="dquote">"</syn>;
        case 'squote':
          return <syn className="squote">'</syn>;
      }
    }
  }

  // The TRUE AND HONEST matching function
  formatToJSX(code) {    
    let codeArray = code.split(" ");
    let temp;
    let word;
    let symbols;
    let keyfound;
    let spaces = 0;

    // JSX objects pushed to here in order
    let output = [];

    for (let i = 0; i < codeArray.length; i++) {

      // Matches isolated words
      if (codeArray[i].match(/^[^\W]\w*[^\W]*$/)) {
        keyfound = false;
        word = codeArray[i];

        // Assign <syn> tag depending on keyword, var name, etc.
        for (let j = 0; j < Muh.keywords.length; j++) {
          if (word === Muh.keywords[j]) {
            // temporarily give all keywords "if" tag
            keyfound = true;
            output.push(this.addTag(false, "if", word));
          }      
        }
        // not a keyword
        if (!keyfound) {
          output.push(this.addTag(false, "variable", word));
        }

        output.push(" ");
      // Matches words preceding symbols
      } else if (codeArray[i].match(/^\w*(?=\W)/) != "" && codeArray[i].match(/^\w*(?=\W)/) != null) {
        word = codeArray[i].match(/^\w*/)[0];
        output.push(this.addTag(false, "func", word));
        codeArray[i] = codeArray[i].replace(/^\w*/, "");
        output.push(this.formatToJSX(codeArray[i]));

        // Matches symbols 
      } else if (codeArray[i].match(/^\W/)) {
        // Multiple symbols
        // Decompose and send back
        if (codeArray[i].match(/^\W{2,}/)) {
          symbols = codeArray[i].match(/^\W{2,}/)[0].split("").join(" ");
          codeArray[i] = codeArray[i].replace(/^\W{2,}/, "");
          symbols = symbols + " " + codeArray[i];
          output.push(this.formatToJSX(symbols));
            
        // Decompose
        } else {
          // Single symbols followed by alphanumeric character
          if (codeArray[i].match(/^\W(?=\w)/)) {
            temp = codeArray[i].match(/^\W/)[0];
            codeArray[i] = codeArray[i].replace(/^\W/, "");
            temp = temp + " " + codeArray[i];
            output.push(this.formatToJSX(temp))
          
          // Singleton symbols processed here
          // Assign a JSX object to each non-alphanumeric symbol
          } else {
            switch (codeArray[i]) {
              case ';':
                output.push(this.addTag('semic'));
                break;
              case '(':
                output.push(this.addTag('lparen'));
                break;
              case ')':
                output.push(this.addTag('rparen'));
                break;
              case '{':
                output.push(this.addTag('lbrack'));
                break;
              case '}':
                output.push(this.addTag('rbrack'));
                break;
              default:
                // currently changes everything to semicolons, correct this later
                output.push(this.addTag('semic'));
                break;
            }
          }
        }
      }
      spaces++;
    }

    //console.log(spaces);
    return output;
  }

  render() {
    let someCode = `temp = codeArray[i].match(/^\W/)[0];` +
    `codeArray[i] = codeArray[i].replace(/^\W/, "");` +
    `temp = temp + " " + codeArray[i];` +
      `output.push(this.formatToJSX(temp))`
    
    return (
      <div className="theCode">
        {this.formatToJSX(someCode)} <br></br>
      </div>
    );
  }
}

export default ACodeParser;