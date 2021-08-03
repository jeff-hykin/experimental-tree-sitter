import * as Parser from 'web-tree-sitter'
import {Range, visible, isVisible} from '../mapper_tools'

export function colorTypescript(root: Parser.Tree, visibleRanges: {start: number, end: number}[]) {
	const functions: Range[] = []
	const types: Range[] = []
	const variables: Range[] = []
	const keywords: Range[] = []
	let visitedChildren = false
	let cursor = root.walk()
	let parents = [cursor.nodeType]
	while (true) {
		// Advance cursor
		if (visitedChildren) {
			if (cursor.gotoNextSibling()) {
				visitedChildren = false
			} else if (cursor.gotoParent()) {
				parents.pop()
				visitedChildren = true
				continue
			} else {
				break
			}
		} else {
			const parent = cursor.nodeType
			if (cursor.gotoFirstChild()) {
				parents.push(parent)
				visitedChildren = false
			} else {
				visitedChildren = true
				continue
			}
		}
		// Skip nodes that are not visible
		if (!visible(cursor, visibleRanges)) {
			visitedChildren = true
			continue
		}
		// Color tokens
		const parent = parents[parents.length - 1]
		switch (cursor.nodeType) {
			case 'identifier':
				if (parent == 'function') {
					functions.push({start: cursor.startPosition, end: cursor.endPosition})
				}
				break
			case 'type_identifier':
			case 'predefined_type':
				types.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'property_identifier':
				variables.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'method_definition': 
				const firstChild = cursor.currentNode().firstChild!
				switch (firstChild.text) {
					case 'get':
					case 'set':
						keywords.push({start: firstChild.startPosition, end: firstChild.endPosition})
				}
				break
			case 'function_declaration':
				const functionName = cursor.currentNode().firstNamedChild!
				functions.push({start: functionName.startPosition, end: functionName.endPosition})

		}
	}
	cursor.delete()
	return new Map([
		['entity.name.function', functions],
		['entity.name.type', types],
		['variable', variables],
		['keyword', keywords],
	])
}