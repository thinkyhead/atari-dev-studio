"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class OutlineBase {
    constructor(id) {
        this.Id = id;
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Complete registration
            vscode.languages.registerDocumentSymbolProvider(this.Id, this);
        });
    }
    // Used for both 7800basic and batariBasic
    provideDocumentSymbols(document, token) {
        // prepare
        let symbols = [];
        let containers = [];
        let isWithinMethod = false;
        let isWithinData = false;
        let isWithinAsm = false;
        let prevLine;
        // Scan
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // get
            let line = document.lineAt(lineIndex);
            // extend container range
            containers.forEach(container => {
                // note: for this work correctly set the range we need to set the range to the 
                // previous row not the current one
                container.range = new vscode.Range(container.selectionRange.start, prevLine.range.end);
            });
            // store (for expanding container)
            prevLine = line;
            // validation
            if (line.isEmptyOrWhitespace) {
                continue;
            }
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex)
                .replace('\t', ' ');
            // get keywords
            let keywords = lineText.split(' ');
            if (keywords.length < 0) {
                continue;
            }
            // get first keyword
            let firstKeyword = keywords[0].toLowerCase();
            // validation - rem
            if (firstKeyword.startsWith(';') || firstKeyword.startsWith('rem') || firstKeyword.startsWith('/*') || firstKeyword.startsWith('*/')) {
                continue;
            }
            // prepare
            let symbolKind = undefined;
            let isContainer = false;
            let symbolName = '';
            let symbolDetail = '';
            // Symbols
            switch (firstKeyword) {
                case 'bank':
                    // initialise
                    symbolKind = vscode.SymbolKind.Class;
                    isContainer = true;
                    isWithinMethod = false;
                    isWithinData = false;
                    isWithinAsm = false;
                    // Get name (append bank number)
                    symbolName = firstKeyword;
                    if (keywords[0].length > 1) {
                        symbolName += ` ${keywords[1]}`;
                    }
                    // Reset container to root
                    while (containers.length > 0) {
                        containers.pop();
                    }
                    break;
                case 'dim':
                    // enable this to show variables
                    //symbolName = keywords[1];
                    //symbolKind = vscode.SymbolKind.Variable;
                    //isContainer = false;
                    break;
                case 'const':
                    // enable this to show consts
                    //symbolName = keywords[1];
                    //symbolKind = vscode.SymbolKind.Constant;
                    //isContainer = false;
                    break;
                case 'data':
                case 'sdata':
                case 'alphadata':
                case 'songdata':
                case 'speechdata':
                    isWithinData = true;
                    break;
                case 'end':
                    if (isWithinData) {
                        isWithinData = false;
                    }
                    if (isWithinAsm) {
                        isWithinAsm = false;
                    }
                    break;
                case 'asm':
                    isWithinAsm = true;
                    break;
                case 'return':
                    // do nothing for now
                    break;
                case 'dmahole':
                    break;
                default:
                    // validate
                    // anything indented at this point does not get processed
                    if (line.text.startsWith(' ')) {
                        continue;
                    }
                    // is within data or asm? if so skip
                    if (isWithinData || isWithinAsm) {
                        continue;
                    }
                    // prepare
                    let isSubMethod = firstKeyword.startsWith('_');
                    isContainer = !isSubMethod;
                    symbolName = keywords[0];
                    // method or sub-function within method)
                    symbolKind = (isSubMethod ? vscode.SymbolKind.Field : vscode.SymbolKind.Method);
                    if (isSubMethod) {
                        symbolDetail = '(sub)';
                    }
                    // are we already is a method (and not a sub-method)
                    if (isContainer && isWithinMethod) {
                        containers.pop();
                    }
                    // set
                    isWithinMethod = true;
                    isWithinData = false;
                    isWithinAsm = false;
                    break;
            }
            // anything to add?
            if (symbolKind) {
                // initialise
                let symbol = new vscode.DocumentSymbol(symbolName, symbolDetail, symbolKind, line.range, line.range);
                // add to store
                if (containers.length > 0) {
                    // child
                    containers[containers.length - 1].children.push(symbol);
                }
                else {
                    // parent
                    symbols.push(symbol);
                }
                // is this a container?
                if (isContainer) {
                    containers.push(symbol);
                }
            }
        }
        // return result
        return symbols;
    }
}
exports.OutlineBase = OutlineBase;
//# sourceMappingURL=outlineBase.js.map