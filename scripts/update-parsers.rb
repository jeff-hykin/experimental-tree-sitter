# 
# summary
# 
    # this script is for CONVENIENCE
    # its very inefficient, but it does get the job done
    
require "yaml"

Dir.chdir __dir__ # go to where this file is (instead of where its being executed from)

@info = YAML.load_file("../info.yaml")

# overwrite the system function
def system(command)
    output = Process.wait(Process.spawn(command))
    if $?.exitstatus != 0
        raise "system command ended with error"
    end
    return output
end
for each in @info["supported_languages"]
    puts "each is: #{each} "
    # system "cd ../node_modules/tree-sitter-#{each} && npm install && tree-sitter generate && tree-sitter build-wasm && cd -"
    system "cd ../node_modules/tree-sitter-#{each} && tree-sitter build-wasm && cd -"
end

for each in @info["supported_languages"]
    system "cp ../node_modules/tree-sitter-#{each}/tree-sitter-#{each}.wasm ../language-parsers/#{each}.wasm"
end