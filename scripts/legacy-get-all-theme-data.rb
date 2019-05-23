# 
# 
# Dont run this code, I'm just keeping this here encase I need modify it later to get theme data
# 
# 

theme_locations = ["theme-seti/icons/vs-seti-icon-theme.json", "theme-monokai/themes/monokai-color-theme.json", "theme-red/themes/Red-color-theme.json", "theme-abyss/themes/abyss-color-theme.json", "theme-quietlight/themes/quietlight-color-theme.json", "theme-solarized-dark/themes/solarized-dark-color-theme.json", "theme-tomorrow-night-blue/themes/tomorrow-night-blue-theme.json", "theme-solarized-light/themes/solarized-light-color-theme.json", "theme-defaults/fileicons/vs_minimal-icon-theme.json", "theme-defaults/themes/dark_vs.json", "theme-defaults/themes/dark_defaults.json", "theme-defaults/themes/light_vs.json", "theme-defaults/themes/hc_black.json", "theme-defaults/themes/dark_plus.json", "theme-defaults/themes/light_defaults.json", "theme-defaults/themes/hc_black_defaults.json", "theme-defaults/themes/light_plus.json", "theme-monokai-dimmed/themes/dimmed-monokai-color-theme.json", "theme-kimbie-dark/themes/kimbie-dark-color-theme.json",]
# index = 0
# super_object = {}
# for each in theme_locations
#     path = '/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/'+each
#     name = `basename '#{path}'`.chomp
#     json_object = JSON.parse(File.read(path))
#     super_object[name] = json_object
# end

super_object =  YAML.load_file("/Users/jeffhykin/Desktop/themes.json")
all_scopes = {}
names = {}
for each_theme in super_object.keys
    # if its a normal theme
    if super_object[each_theme]["tokenColors"]
        for each_section in super_object[each_theme]["tokenColors"]
            if each_section["scope"]
                color = nil
                if each_section["settings"] != nil
                    color = each_section["settings"]["foreground"]
                end
                if each_section["scope"].is_a? Array
                    for each in each_section["scope"]
                        for each_name in each.split(/,/)
                            all_scopes[each_name.strip] = color
                        end
                    end
                elsif each_section["scope"].is_a? String
                    for each_name in each_section["scope"].split(/,/)
                        all_scopes[each_name.strip] = color
                    end
                end
            end
        end
    end
end

sorted = all_scopes.sort_by { |k, v| k }
new_scopes = {}
for each in sorted
    new_scopes[each[0]] = each[1]
end
all_scopes = new_scopes

for each in all_scopes.keys
    each = each.gsub( /\(|\)/, " ").gsub(/\s+/, " ")
    for each_name in each.split(/[\s\.,]+/)
        if each_name == ""
            puts "each is: #{each} "
        end
        names[each_name] = 0 if names[each_name] == nil
        names[each_name] += 1
    end
end

sorted = names.sort_by { |k,v| v }
new_names = {}
for each in sorted
    new_names[each[0]] = each[1]
end
names = new_names

File.open('/Users/jeffhykin/Desktop/scopes.yaml', 'w') do |file|
  file.write(all_scopes.to_yaml)
end

