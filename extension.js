Object.defineProperty(exports, "__esModule", { value: true })
const yaml  = require("js-yaml")
const vscode = require("vscode")
const Parser = require("web-tree-sitter")
const jsonc = require("jsonc-parser")
const timers = require("timers")
const fs = require("fs")

Parser.init().then(()=>{

    let info = yaml.safeLoad(fs.readFileSync(__dirname + "/info.yaml", 'utf-8'))

    // dirs
    const dirOfParsers = './language-parsers/'
    const dirOfGrammars = __dirname + "/language-mappings/"
    // misc
    let treeSitterWasAwaited = false
    // Syntax trees
    const supportedLangs = info.supported_languages
    const supportedTerms = info.supported_terms
    const grammars = {}
    const trees = {}

    // Grammar class
    class Grammar {
        constructor(lang) {
            // Grammar
            this.simpleTerms = {}
            this.complexTerms = []
            this.complexScopes = {}
            this.lang = lang
            // Grammar
            const grammarPath = dirOfGrammars + this.lang + ".json"
            const grammarJson = jsonc.parse(fs.readFileSync(grammarPath).toString())
            for (const t in grammarJson.simpleTerms)
                this.simpleTerms[t] = grammarJson.simpleTerms[t]
            for (const t in grammarJson.complexTerms)
                this.complexTerms[t] = grammarJson.complexTerms[t]
            for (const t in grammarJson.complexScopes)
                this.complexScopes[t] = grammarJson.complexScopes[t]
        }
        async init() {
            console.log(`init `)
            console.log(`creating parser`)
            this.parser = new Parser()
            console.log(`awaiting languageObj`)
            this.languageObj = await Parser.Language.load(`/Users/jeffhykin/Nextcloud/Programming/tree-sitter/language-parsers/cpp.wasm`)
            console.log(`setting language`)
            this.parser.setLanguage(this.languageObj)
        }
    }
    // Extension activation
    async function activate(context) {
        console.log(`activate`)
        // Decoration definitions
        const highlightDecors = {}
        for (const c of supportedTerms)
            highlightDecors[c] = vscode.window.createTextEditorDecorationType({
                color: new vscode.ThemeColor("syntax." + c)
            })
        // Decoration cache
        const decorCache = {}
        // Timer to schedule decoration update and refresh
        let updateTimer = undefined
        let refreshTimer = undefined
        console.log('Syntax Highlighter has been activated')
        let visibleEditors = vscode.window.visibleTextEditors
        let visibleUris = []
        let refreshUris = []
        function refreshDecor() {
            console.log(`refreshDecor`)
            for (const eachEditor of visibleEditors) {
                const uri = eachEditor.document.uri.toString()
                if (!refreshUris.includes(uri))
                    continue
                if (!(uri in decorCache))
                    continue
                const decorations = decorCache[uri]
                for (const eachTerm in decorations)
                    eachEditor.setDecorations(highlightDecors[eachTerm], decorations[eachTerm])
            }
            refreshUris = []
        }
        function enqueueDecorRefresh() {
            if (refreshTimer) {
                timers.clearTimeout(refreshTimer)
                refreshTimer = undefined
            }
            refreshTimer = setTimeout(refreshDecor, 20)
        }
        function buildDecor(doc) {
            console.log(`buildDecor`)
            const uri = doc.uri.toString()
            if (!(uri in trees))
                return
            const grammar = grammars[doc.languageId]
            // Decorations
            let decorations = {}
            for (const eachTerm in highlightDecors)
                decorations[eachTerm] = []
            // Travel tree and make decorations
            let stack = []
            let node = trees[uri].rootNode.firstChild
            while (stack.length > 0 || node) {
                // Go deeper
                if (node) {
                    stack.push(node)
                    node = node.firstChild
                }
                // Go back
                else {
                    node = stack.pop()
                    let type = node.type
                    if (!node.isNamed)
                        type = '"' + type + '"'
                    // Simple one-level terms
                    let color = undefined
                    if (!grammar.complexTerms.includes(type)) {
                        color = grammar.simpleTerms[type]
                    }
                    // Complex terms require multi-level analyzes
                    else {
                        // Build complex scopes
                        let desc = type
                        let scopes = [desc]
                        let parent = node.parent
                        for (let i = 0; i < 2; i++ && parent) {
                            let parentType = parent.type
                            if (!parent.isNamed)
                                parentType = '"' + parentType + '"'
                            desc = parentType + " > " + desc
                            scopes.push(desc)
                            parent = parent.parent
                        }
                        // Use most complex scope
                        for (let d of scopes)
                            if (d in grammar.complexScopes)
                                color = grammar.complexScopes[d]
                    }
                    // If term is found add decoration
                    if (color in highlightDecors) {
                        decorations[color].push(new vscode.Range(new vscode.Position(node.startPosition.row, node.startPosition.column), new vscode.Position(node.endPosition.row, node.endPosition.column)))
                    }
                    // Go right
                    node = node.nextSibling
                }
            }
            // Cache and refresh decorations
            decorCache[uri] = decorations
            if (!refreshUris.includes(uri))
                refreshUris.push(uri)
        }
        function updateDecor() {
            console.log(`updateDecor`)
            for (const eachEditor of visibleEditors) {
                const uri = eachEditor.document.uri.toString()
                if (!(uri in trees))
                    continue
                if (uri in decorCache)
                    continue
                buildDecor(eachEditor.document)
            }
            if (refreshUris.length > 0)
                enqueueDecorRefresh()
        }
        function enqueueDecorUpdate() {
            console.log(`enqueueDecorUpdate`)
            if (updateTimer) {
                timers.clearTimeout(updateTimer)
                updateTimer = undefined
            }
            updateTimer = setTimeout(updateDecor, 20)
        }
        async function initTree(doc) {
            console.log(`initTree`)
            const lang = doc.languageId
            // if the language isn't supported, then do nothing
            if (!supportedLangs.includes(lang))
                return
            // if the grammar doesn't exist then create it
            if (!(lang in grammars)) {
                grammars[lang] = new Grammar(lang)
                await grammars[lang].init()
            }
            const uri = doc.uri.toString()
            trees[uri] = grammars[lang].parser.parse(doc.getText())
            console.log(`end initTree`)
        }
        function updateTree(doc, edits) {
            console.log(`updateTree`)
            const uri = doc.uri.toString()
            const lang = doc.languageId
            if (!(uri in trees))
                return
            // Update tree
            for (const e of edits)
                trees[uri].edit(e)
            trees[uri] = grammars[lang].parser.parse(doc.getText(), trees[uri])
            // Invalidate decoration cache and enqueue update
            delete decorCache[uri]
            if (visibleUris.includes(uri))
                enqueueDecorUpdate()
        }
        for (const doc of vscode.workspace.textDocuments)
            await initTree(doc)
        enqueueDecorUpdate()
        vscode.workspace.onDidOpenTextDocument(async (doc) => {
            await initTree(doc)
        }, null, context.subscriptions)
        vscode.workspace.onDidCloseTextDocument(doc => {
            const uri = doc.uri.toString()
            delete trees[uri]
            delete decorCache[uri]
            if (refreshUris.includes(uri))
                refreshUris.splice(refreshUris.indexOf(uri), 1)
        }, null, context.subscriptions)
        vscode.workspace.onDidChangeTextDocument(event => {
            const uri = event.document.uri.toString()
            if (!(uri in trees))
                return
            if (event.contentChanges.length < 1)
                return
            let changes = []
            for (const c of event.contentChanges) {
                const startPos0 = c.range.start
                const startIndex0 = event.document.offsetAt(startPos0)
                const endPos0 = c.range.end
                const endIndex0 = startIndex0 + c.rangeLength
                const endIndex1 = startIndex0 + c.text.length
                const endPos1 = event.document.positionAt(endIndex1)
                changes.push({
                    startIndex: startIndex0,
                    oldEndIndex: endIndex0,
                    newEndIndex: endIndex1,
                    startPosition: { row: startPos0.line, column: startPos0.character },
                    oldEndPosition: { row: endPos0.line, column: endPos0.character },
                    newEndPosition: { row: endPos1.line, column: endPos1.character }
                })
            }
            updateTree(event.document, changes)
        }, null, context.subscriptions)
        vscode.window.onDidChangeVisibleTextEditors(editors => {
            // Flag refresh for new editors
            let needUpdate = false
            for (const e of editors) {
                const uri = e.document.uri.toString()
                if (visibleEditors.includes(e))
                    continue
                if (!refreshUris.includes(uri))
                    refreshUris.push(uri)
                if (uri in trees)
                    needUpdate = true
            }
            // Set visible editors
            visibleEditors = editors
            visibleUris = []
            for (const e of visibleEditors) {
                const uri = e.document.uri.toString()
                if (!visibleUris.includes(uri))
                    visibleUris.push(uri)
            }
            // Enqueue refresh if required
            if (needUpdate)
                enqueueDecorUpdate()
        }, null, context.subscriptions)
    }
    exports.activate = activate
});