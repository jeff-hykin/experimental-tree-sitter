# What is this?
This repo is a central location for tracking the progress of the Tree-Sitter implementations for VS Code. The issues are kept up to date with different developments, and can be used as a place for discussion and problem solving.

The codebase is used as an example implementation of a tree sitter, but it is not the "official-unofficial" implementation of the tree sitter.

# Whats the current status?: Pre-alpha
The only major theme supported is the stock VS Code theme, and the only supported languages are C++, C, Typescript, and Go. Only a select few Tree-Sitter scopes are being used, and they are being used in conjunction with (rather than as a replacement for) the extisting TextMate Scopes. The currenly the coloring of the Tree Sitter scopes is currently also much slower than the 
coloring of the TextMate scopes.

# Timeline
It will be awhile, likely late ~August 2019~ at this rate it'll be August 2022, before the next major improvement.


# Goals
Have a VS Code extension that
- works with all themes
- provides objectively improved coloration of code (a superset-improvement)
- replaces/disables TextMate Parsing (for less CPU usage)
- provides faster coloring than the TextMate coloration
- makes theme-making easier
