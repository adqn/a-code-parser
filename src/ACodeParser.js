import React from 'react';
import NeatStuff from './NeatStuff'
import './css/syntax.css';

const Muh = {
  keywords: [
    'if',
    'else',
    'for',
    'var',
    'let',
    'const',   
    'while',
    'function',
    'switch',
    'case',
    'return',
  ]
}

// Return formatted code stuff I think
// Checking for [code] tag performed in parent component
class ACodeParser extends React.Component {
  constructor(props) {
    super(props);
    //this.state = { code: props.code.split(" ") }

    this.tempObj = [];
    this.theObj = [];
    this.formatToJSX = this.formatToJSX.bind(this);
    this.aNiceJSXArray = this.aNiceJSXArray.bind(this);
  }

  // Give us a clean array of JSX objects
  unfckObj(inputObj) {
    for (let i = 0; i < inputObj.length; i++) {
      inputObj[i].length > 1 ? this.unfckObj(inputObj[i]) :
        (this.tempObj.push(inputObj[i]));
    }
  }

  // Return a proper array of JSX objects with spaces replinished
  // Meant to undo the horror I wrought upon the innocent code string
  // This is pretty terrible itself though
  restoreSpace(inputObj = false) {
    let output = [];
    let tempObj
    inputObj ? tempObj = inputObj : tempObj = this.tempObj;

    let aSpace = () => <syn className="space">{" "}</syn>;

    for (let i = 0; i < inputObj.length; i++) {
      if (inputObj[i].props != undefined) {
        // Not necessarily functions, just objects of the form "^[word][symbols]$"
        inputObj[i].props.className === "func" ? output.push(inputObj[i]) :
          output.push(inputObj[i], aSpace())
      } else {
        output.push(inputObj[i], aSpace());
      }  
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
        case "comm":
          return <syn className="comm">{word}</syn>;
        default:
          return <syn className="default">{word}</syn>;
      }
    } else {
      switch (token) {
        case "comm":
          return <syn className="comm">//</syn>;
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
          return <syn className="sq">[</syn>;
        case "rsq":
          return <syn className="sq">]</syn>;
        case "eq":
          return <syn className="eq">=</syn>;
        case "plus":
          return <syn className="plus">+</syn>;
      }
    }
  }

  // The TRUE AND HONEST matching function
  formatToJSX(code) {
    let codeArr;
    let temp;
    let word;
    let symbols;
    let keyfound;
    let commentFound = false;

    let aTab = () => <syn className="space">{"  "}</syn>;
    
    // lol
    code = code.split(" ")
    for (let i = 0; i < code.length; i++) {
      if (code[i].match(/\\/g)) {
        code[i] = code[i].replace(/\\/g, 'w$&');
      }
    }
    codeArr = code;

    // JSX objects pushed to here in order
    let output = [];
    
    for (let i = 0; i < codeArr.length; i++) {
      // Handle tabs
      if (codeArr[i] === "") {
        output.push(aTab());
      } else {
        // Handle newlines, also terminate comment on newline, obviously
        if (codeArr[i].match(/[^\S]*\n$/)) {
          codeArr[i] = codeArr[i].replace(/[^\S]*\n$/, "");
          commentFound ? output.push(this.addTag(false, "comm", codeArr[i])) :
            output.push(this.formatToJSX(codeArr[i]));
          output.push(<br></br>);
          commentFound = false;
        // Handle just \n lol
        } else if (codeArr[i].match(/[^\S]*\n[^\S]*/)) {
          codeArr[i] = codeArr[i].replace(/[^\S]*\n[^\S]*/, "$N");
          output.push(this.formatToJSX(codeArr[i]));
        }
        // It does this while commentFound <-
        else if (commentFound) {
          output.push(this.addTag(false, "comm", codeArr[i]));
        }
        // It flips commentFound if it found this <-
        else if (codeArr[i].match(/^\/{2,}/)) {
          commentFound = true;
          output.push(this.addTag(false, 'comm', codeArr[i]));
        } else {
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
                // I am going to break this entire class trying to catch the backslashes
                if (codeArr[i].match(/\\/)) {
                  output.push(this.addTag(false, 'default', "w"));
                }
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
                    break;
                  case ".":
                    output.push(this.addTag("dot"));
                    break;
                  case "[":
                    output.push(this.addTag('lsq'));
                    break;
                  case "]":
                    output.push(this.addTag('rsq'));
                    break;
                  case "=":
                    output.push(this.addTag('eq'));
                    break;
                  case "+":
                    output.push(this.addTag('plus'));
                    break;
                  case "'":
                    output.push(this.addTag('squote'));
                    break;
                  case '"':
                    output.push(this.addTag('dquote'));
                    break;
                  case "\\\\":
                    output.push(this.addTag(false, "default", "w"))
                    break;
                  default:
                    output.push(this.addTag(false, "default", codeArr[i]));
                    break;
                }
              }
            }
          }
        }
      }
    }

    //console.log(spaces);
    return output;
  }

  aNiceJSXArray(someCode) {
    let theObj;
    let another;
    another = this.formatToJSX(someCode);
    theObj = this.restoreSpace(another);
    this.theObj = theObj;
    //return this.tempObj;
  }

  render() {
    // Pretty much all prints except tabs and "\n" 
    let someCode =
      `for (let i = 0; i < codeArr.length; i++) {
        // Handle tabs
        if (codeArr[i] === "") {
          output.push(aSpace());
        } else {
          // Handle newlines, also terminate comment on newline, obviously
          if (codeArr[i].match(/[^\S]*\n$/)) {
            codeArr[i] = codeArr[i].replace(/[^\S]*\n$/, "");
            commentFound ? output.push(this.addTag(false, "comm", codeArr[i])) :
              output.push(this.formatToJSX(codeArr[i]));
            output.push(<br></br>);
            commentFound = false;
          }
          // It does this while commentFound <-
          else if (commentFound) {
            output.push(this.addTag(false, "comm", codeArr[i]));
          }
          // It flips commentFound if it found this <-
          else if (codeArr[i].match(/^\/{2,}/)) {
            commentFound = true;
            output.push(this.addTag(false, 'comm', codeArr[i]));
          } else {
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
  
              //output.push(" ");
              // Matches words preceding symbols
            } else if (
              codeArr[i].match(/^\w*(?=\W)/) != "" &&
              codeArr[i].match(/^\w*(?=\W)/) != null
            ) {
              word = codeArr[i].match(/^\w*/)[0];
              output.push(this.addTag(false, "func", word));
              codeArr[i] = codeArr[i].replace(/^\w*/, "");
              output.push(this.formatToJSX(codeArr[i]));
  `

    return (
      <div>
        <div className="theCode">
          {this.aNiceJSXArray(someCode)}
          {this.theObj}
        </div>
      </div>
    );
  }
}

export default ACodeParser;