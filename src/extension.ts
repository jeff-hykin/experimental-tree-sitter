import * as vscode from 'vscode';
import * as Parser from 'web-tree-sitter';
import * as jsonc from 'jsonc-parser';
import { clearTimeout } from 'timers';
import { readFileSync } from 'fs';

// dirs
const dirOfParsers = '../language-parsers';
const dirOfGrammars = __dirname + "/../language-grammars/";

// misc
let treeSitterWasAwaited = false
// Syntax trees
let trees: { [doc: string]: Parser.Tree } = {};

// Languages
const supportedLangs: string[] = ["cpp", "c", "python"];
const grammars: { [lang: string]: Grammar } = {};

// Term colors
const supportedTerms: string[] = [
    "type", "namespace", "function", "variable", "string", "number",
    "punctuation", "comment", "keyword_constant", "keyword_directive",
    "keyword_control", "keyword_operator", "storage_modifier",
]

// Grammar class
class Grammar {
    // Parser
    readonly lang: string;
    parser: Parser;
    languageObj: any;
    // Grammar
    readonly simpleTerms: { [sym: string]: string } = {};
    readonly complexTerms: string[] = [];
    readonly complexScopes: { [sym: string]: string } = {};

    constructor(lang: string) {
        // Parser
        this.lang = lang;

        // Grammar
        const grammarPath = dirOfGrammars + this.lang + ".json";
        const grammarJson = jsonc.parse(readFileSync(grammarPath).toString());
        for (const t in grammarJson.simpleTerms)
            this.simpleTerms[t] = grammarJson.simpleTerms[t];
        for (const t in grammarJson.complexTerms)
            this.complexTerms[t] = grammarJson.complexTerms[t];
        for (const t in grammarJson.complexScopes)
            this.complexScopes[t] = grammarJson.complexScopes[t];
    }
    
    async init() {
        if (!treeSitterWasAwaited) {
            await Parser.init();
        }
        this.parser = new Parser();
        this.languageObj = await Parser.Language.load(`${dirOfParsers}/${this.lang}.wasm`);
        this.parser.setLanguage(this.languageObj);
    }
}

