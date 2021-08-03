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
        // DONE
		['entity.name.function', functions],
		['entity.name.type', types],
		['variable', variables],
        // TODO:
        //     comment.block.cpp
        //     comment.block.documentation.cpp
        //     comment.line.banner.cpp
        //     comment.line.double-slash.cpp
        //     comment.line.double-slash.documentation.cpp
        //     constant.character.escape
        //     constant.character.escape.cpp
        //     constant.character.escape.line-continuation.cpp
        //     constant.language.$0.cpp
        //     constant.numeric.binary.cpp
        //     constant.numeric.decimal.cpp
        //     constant.numeric.decimal.point.cpp
        //     constant.numeric.exponent.decimal.cpp
        //     constant.numeric.exponent.hexadecimal.cpp
        //     constant.numeric.hexadecimal.cpp
        //     constant.numeric.octal.cpp
        //     constant.other.placeholder
        //     entity.name.function.call.cpp
        //     entity.name.function.call.initializer.cpp
        //     entity.name.function.constructor.cpp
        //     entity.name.function.definition.cpp
        //     entity.name.function.definition.special.constructor.cpp
        //     entity.name.function.definition.special.member.destructor.cpp
        //     entity.name.function.destructor.cpp
        //     entity.name.function.member.cpp
        //     entity.name.function.preprocessor.cpp
        //     entity.name.label.call.cpp
        //     entity.name.label.cpp
        //     entity.name.namespace.alias.cpp
        //     entity.name.namespace.cpp
        //     entity.name.operator.cpp
        //     entity.name.operator.custom-literal.cpp
        //     entity.name.operator.type.array.cpp
        //     entity.name.operator.type.cpp
        //     entity.name.operator.type.pointer.cpp
        //     entity.name.operator.type.reference.cpp
        //     entity.name.other.preprocessor.macro.include.cpp
        //     entity.name.other.preprocessor.macro.predefined.$1.cpp
        //     entity.name.other.preprocessor.macro.predefined.DLLEXPORT.cpp
        //     entity.name.other.preprocessor.macro.predefined.probably.$0.cpp
        //     entity.name.other.preprocessor.macro.predefined.probably.$1.cpp
        //     entity.name.scope-resolution.constructor.cpp
        //     entity.name.scope-resolution.cpp
        //     entity.name.scope-resolution.destructor.cpp
        //     entity.name.scope-resolution.function.call.cpp
        //     entity.name.scope-resolution.function.definition.cpp
        //     entity.name.scope-resolution.function.definition.operator-overload.cpp
        //     entity.name.scope-resolution.namespace.alias.cpp
        //     entity.name.scope-resolution.namespace.block.cpp
        //     entity.name.scope-resolution.namespace.using.cpp
        //     entity.name.scope-resolution.operator-overload.cpp
        //     entity.name.scope-resolution.operator.cpp
        //     entity.name.scope-resolution.parameter.cpp
        //     entity.name.scope-resolution.template.call.cpp
        //     entity.name.scope-resolution.template.definition.cpp
        //     entity.name.scope-resolution.type.cpp
        //     entity.name.tag.pragma-mark.cpp
        //     entity.name.type.alias.cpp
        //     entity.name.type.class.cpp
        //     entity.name.type.class.parameter.cpp
        //     entity.name.type.constructor.cpp
        //     entity.name.type.cpp
        //     entity.name.type.destructor.cpp
        //     entity.name.type.enum.cpp
        //     entity.name.type.enum.parameter.cpp
        //     entity.name.type.parameter.cpp
        //     entity.name.type.pointer.function.cpp
        //     entity.name.type.struct.cpp
        //     entity.name.type.struct.parameter.cpp
        //     entity.name.type.template.cpp
        //     entity.name.type.union.cpp
        //     entity.name.type.union.parameter.cpp
        //     entity.other.attribute-name.pragma.preprocessor.cpp
        //     entity.other.attribute.$0.cpp
        //     invalid.illegal.constant.numeric.cpp
        //     invalid.illegal.delimiter-too-long
        //     invalid.illegal.reference-type.cpp
        //     invalid.illegal.unexpected.punctuation.definition.comment.end.cpp
        //     invalid.illegal.unknown-escape
        //     invalid.illegal.unknown-escape.cpp
        //     keyword.control.$3.cpp
        //     keyword.control.case.cpp
        //     keyword.control.default.cpp
        //     keyword.control.directive.$4.cpp
        //     keyword.control.directive.$5.cpp
        //     keyword.control.directive.conditional.$6.cpp
        //     keyword.control.directive.conditional.defined.cpp
        //     keyword.control.directive.define.cpp
        //     keyword.control.directive.diagnostic.$7.cpp
        //     keyword.control.directive.import.cpp
        //     keyword.control.directive.line.cpp
        //     keyword.control.directive.pragma.cpp
        //     keyword.control.directive.pragma.pragma-mark.cpp
        //     keyword.control.directive.undef.cpp
        //     keyword.control.exception.$3.cpp
        //     keyword.control.goto.cpp
        //     keyword.control.switch.cpp
        //     keyword.operator.$0.cpp
        //     keyword.operator.$1.cpp
        //     keyword.operator.alignas.cpp
        //     keyword.operator.alignof.cpp
        //     keyword.operator.assignment.compound.bitwise.cpp
        //     keyword.operator.assignment.compound.cpp
        //     keyword.operator.assignment.cpp
        //     keyword.operator.bitwise.shift.cpp
        //     keyword.operator.cast.$3.cpp
        //     keyword.operator.comparison.cpp
        //     keyword.operator.cpp
        //     keyword.operator.decrement.cpp
        //     keyword.operator.delete.array.bracket.cpp
        //     keyword.operator.delete.array.cpp
        //     keyword.operator.delete.cpp
        //     keyword.operator.functionlike.cpp
        //     keyword.operator.increment.cpp
        //     keyword.operator.logical.cpp
        //     keyword.operator.minus.exponent.decimal.cpp
        //     keyword.operator.minus.exponent.hexadecimal.cpp
        //     keyword.operator.new.cpp
        //     keyword.operator.noexcept.cpp
        //     keyword.operator.plus.exponent.decimal.cpp
        //     keyword.operator.plus.exponent.hexadecimal.cpp
        //     keyword.operator.sizeof.cpp
        //     keyword.operator.sizeof.variadic.cpp
        //     keyword.operator.ternary.cpp
        //     keyword.operator.typeid.cpp
        //     keyword.operator.wordlike.cpp
        //     keyword.other.$3.cpp
        //     keyword.other.decltype.cpp
        //     keyword.other.default.constructor.cpp
        //     keyword.other.delete.constructor.cpp
        //     keyword.other.namespace.alias.cpp
        //     keyword.other.namespace.definition.cpp
        //     keyword.other.namespace.directive.cpp
        //     keyword.other.operator.overload.cpp
        //     keyword.other.parameter.direction.$0.cpp
        //     keyword.other.static_assert.cpp
        //     keyword.other.typedef.cpp
        //     keyword.other.typename.cpp
        //     keyword.other.unit.binary.cpp
        //     keyword.other.unit.exponent.decimal.cpp
        //     keyword.other.unit.exponent.hexadecimal.cpp
        //     keyword.other.unit.hexadecimal.cpp
        //     keyword.other.unit.octal.cpp
        //     keyword.other.unit.suffix.floating-point.cpp
        //     keyword.other.unit.suffix.integer.cpp
        //     keyword.other.unit.user-defined.cpp
        //     keyword.other.using.directive.cpp
        //     markup.bold.doxygen.cpp
        //     markup.inline.raw.string.cpp
        //     markup.italic.doxygen.cpp
        //     meta.arguments.decltype
        //     meta.arguments.operator.alignas
        //     meta.arguments.operator.alignof
        //     meta.arguments.operator.noexcept
        //     meta.arguments.operator.sizeof
        //     meta.arguments.operator.sizeof.variadic
        //     meta.arguments.operator.typeid
        //     meta.asm.cpp
        //     meta.banner.character.cpp
        //     meta.block.class.cpp
        //     meta.block.cpp
        //     meta.block.enum.cpp
        //     meta.block.extern.cpp
        //     meta.block.namespace.cpp
        //     meta.block.struct.cpp
        //     meta.block.switch.cpp
        //     meta.block.union.cpp
        //     meta.body.class.cpp
        //     meta.body.enum.cpp
        //     meta.body.extern.cpp
        //     meta.body.function.definition.cpp
        //     meta.body.function.definition.special.constructor.cpp
        //     meta.body.function.definition.special.member.destructor.cpp
        //     meta.body.function.definition.special.operator-overload.cpp
        //     meta.body.namespace.cpp
        //     meta.body.struct.cpp
        //     meta.body.switch.cpp
        //     meta.body.union.cpp
        //     meta.bracket.square.access
        //     meta.bracket.square.array.cpp
        //     meta.conditional.case.cpp
        //     meta.conditional.switch.cpp
        //     meta.declaration.namespace.alias.cpp
        //     meta.declaration.namespace.alias.value.cpp
        //     meta.declaration.type.alias.cpp
        //     meta.declaration.type.alias.value.unknown.cpp
        //     meta.embedded.assembly
        //     meta.encoding
        //     meta.encoding.cpp
        //     meta.enum.definition.cpp
        //     meta.function.definition.body.lambda.cpp
        //     meta.function.definition.cpp
        //     meta.function.definition.parameters
        //     meta.function.definition.parameters.lambda.cpp
        //     meta.function.definition.parameters.special.constructor
        //     meta.function.definition.parameters.special.member.destructor
        //     meta.function.definition.parameters.special.operator-overload
        //     meta.function.definition.special.constructor.cpp
        //     meta.function.definition.special.member.destructor.cpp
        //     meta.function.definition.special.operator-overload.cpp
        //     meta.head.class.cpp
        //     meta.head.enum.cpp
        //     meta.head.extern.cpp
        //     meta.head.function.definition.cpp
        //     meta.head.function.definition.special.constructor.cpp
        //     meta.head.function.definition.special.member.destructor.cpp
        //     meta.head.function.definition.special.operator-overload.cpp
        //     meta.head.namespace.cpp
        //     meta.head.struct.cpp
        //     meta.head.switch.cpp
        //     meta.head.union.cpp
        //     meta.initialization.cpp
        //     meta.lambda.capture.cpp
        //     meta.parameter.cpp
        //     meta.parameter.initialization
        //     meta.parens.cpp
        //     meta.parens.preprocessor.conditional.cpp
        //     meta.preprocessor.conditional.cpp
        //     meta.preprocessor.diagnostic.$reference(directive).cpp
        //     meta.preprocessor.import.cpp
        //     meta.preprocessor.include.cpp
        //     meta.preprocessor.line.cpp
        //     meta.preprocessor.macro.cpp
        //     meta.preprocessor.pragma.cpp
        //     meta.preprocessor.undef.cpp
        //     meta.qualified_type.cpp
        //     meta.static_assert.message.cpp
        //     meta.string.quoted.double.raw.glsl.cpp
        //     meta.string.quoted.double.raw.sql.cpp
        //     meta.tail.class.cpp
        //     meta.tail.enum.cpp
        //     meta.tail.extern.cpp
        //     meta.tail.function.definition.cpp
        //     meta.tail.function.definition.special.constructor.cpp
        //     meta.tail.function.definition.special.member.destructor.cpp
        //     meta.tail.function.definition.special.operator-overload.cpp
        //     meta.tail.namespace.cpp
        //     meta.tail.struct.cpp
        //     meta.tail.switch.cpp
        //     meta.tail.union.cpp
        //     meta.template.call.cpp
        //     meta.template.definition.cpp
        //     meta.toc-list.banner.block.cpp
        //     meta.toc-list.banner.double-slash.cpp
        //     meta.using-namespace.cpp
        //     punctuation.accessor.attribute.cpp
        //     punctuation.definition.begin.bracket.square
        //     punctuation.definition.begin.bracket.square.array.type.cpp
        //     punctuation.definition.begin.bracket.square.cpp
        //     punctuation.definition.capture.begin.lambda.cpp
        //     punctuation.definition.capture.end.lambda.cpp
        //     punctuation.definition.comment.begin.cpp
        //     punctuation.definition.comment.begin.documentation.cpp
        //     punctuation.definition.comment.cpp
        //     punctuation.definition.comment.documentation.cpp
        //     punctuation.definition.comment.end.cpp
        //     punctuation.definition.comment.end.documentation.cpp
        //     punctuation.definition.directive.cpp
        //     punctuation.definition.end.bracket.square
        //     punctuation.definition.end.bracket.square.array.type.cpp
        //     punctuation.definition.end.bracket.square.cpp
        //     punctuation.definition.function.pointer.dereference.cpp
        //     punctuation.definition.function.return-type.cpp
        //     punctuation.definition.lambda.return-type.cpp
        //     punctuation.definition.parameters.begin.lambda.cpp
        //     punctuation.definition.parameters.begin.preprocessor.cpp
        //     punctuation.definition.parameters.end.lambda.cpp
        //     punctuation.definition.parameters.end.preprocessor.cpp
        //     punctuation.definition.string.begin
        //     punctuation.definition.string.begin.assembly.cpp
        //     punctuation.definition.string.begin.cpp
        //     punctuation.definition.string.end
        //     punctuation.definition.string.end.assembly.cpp
        //     punctuation.definition.string.end.cpp
        //     punctuation.section.angle-brackets.begin.template.call.cpp
        //     punctuation.section.angle-brackets.end.template.call.cpp
        //     punctuation.section.angle-brackets.end.template.definition.cpp
        //     punctuation.section.angle-brackets.start.template.definition.cpp
        //     punctuation.section.arguments.begin.bracket.curly.initializer.cpp
        //     punctuation.section.arguments.begin.bracket.round.decltype.cpp
        //     punctuation.section.arguments.begin.bracket.round.function.call.cpp
        //     punctuation.section.arguments.begin.bracket.round.function.call.initializer.cpp
        //     punctuation.section.arguments.begin.bracket.round.function.member.cpp
        //     punctuation.section.arguments.begin.bracket.round.initializer.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.alignas.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.alignof.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.noexcept.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.sizeof.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.sizeof.variadic.cpp
        //     punctuation.section.arguments.begin.bracket.round.operator.typeid.cpp
        //     punctuation.section.arguments.begin.bracket.round.static_assert.cpp
        //     punctuation.section.arguments.end.bracket.curly.initializer.cpp
        //     punctuation.section.arguments.end.bracket.round.decltype.cpp
        //     punctuation.section.arguments.end.bracket.round.function.call.cpp
        //     punctuation.section.arguments.end.bracket.round.function.call.initializer.cpp
        //     punctuation.section.arguments.end.bracket.round.function.member.cpp
        //     punctuation.section.arguments.end.bracket.round.initializer.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.alignas.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.alignof.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.noexcept.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.sizeof.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.sizeof.variadic.cpp
        //     punctuation.section.arguments.end.bracket.round.operator.typeid.cpp
        //     punctuation.section.arguments.end.bracket.round.static_assert.cpp
        //     punctuation.section.attribute.begin.cpp
        //     punctuation.section.attribute.end.cpp
        //     punctuation.section.block.begin.bracket.curly.class.cpp
        //     punctuation.section.block.begin.bracket.curly.cpp
        //     punctuation.section.block.begin.bracket.curly.enum.cpp
        //     punctuation.section.block.begin.bracket.curly.extern.cpp
        //     punctuation.section.block.begin.bracket.curly.function.definition.cpp
        //     punctuation.section.block.begin.bracket.curly.function.definition.special.constructor.cpp
        //     punctuation.section.block.begin.bracket.curly.function.definition.special.member.destructor.cpp
        //     punctuation.section.block.begin.bracket.curly.function.definition.special.operator-overload.cpp
        //     punctuation.section.block.begin.bracket.curly.lambda.cpp
        //     punctuation.section.block.begin.bracket.curly.namespace.cpp
        //     punctuation.section.block.begin.bracket.curly.struct.cpp
        //     punctuation.section.block.begin.bracket.curly.switch.cpp
        //     punctuation.section.block.begin.bracket.curly.union.cpp
        //     punctuation.section.block.end.bracket.curly.class.cpp
        //     punctuation.section.block.end.bracket.curly.cpp
        //     punctuation.section.block.end.bracket.curly.enum.cpp
        //     punctuation.section.block.end.bracket.curly.extern.cpp
        //     punctuation.section.block.end.bracket.curly.function.definition.cpp
        //     punctuation.section.block.end.bracket.curly.function.definition.special.constructor.cpp
        //     punctuation.section.block.end.bracket.curly.function.definition.special.member.destructor.cpp
        //     punctuation.section.block.end.bracket.curly.function.definition.special.operator-overload.cpp
        //     punctuation.section.block.end.bracket.curly.lambda.cpp
        //     punctuation.section.block.end.bracket.curly.namespace.cpp
        //     punctuation.section.block.end.bracket.curly.struct.cpp
        //     punctuation.section.block.end.bracket.curly.switch.cpp
        //     punctuation.section.block.end.bracket.curly.union.cpp
        //     punctuation.section.parameters.begin.bracket.round.cpp
        //     punctuation.section.parameters.begin.bracket.round.function.pointer.cpp
        //     punctuation.section.parameters.begin.bracket.round.special.constructor.cpp
        //     punctuation.section.parameters.begin.bracket.round.special.member.destructor.cpp
        //     punctuation.section.parameters.begin.bracket.round.special.operator-overload.cpp
        //     punctuation.section.parameters.end.bracket.round.cpp
        //     punctuation.section.parameters.end.bracket.round.function.pointer.cpp
        //     punctuation.section.parameters.end.bracket.round.special.constructor.cpp
        //     punctuation.section.parameters.end.bracket.round.special.member.destructor.cpp
        //     punctuation.section.parameters.end.bracket.round.special.operator-overload.cpp
        //     punctuation.section.parens.begin.bracket.round.assembly.cpp
        //     punctuation.section.parens.begin.bracket.round.assembly.inner.cpp
        //     punctuation.section.parens.begin.bracket.round.conditional.switch.cpp
        //     punctuation.section.parens.begin.bracket.round.cpp
        //     punctuation.section.parens.begin.bracket.round.function.pointer.cpp
        //     punctuation.section.parens.control.defined.cpp
        //     punctuation.section.parens.end.bracket.round.assembly.cpp
        //     punctuation.section.parens.end.bracket.round.assembly.inner.cpp
        //     punctuation.section.parens.end.bracket.round.conditional.switch.cpp
        //     punctuation.section.parens.end.bracket.round.cpp
        //     punctuation.section.parens.end.bracket.round.function.pointer.cpp
        //     punctuation.separator.attribute.cpp
        //     punctuation.separator.colon.access.control.cpp
        //     punctuation.separator.colon.case.cpp
        //     punctuation.separator.colon.case.default.cpp
        //     punctuation.separator.colon.inheritance.cpp
        //     punctuation.separator.colon.range-based.cpp
        //     punctuation.separator.colon.type-specifier.cpp
        //     punctuation.separator.constant.numeric.cpp
        //     punctuation.separator.delimiter.colon.assembly.cpp
        //     punctuation.separator.delimiter.comma.cpp
        //     punctuation.separator.delimiter.comma.inheritance.cpp
        //     punctuation.separator.delimiter.comma.template.argument.cpp
        //     punctuation.separator.dot-access.cpp
        //     punctuation.separator.initializers.cpp
        //     punctuation.separator.label.cpp
        //     punctuation.separator.namespace.access.cpp
        //     punctuation.separator.parameters.cpp
        //     punctuation.separator.pointer-access.cpp
        //     punctuation.separator.scope-resolution.constructor.cpp
        //     punctuation.separator.scope-resolution.cpp
        //     punctuation.separator.scope-resolution.destructor.cpp
        //     punctuation.separator.scope-resolution.function.call.cpp
        //     punctuation.separator.scope-resolution.function.definition.cpp
        //     punctuation.separator.scope-resolution.function.definition.operator-overload.cpp
        //     punctuation.separator.scope-resolution.namespace.alias.cpp
        //     punctuation.separator.scope-resolution.namespace.block.cpp
        //     punctuation.separator.scope-resolution.namespace.using.cpp
        //     punctuation.separator.scope-resolution.operator-overload.cpp
        //     punctuation.separator.scope-resolution.operator.cpp
        //     punctuation.separator.scope-resolution.parameter.cpp
        //     punctuation.separator.scope-resolution.template.call.cpp
        //     punctuation.separator.scope-resolution.template.definition.cpp
        //     punctuation.separator.scope-resolution.type.cpp
        //     punctuation.terminator.statement.cpp
        //     punctuation.vararg-ellipses.cpp
        //     punctuation.vararg-ellipses.template.definition.cpp
        //     punctuation.vararg-ellipses.variable.parameter.preprocessor.cpp
        //     storage.modifier.$1.cpp
        //     storage.modifier.$12.cpp
        //     storage.modifier.array.bracket.square
        //     storage.modifier.cpp
        //     storage.modifier.inline.cpp
        //     storage.modifier.lambda.$0.cpp
        //     storage.modifier.pointer.cpp
        //     storage.modifier.reference.cpp
        //     storage.modifier.specifier.$3.cpp
        //     storage.modifier.specifier.functional.post-parameters.$3.cpp
        //     storage.modifier.specifier.functional.pre-parameters.$0.cpp
        //     storage.modifier.specifier.parameter.cpp
        //     storage.type.$0.cpp
        //     storage.type.$1.cpp
        //     storage.type.asm.cpp
        //     storage.type.built-in.cpp
        //     storage.type.built-in.primitive.cpp
        //     storage.type.class.declare.cpp
        //     storage.type.class.doxygen.cpp
        //     storage.type.class.gtkdoc.cpp
        //     storage.type.class.parameter.cpp
        //     storage.type.cpp
        //     storage.type.decltype.cpp
        //     storage.type.enum.cpp
        //     storage.type.enum.declare.cpp
        //     storage.type.enum.enum-key.$2.cpp
        //     storage.type.enum.parameter.cpp
        //     storage.type.extern.cpp
        //     storage.type.integral.$14.cpp
        //     storage.type.modifier.access.$0.cpp
        //     storage.type.modifier.access.control.$4.cpp
        //     storage.type.modifier.calling-convention.cpp
        //     storage.type.modifier.final.cpp
        //     storage.type.modifier.virtual.cpp
        //     storage.type.namespace.alias.cpp
        //     storage.type.namespace.definition.cpp
        //     storage.type.namespace.directive.cpp
        //     storage.type.primitive.cpp
        //     storage.type.return-type.lambda.cpp
        //     storage.type.struct.declare.cpp
        //     storage.type.struct.parameter.cpp
        //     storage.type.template.argument.$0.cpp
        //     storage.type.template.argument.$3.cpp
        //     storage.type.template.cpp
        //     storage.type.union.declare.cpp
        //     storage.type.union.parameter.cpp
        //     string.quoted.double.cpp
        //     string.quoted.double.include.cpp
        //     string.quoted.double.raw
        //     string.quoted.double.raw.regex.cpp
        //     string.quoted.other.lt-gt.include.cpp
        //     string.quoted.single.cpp
        //     string.unquoted.cpp
        //     support.other.attribute.cpp
        //     support.type.built-in.posix-reserved.cpp
        //     support.type.built-in.posix-reserved.pthread.cpp
        //     support.type.posix-reserved.cpp
        //     support.type.posix-reserved.pthread.cpp
        //     variable.language.this.cpp
        //     variable.other.asm.label.cpp
        //     variable.other.definition.pointer.function.cpp
        //     variable.other.enummember.cpp
        //     variable.other.macro.argument.cpp
        //     variable.other.object
        //     variable.other.object.access.cpp
        //     variable.other.object.declare.cpp
        //     variable.other.object.property.cpp
        //     variable.other.property.cpp
        //     variable.parameter.capture.cpp
        //     variable.parameter.cpp
        //     variable.parameter.pointer.function.cpp
        //     variable.parameter.preprocessor.cpp
	])
}