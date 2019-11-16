import React from 'react';
import NeatStuff from './NeatStuff'
import './css/syntax.css';

let Muh = {
  keywords: [
    'if', 'for', 'var', 'let', 'const',
    'while', 'function', 'switch', 'case',
    'return'
  ]
}

// Return formatted code stuff I think
// Checking for [code] tag performed in parent component
class ACodeParser extends React.Component {
  constructor(props) {
    super(props);
    //this.state = { code: props.code.split(" ") }

    this.tempObj = [];
    this.formatToJSX = this.formatToJSX.bind(this);
    this.aNiceJSXObject = this.aNiceJSXObject.bind(this);
  }

  // Give us a clean array of JSX objects
  unfckObj(inputObj) {
    for (let i = 0; i < inputObj.length; i++) {
      inputObj[i].length > 1 ? this.unfckObj(inputObj[i]) : (this.tempObj.push(inputObj[i]));
    }
  }

  // Return a proper array of JSX objects with spaces replinished
  // Meant to undo the horror I wrought upon the innocent code string
  restoreSpace(codeStr) {
    let arr = codeStr.split("");

    let arrMap = [];
    let char;
    let aSpace = () => <div className="space">-</div>;

    // Init with buffer?
    let output = [];

    // Create binary map
    // This isn't necessary 
    for (let i = 0; i < arr.length; i++) {
      arr[i].match(/\s/) ? arrMap.push(0) : arrMap.push(1);
    }

    // No
    for (let i = 0; i < arrMap.length; i++) {
      (arrMap[i] === 0) ? output.push(aSpace()) : output.push(this.tempObj[i]);
    }

    return output;
  }

  // Takes token/keyword etc. and adds necesssary markup
  addTag(token, type = undefined, word) {
    if (!token) {
      switch (type) {
        case "if":
          return <syn className="if">{word}</syn>;
        case "func":
          return <syn className="func">{word}</syn>;
        default:
          return <syn className="default">{word}</syn>;
      }
    } else {
      switch (token) {
        case "semic":
          return <syn className="semic">;</syn>;
        case "lparen":
          return <syn className="paren">(</syn>;
        case "rparen":
          return <syn className="paren">)</syn>;
        case "lbrack":
          return <syn className="brack">{"{"}</syn>;
        case "rbrack":
          return <syn className="brack">{"}"}</syn>;
        case "dquote":
          return <syn className="dquote">{'"'}</syn>;
        case "squote":
          return <syn className="squote">{"'"}</syn>;
        case "dot":
          return <syn className="dot">.</syn>;
        case "lsq":
          return <syn className="sq">{"\["}</syn>;
        case "rsq":
          return <syn className="sq">{"\]"}</syn>;
      }
    }
  }

  // The TRUE AND HONEST matching function
  formatToJSX(code) {
    let codeArr = code.split(" ");
    let temp;
    let word;
    let symbols;
    let keyfound;
    let spaces = 0;

    // JSX objects pushed to here in order
    let output = [];

    for (let i = 0; i < codeArr.length; i++) {
      // Matches isolated words
      if (codeArr[i].match(/^[^\W]\w*[^\W]*$/)) {
        keyfound = false;
        word = codeArr[i];

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

        // output.push(" ");
        // Matches words preceding symbols
      } else if (
        codeArr[i].match(/^\w*(?=\W)/) != "" &&
        codeArr[i].match(/^\w*(?=\W)/) != null
      ) {
        word = codeArr[i].match(/^\w*/)[0];
        output.push(this.addTag(false, "func", word));
        codeArr[i] = codeArr[i].replace(/^\w*/, "");
        output.push(this.formatToJSX(codeArr[i]));

        // Matches symbols
      } else if (codeArr[i].match(/^\W/)) {
        // Multiple symbols
        // Decompose and send back
        if (codeArr[i].match(/^\W{2,}/)) {
          symbols = codeArr[i]
            .match(/^\W{2,}/)[0]
            .split("")
            .join(" ");
          codeArr[i] = codeArr[i].replace(/^\W{2,}/, "");
          symbols = symbols + " " + codeArr[i];
          output.push(this.formatToJSX(symbols));

          // Decompose
        } else {
          // Single symbols followed by alphanumeric character
          if (codeArr[i].match(/^\W(?=\w)/)) {
            temp = codeArr[i].match(/^\W/)[0];
            codeArr[i] = codeArr[i].replace(/^\W/, "");
            temp = temp + " " + codeArr[i];
            output.push(this.formatToJSX(temp));

            // Singleton symbols processed here
            // Assign a JSX object to each non-alphanumeric symbol
          } else {
            switch (codeArr[i]) {
              case ";":
                output.push(this.addTag("semic"));
                break;
              case "(":
                output.push(this.addTag("lparen"));
                break;
              case ")":
                output.push(this.addTag("rparen"));
                break;
              case "{":
                output.push(this.addTag("lbrack"));
                break;
              case "}":
                output.push(this.addTag("rbrack"));
              case ".":
                output.push(this.addTag("dot"));
              case "\[":
                output.push(this.addTag('lsq'));
              case "\]":
                output.push(this.addTag('rsq'));
              default:
                // currently changes everything to semicolons, correct this later
                output.push(this.addTag("semic"));
                break;
            }
          }
        }
      }
      spaces++;
      //output.push(" ");
    }

    //console.log(spaces);
    return output;
  }

  aNiceJSXObject(someCode) {
    let theObj;
    this.unfckObj(this.formatToJSX(someCode));
    theObj = this.restoreSpace(someCode);
    return theObj;
  }

  render() {
    let someCode =
      `temp = codeArr[i].match(/^\W/)[0];` +
      `codeArr[i] = codeArr[i].replace(/^\W/, "");` +
      `temp = temp + " " + codeArr[i];` +
      `output.push(this.formatToJSX(temp))`;

    return (
      <div className="theCode">
        {this.aNiceJSXObject(someCode)} <br></br>
        <NeatStuff />
      </div>
    );
  }
}

export default ACodeParser;