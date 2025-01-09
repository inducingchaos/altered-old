/**
 *
 */

import { readdir, unlink, writeFile } from "fs/promises"
import { join } from "path"

async function stabilize(targetDir: string = "./src"): Promise<void> {
    const processDirectory = async (dir: string): Promise<void> => {
        const entries = await readdir(dir, { withFileTypes: true })
        const files = entries.filter(e => e.isFile()).map(e => e.name)
        const dirs = entries.filter(e => e.isDirectory())

        //  Add .gitkeep to empty directories.

        if (files.length === 0 && dirs.length === 0) {
            await writeFile(join(dir, ".gitkeep"), "")
            console.log(`Added '.gitkeep' to '${dir}'`)
        }

        //  Remove .gitkeep from non-empty directories.

        if (files.includes(".gitkeep") && (files.length > 1 || dirs.length > 0)) {
            await unlink(join(dir, ".gitkeep"))
            console.log(`Removed '.gitkeep' from '${dir}'`)
        }

        //  Recursively process subdirectories.

        for (const subdir of dirs) {
            await processDirectory(join(dir, subdir.name))
        }
    }

    await processDirectory(targetDir)
}

stabilize().catch(console.error)
