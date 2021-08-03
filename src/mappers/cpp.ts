import * as Parser from 'web-tree-sitter'
import {Range, visible, isVisible} from '../mapper_tools'

export function colorCpp(root: Parser.Tree, visibleRanges: {start: number, end: number}[]) {
	const functions: Range[] = []
	const types: Range[] = []
	const variables: Range[] = []
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
		const grandparent = parents[parents.length - 2]
		switch (cursor.nodeType) {
			case 'identifier':
				if (parent == 'function_declarator' || parent == 'scoped_identifier' && grandparent == 'function_declarator') {
					functions.push({start: cursor.startPosition, end: cursor.endPosition})
				}
				break
			case 'type_identifier':
				types.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'field_identifier':
				variables.push({start: cursor.startPosition, end: cursor.endPosition})
				break
		}
	}
	cursor.delete()
	return new Map([
		['entity.name.function', functions],
		['entity.name.type', types],
		['variable', variables],
	])
}