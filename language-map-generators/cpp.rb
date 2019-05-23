require "yaml"

Dir.chdir __dir__
mapping = {}

# TODO: tag the # seperately
preprocessor_conditionals = ["if", "ifdef", "ifndef", "elif", "else", "endif" ]
for each in preprocessor_conditionals
    mapping["\"##{each}\""] = [ each, "control", "directive", "keyword", ]
end
mapping['"#include"'] = [ each, "import", "directive", "keyword", ]
mapping['"#define"'] = [ each, "macro", "directive", "keyword", ]

control_flow = ["if", "else", "do", "for", "while", "break", "continue", "return", "switch", "case", "default", "goto",]
for each in control_flow
    mapping["\"#{each}\""] = [ each, "control", "keyword", ]
end

exception_handling = ["try", "catch", "throw"]
for each in exception_handling
    mapping["\"#{each}\""] = [ each, "exception", "control", "keyword" ]
end

# TODO: namespace can be used in different ways 
storage_declarations = ["struct", "enum", "union", "class", "namespace" ]
for each in storage_declarations
    mapping["\"#{each}\""] = [ each, "storage", "keyword" ]
end

misc_keywords = ["using", "typedef", "template", "typename" ]
for each in misc_keywords
    mapping["\"#{each}\""] = [ each, "keyword" ]
end

mapping.to_yaml

#   'preproc_function_def > identifier:nth-child(1)': 'entity.name.function.preprocessor'
#   'preproc_arg': 'meta.preprocessor.macro'
#   'preproc_directive': 'keyword.control.directive'

#   'template_function > identifier': [
#     {
#       match: '^(static|const|dynamic|reinterpret)_cast$'
#       scopes: 'keyword.operator'
#     }
#   ]

#   '''
#   call_expression > identifier,
#   call_expression > field_expression > field_identifier,
#   call_expression > scoped_identifier > identifier,
#   template_function > identifier,
#   template_function > scoped_identifier > identifier,
#   template_method > field_identifier,
#   function_declarator > identifier,
#   function_declarator > field_identifier,
#   function_declarator > scoped_identifier > identifier,
#   destructor_name > identifier
#   ''': 'entity.name.function'

#   'statement_identifier': 'constant.variable'

#   'field_identifier': 'variable.other.member'

#   'type_identifier': 'support.storage.type'
#   'primitive_type': 'support.storage.type'
#   '"unsigned"': 'support.storage.type'
#   '"signed"': 'support.storage.type'
#   '"short"': 'support.storage.type'
#   '"long"': 'support.storage.type'
#   'auto': 'support.storage.type'

#   'char_literal': 'string.quoted.single'
#   'string_literal': 'string.quoted.double'
#   'system_lib_string': 'string.quoted.other'
#   'raw_string_literal': 'string.quoted.other'
#   'escape_sequence': 'constant.character.escape'
#   'preproc_include > string_literal > escape_sequence': 'string.quoted.double'

#   'number_literal': 'constant.numeric.decimal'
#   'null': 'constant.language.null'
#   'nullptr': 'constant.language.null'
#   'true': 'constant.language.boolean'
#   'false': 'constant.language.boolean'

#   '"extern"': 'storage.modifier'
#   '"static"': 'storage.modifier'
#   '"register"': 'storage.modifier'
#   '"friend"': 'storage.modifier'
#   '"inline"': 'storage.modifier'
#   '"explicit"': 'storage.modifier'
#   '"const"': 'storage.modifier'
#   '"constexpr"': 'storage.modifier'
#   '"volatile"': 'storage.modifier'
#   '"restrict"': 'storage.modifier'
#   '"_Atomic"': 'storage.modifier'
#   'function_specifier': 'storage.modifier'
#   '"public"': 'storage.modifier'
#   '"private"': 'storage.modifier'
#   '"protected"': 'storage.modifier'
#   '"final"': 'storage.modifier'
#   '"override"': 'storage.modifier'
#   '"virtual"': 'storage.modifier'

#   '";"': 'punctuation.terminator.statement'
#   '"["': 'punctuation.definition.begin.bracket.square'
#   '"]"': 'punctuation.definition.end.bracket.square'
#   'access_specifier > ":"': 'punctuation.definition.visibility.colon'
#   'base_class_clause > ":"': 'punctuation.definition.inheritance.colon'
#   'base_class_clause > ","': 'punctuation.definition.separator.class.comma'
#   'field_declaration > ","': 'punctuation.separator.delimiter'
#   'parameter_list > ","': 'punctuation.separator.delimiter'
#   'field_initializer_list > ":"': 'punctuation.definition.initialization.colon'
#   'field_initializer_list > ","': 'punctuation.separator.delimiter'
#   '"::"': 'punctuation.separator.method.double-colon'
#   'template_parameter_list > "<"': 'punctuation.definition.template.bracket.angle'
#   'template_parameter_list > ">"': 'punctuation.definition.template.bracket.angle'
#   'template_argument_list > ">"': 'punctuation.definition.template.bracket.angle'
#   'template_argument_list > "<"': 'punctuation.definition.template.bracket.angle'
#   'char_literal > "\'"': 'punctuation.definition.string'
#   'string_literal > "\\""': 'punctuation.definition.string'
#   '"{"': 'punctuation.section.block.begin.bracket.curly'
#   '"}"': 'punctuation.section.block.end.bracket.curly'
#   '"("': 'punctuation.section.parens.begin.bracket.round'
#   '")"': 'punctuation.section.parens.end.bracket.round'

#   '"sizeof"': 'keyword.operator.sizeof'
#   '"new"': 'keyword.operator'
#   '"delete"': 'keyword.operator'
#   '"."': 'keyword.operator.member'
#   '"->"': 'keyword.operator.member'
#   '"*"': 'keyword.operator'
#   '"-"': 'keyword.operator'
#   '"+"': 'keyword.operator'
#   '"/"': 'keyword.operator'
#   '"%"': 'keyword.operator'
#   '"++"': 'keyword.operator'
#   '"--"': 'keyword.operator'
#   '"=="': 'keyword.operator'
#   '"!"': 'keyword.operator'
#   '"!="': 'keyword.operator'
#   'relational_expression > "<"': 'keyword.operator'
#   'relational_expression > ">"': 'keyword.operator'
#   '">="': 'keyword.operator'
#   '"<="': 'keyword.operator'
#   '"&&"': 'keyword.operator'
#   '"||"': 'keyword.operator'
#   '"&"': 'keyword.operator'
#   '"|"': 'keyword.operator'
#   '"^"': 'keyword.operator'
#   '"~"': 'keyword.operator'
#   '"<<"': 'keyword.operator'
#   '">>"': 'keyword.operator'
#   '"="': 'keyword.operator'
#   '"+="': 'keyword.operator'
#   '"-="': 'keyword.operator'
#   '"*="': 'keyword.operator'
#   '"/="': 'keyword.operator'
#   '"%="': 'keyword.operator'
#   '"<<="': 'keyword.operator'
#   '">>="': 'keyword.operator'
#   '"&="': 'keyword.operator'
#   '"^="': 'keyword.operator'
#   '"|="': 'keyword.operator'
#   '"?"': 'keyword.operator'
#   'conditional_expression > ":"': 'keyword.operator'

File.open('../language-mappings/cpp.yaml', 'w') do |file|
  file.write(mapping.to_yaml)
end