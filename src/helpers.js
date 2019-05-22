const fs = require("fs")
const path = require("path")
const { promisify } = require('util')


let getFiles = async function(dir) {
    const readdir = promisify(fs.readdir)
    const stat    = promisify(fs.stat)
    const subdirs = await readdir(dir)
    const files   = await Promise.all(
        subdirs.map(async subdir => {
            const res = path.resolve(dir, subdir)
            return (await stat(res)).isDirectory() ? getFiles(res) : res
        })
    )
    return files.reduce((a, f) => a.concat(f), [])
}