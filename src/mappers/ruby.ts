import * as Parser from 'web-tree-sitter'
import {Range, visible, isVisible} from '../mapper_tools'

export function colorRuby(root: Parser.Tree, visibleRanges: {start: number, end: number}[]) {
	const controlKeywords = new Set(['while', 'until', 'if', 'unless', 'for', 'begin', 'elsif', 'else', 'ensure', 'when', 'case', 'do_block'])
	const classKeywords = new Set(['include', 'prepend', 'extend', 'private', 'protected', 'public', 'attr_reader', 'attr_writer', 'attr_accessor', 'attr', 'private_class_method', 'public_class_method'])
	const moduleKeywords = new Set(['module_function', ...classKeywords])
	const functions: Range[] = []
	const types: Range[] = []
	const variables: Range[] = []
	const keywords: Range[] = []
	const controls: Range[] = []
	const constants: Range[] = []
	let visitedChildren = false
	let cursor = root.walk()
	let parents = [cursor.nodeType]
	function isChildOf(ancestor: string) {
		const parent = parents[parents.length - 1]
		const grandparent = parents[parents.length - 2]
		// class Foo; bar; end
		if (parent == ancestor) {
			return true
		}
		// class Foo; bar :thing; end
		if (parent == 'method_call' && grandparent == ancestor) {
			return true
		}
		return false
	}
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
			case 'method':
				cursor.gotoFirstChild()
				cursor.gotoNextSibling()
				functions.push({start: cursor.startPosition, end: cursor.endPosition})
				cursor.gotoParent()
				break
			case 'singleton_method':
				cursor.gotoFirstChild()
				cursor.gotoNextSibling()
				cursor.gotoNextSibling()
				cursor.gotoNextSibling()
				functions.push({start: cursor.startPosition, end: cursor.endPosition})
				cursor.gotoParent()
				break
			case 'instance_variable':
			case 'class_variable':
			case 'global_variable':
				variables.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'end':
				if (controlKeywords.has(parent)) {
					controls.push({start: cursor.startPosition, end: cursor.endPosition})
				} else {
					keywords.push({start: cursor.startPosition, end: cursor.endPosition})
				}
				break
			case 'constant':
				types.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'symbol':
				constants.push({start: cursor.startPosition, end: cursor.endPosition})
				break
			case 'method_call': {
				cursor.gotoFirstChild()
				const text = cursor.currentNode().text
				if (!moduleKeywords.has(text)) {
					functions.push({start: cursor.startPosition, end: cursor.endPosition})
				}
				cursor.gotoParent()
				break
			}
			case 'call':
				cursor.gotoFirstChild()
				cursor.gotoNextSibling()
				cursor.gotoNextSibling()
				functions.push({start: cursor.startPosition, end: cursor.endPosition})
				cursor.gotoParent()
				break
			case 'identifier': {
				const text = cursor.currentNode().text
				if (classKeywords.has(text) && isChildOf('class')) {
					keywords.push({start: cursor.startPosition, end: cursor.endPosition})
				} else if (moduleKeywords.has(text) && isChildOf('module')) {
					keywords.push({start: cursor.startPosition, end: cursor.endPosition})
				}
				break
			}
		}
	}
	cursor.delete()
	return new Map([
		['entity.name.function', functions],
		['entity.name.type', types],
		['variable', variables],
		['keyword', keywords],
		['keyword.control', controls],
		['constant.language', constants],
	])
}