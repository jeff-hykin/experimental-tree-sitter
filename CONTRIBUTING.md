1. npm install
2. build the languages you want by
  - installing the tree-sitter-cli (globally with npm)
  - installing docker
  - downloading/cloning the repo language you want (search for 'tree-sitter languages')
  - cd into that directory run `tree-sitter build-wasm` (which will generate the wasm file)
  - then copy the wasm file to the `language-parsers/` folder in this repo