// Extension activation
export async function activate(context: vscode.ExtensionContext) {

    // Decoration definitions
    const highlightDecors: { [color: string]: vscode.TextEditorDecorationType } = {};
    for (const c of supportedTerms)
        highlightDecors[c] = vscode.window.
            createTextEditorDecorationType({
                color: new vscode.ThemeColor("syntax." + c)
            });
    // Decoration cache
    const decorCache: { [doc: string]: { [color: string]: vscode.Range[] } } = {};

    // Timer to schedule decoration update and refresh
    let updateTimer: NodeJS.Timer | undefined = undefined;
    let refreshTimer: NodeJS.Timer | undefined = undefined;
    console.log('Syntax Highlighter has been activated');

    let visibleEditors = vscode.window.visibleTextEditors;
    let visibleUris: string[] = [];
    let refreshUris: string[] = [];

    function refreshDecor() {
        for (const eachEditor of visibleEditors)
        {
            const uri = eachEditor.document.uri.toString();
            if (!refreshUris.includes(uri))
                continue;
            if (!(uri in decorCache))
                continue;
            const decorations = decorCache[uri];
            for (const eachTerm in decorations)
                eachEditor.setDecorations(highlightDecors[eachTerm], decorations[eachTerm]);
        }
        refreshUris = [];
     }

    function enqueueDecorRefresh() {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = undefined;
        }
        refreshTimer = setTimeout(refreshDecor, 20);
    }

    function buildDecor(doc: vscode.TextDocument) {
        const uri = doc.uri.toString();
        if (!(uri in trees))
            return;
        const grammar = grammars[doc.languageId];

        // Decorations
        let decorations: { [color: string]: vscode.Range[] } = {};
        for (const eachTerm in highlightDecors)
            decorations[eachTerm] = [];

        // Travel tree and make decorations
        let stack: Parser.SyntaxNode[] = [];
        let node = trees[uri].rootNode.firstChild;
        while (stack.length > 0 || node) {
            // Go deeper
            if (node) {
                stack.push(node);
                node = node.firstChild;
            }
            // Go back
            else {
                node = stack.pop();
                let type = node.type;
                if (!node.isNamed)
                    type = '"' + type + '"';

                // Simple one-level terms
                let color: string | undefined = undefined;
                if (!grammar.complexTerms.includes(type)) {
                    color = grammar.simpleTerms[type];
                }
                // Complex terms require multi-level analyzes
                else {
                    // Build complex scopes
                    let desc = type;
                    let scopes = [desc];
                    let parent = node.parent;
                    for (let i = 0; i < 2; i++ && parent) {
                        let parentType = parent.type;
                        if (!parent.isNamed)
                            parentType = '"' + parentType + '"';
                        desc = parentType + " > " + desc;
                        scopes.push(desc);
                        parent = parent.parent;
                    }
                    // Use most complex scope
                    for (let d of scopes)
                        if (d in grammar.complexScopes)
                            color = grammar.complexScopes[d];
                }

                // If term is found add decoration
                if (color in highlightDecors) {
                    decorations[color].push(new vscode.Range(
                        new vscode.Position(
                            node.startPosition.row,
                            node.startPosition.column),
                        new vscode.Position(
                            node.endPosition.row,
                            node.endPosition.column)));
                }

                // Go right
                node = node.nextSibling
            }
        }

        // Cache and refresh decorations
        decorCache[uri] = decorations;
        if (!refreshUris.includes(uri))
            refreshUris.push(uri);
    }

    function updateDecor() {
        for (const eachEditor of visibleEditors) {
            const uri = eachEditor.document.uri.toString();
            if (!(uri in trees))
                continue;
            if (uri in decorCache)
                continue;
            buildDecor(eachEditor.document);
        }
        if (refreshUris.length > 0)
            enqueueDecorRefresh();
    }

    function enqueueDecorUpdate() {
        if (updateTimer) {
            clearTimeout(updateTimer);
            updateTimer = undefined;
        }
        updateTimer = setTimeout(updateDecor, 20);
    }

    async function initTree(doc: vscode.TextDocument) {
        const lang = doc.languageId;
        // if the language isn't supported, then do nothing
        if (!supportedLangs.includes(lang))
            return;
        // if the grammar doesn't exist then create it
        if (!(lang in grammars)) {
            grammars[lang] = new Grammar(lang);
            await grammars[lang].init()
        }
        const uri = doc.uri.toString();
        trees[uri] = grammars[lang].parser.parse(doc.getText());
    }

    function updateTree(doc: vscode.TextDocument, edits: Parser.Edit[]) {
        const uri = doc.uri.toString();
        const lang = doc.languageId;
        if (!(uri in trees))
            return;

        // Update tree
        for (const e of edits)
            trees[uri].edit(e);
        trees[uri] = grammars[lang].parser.parse(doc.getText(), trees[uri])

        // Invalidate decoration cache and enqueue update
        delete decorCache[uri];
        if (visibleUris.includes(uri))
            enqueueDecorUpdate();
    }

    for (const doc of vscode.workspace.textDocuments)
        await initTree(doc);
    enqueueDecorUpdate();

    vscode.workspace.onDidOpenTextDocument(async doc => {
        await initTree(doc);
    }, null, context.subscriptions)

    vscode.workspace.onDidCloseTextDocument(doc => {
        const uri = doc.uri.toString();
        delete trees[uri];
        delete decorCache[uri];
        if (refreshUris.includes(uri))
            refreshUris.splice(refreshUris.indexOf(uri), 1);
    }, null, context.subscriptions)

    vscode.workspace.onDidChangeTextDocument(event => {
        const uri = event.document.uri.toString();
        if (!(uri in trees))
            return;
        if (event.contentChanges.length < 1)
            return;

        let changes: Parser.Edit[] = [];
        for (const c of event.contentChanges) {
            const startPos0 = c.range.start;
            const startIndex0 = event.document.offsetAt(startPos0);
            const endPos0 = c.range.end;
            const endIndex0 = startIndex0 + c.rangeLength;
            const endIndex1 = startIndex0 + c.text.length;
            const endPos1 = event.document.positionAt(endIndex1);

            changes.push({
                startIndex: startIndex0,
                oldEndIndex: endIndex0,
                newEndIndex: endIndex1,
                startPosition: { row: startPos0.line, column: startPos0.character },
                oldEndPosition: { row: endPos0.line, column: endPos0.character },
                newEndPosition: { row: endPos1.line, column: endPos1.character }
            });
        }

        updateTree(event.document, changes);
    }, null, context.subscriptions);

    vscode.window.onDidChangeVisibleTextEditors(editors => {
        // Flag refresh for new editors
        let needUpdate = false;
        for (const e of editors) {
            const uri = e.document.uri.toString();
            if (visibleEditors.includes(e))
                continue;
            if (!refreshUris.includes(uri))
                refreshUris.push(uri);
            if (uri in trees)
                needUpdate = true;
        }

        // Set visible editors
        visibleEditors = editors;
        visibleUris = [];
        for (const e of visibleEditors) {
            const uri = e.document.uri.toString();
            if (!visibleUris.includes(uri))
                visibleUris.push(uri);
        }

        // Enqueue refresh if required
        if (needUpdate)
            enqueueDecorUpdate();
    }, null, context.subscriptions);

}
