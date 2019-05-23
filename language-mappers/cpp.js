

// 
// Create a mapping for faster processing
// 
    mapping = {}

    // preprocessor control
    preprocessor_conditionals = ["if", "ifdef", "ifndef", "elif", "else", "endif" ]
    for (let each of preprocessor_conditionals) {
        mapping[`"${each}"`] = [ each, "control", "directive", "keyword", ]
    }
    // preprocessor directives
    mapping['"#include"'] = [ "include", "import", "directive", "keyword", ]
    mapping['"#define"'] = [ "define", "macro", "directive", "keyword", ]

    control_flow = ["if", "else", "do", "for", "while", "break", "continue", "return", "switch", "case", "default", "goto",]
    for (let each of control_flow) {
        mapping[`"${each}"`] = [ each, "control", "keyword", ]
    }

    storage_declarations = ["struct", "enum", "union", "class", "namespace" ]
    for(let each of storage_declarations) {
        mapping[`"${each}"`] = [ each, "storage", "keyword" ]
    }

    misc_keywords = ["using", "typedef", "template", "typename" ]
    for (let each in misc_keywords){
        mapping[`"${each}"`] = [ each, "keyword" ]
    }

// 
// Export the mapper
// 
// takes a treeSitterTag as input, returns an array of strings as output
// the array of strings is considered the stdtag output
module.exports = (treeSitterTag, parentScopes) => {
    if (mapping[treeSitterTag]) {
        return mapping[treeSitterTag]
    // if no mapping was found, then just return the treeSitterTag itself
    } else {
        return [ treeSitterTag ]
    }
}