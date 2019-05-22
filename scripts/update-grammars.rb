Dir.chdir __dir__
def download(input_1=nil, from:nil, url:nil, as:nil)
    # can do 
        # download 'www.mywebsite.com/thing.txt' as:'blah.txt'

    require 'open-uri'
    # argument checking 
        # if only one argument, either input_1 or url
        if ((input_1!=nil) != (url!=nil)) && (from==nil) && (as==nil)
            # this covers:
            #    download     'site.com/file'
            the_url = url || input_1
            file_name = the_url.match /(?<=\/)[^\/]+\z/ 
            file_name = file_name[0]
        elsif (as != nil) && ((input_1!=nil)!=(url!=nil))
            # this covers:
            #    download     'site.com/file' as:'file'
            #    download url:'site.com/file' as:'file'
            the_url = url || input_1
            file_name = as
        elsif ((from!=nil) != (url!=nil)) && input_1!=nil
            # this covers:
            #    download 'file' from:'site.com/file'
            #    download 'file'  url:'site.com/file'
            the_url = from || url
            file_name = input_1
        else
            message_ = "I'm not sure how you're using the download function.\n"
            message_ << "Please use one of the following methods:\n"
            message_ << "    download     'site.com/file'\n"
            message_ << "    download     'site.com/file', as:'file'\n"
            message_ << "    download url:'site.com/file', as:'file'\n"
            message_ << "    download 'file', from:'site.com/file'\n"
            message_ << "    download 'file',  url:'site.com/file'\n"
            raise message_
        end#if
    #end argument checking

    # actually download the file
    open(file_name, 'wb') do |file|
        file << open(the_url).read
    end#file
end#download



download("https://raw.githubusercontent.com/atom/language-c/master/grammars/tree-sitter-c.cson", as: "../language-grammars/c.cson")
download("https://raw.githubusercontent.com/atom/language-c/master/grammars/tree-sitter-cpp.cson", as: "../language-grammars/cpp.cson")
download("https://raw.githubusercontent.com/atom/language-ruby/master/grammars/tree-sitter-ruby.cson", as: "../language-grammars/ruby.cson")
download("https://raw.githubusercontent.com/atom/language-java/master/grammars/tree-sitter-java.cson", as: "../language-grammars/java.cson")
download("https://raw.githubusercontent.com/atom/language-html/master/grammars/tree-sitter-html.cson", as: "../language-grammars/html.cson")
download("https://raw.githubusercontent.com/atom/language-css/master/grammars/tree-sitter-css.cson", as: "../language-grammars/css.cson")
download("https://raw.githubusercontent.com/atom/language-php/master/grammars/tree-sitter-php.cson", as: "../language-grammars/php.cson")
download("https://raw.githubusercontent.com/atom/language-typescript/master/grammars/tree-sitter-typescript.cson", as: "../language-grammars/typescript.cson")
download("https://raw.githubusercontent.com/atom/language-go/master/grammars/tree-sitter-go.cson", as: "../language-grammars/go.cson")
download("https://raw.githubusercontent.com/atom/language-python/master/grammars/tree-sitter-python.cson", as: "../language-grammars/python.cson")


# download("https://raw.githubusercontent.com/atom/language-json/master/grammars/tree-sitter-json.cson", as: "../language-grammars/json.cson")