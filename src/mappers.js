import { readdirSync } from "fs"

// import all the mappers
let mappers = {}
for (const file of readdirSync("./mappers")) {
    const key = `map${file[0].toUpperCase()}${file.slice(1)}`
    mappers[key] = require("./mappers/"+file)
}

export default mappers