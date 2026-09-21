import { dialog } from "electron";
import fs from "node:fs/promises"
import type { Dirent } from "node:fs";
import path from "node:path";

type WorkspaceEntry = {
    name: string;
    path: string;
    isDirectory: boolean;
};

const ignoredDirectoryNames = new Set([".git", "node_modules", "dist", "dist-electron"]);

async function readDirectory(directoryPath: string): Promise<WorkspaceEntry[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    return entries
        .map((entry) => ({
            name: entry.name,
            path: path.join(directoryPath, entry.name),
            isDirectory: entry.isDirectory(),
        }))
        .sort((left, right) => {
            if (left.isDirectory !== right.isDirectory) {
                return left.isDirectory ? -1 : 1;
            }

            return left.name.localeCompare(right.name);
        });
}

export async function openWorkspace() {
    try {
        const result = await dialog.showOpenDialog({
            title: "Open Folder",
            properties: ["openDirectory"],
        });

        const rootPath = result.filePaths[0];
        if (result.canceled || !rootPath) {
            return { success: false, canceled: true };
        }

        return {
            success: true,
            rootPath,
            rootName: path.basename(rootPath),
            entries: await readDirectory(rootPath),
        };
    } catch (error) {
        console.error("Could not open workspace:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function readWorkspaceDirectory(directoryPath: string) {
    return readDirectory(directoryPath);
}

export async function findWorkspaceFiles(rootPath: string, query: string) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const files: Array<{ name: string; path: string; relativePath: string }> = [];
    const maxResults = 100;

    async function visit(directoryPath: string): Promise<void> {
        if (files.length >= maxResults) {
            return;
        }

        let entries: Dirent[];
        try {
            entries = await fs.readdir(directoryPath, { withFileTypes: true });
        } catch {
            // Dosyaya erişim izni olmayan klasörler aramayı kesmemelidir.
            return;
        }

        for (const entry of entries) {
            if (files.length >= maxResults) {
                return;
            }

            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                if (!ignoredDirectoryNames.has(entry.name)) {
                    await visit(entryPath);
                }
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            const relativePath = path.relative(rootPath, entryPath);
            if (
                !normalizedQuery ||
                entry.name.toLocaleLowerCase().includes(normalizedQuery) ||
                relativePath.toLocaleLowerCase().includes(normalizedQuery)
            ) {
                files.push({ name: entry.name, path: entryPath, relativePath });
            }
        }
    }

    await visit(rootPath);
    return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export async function searchWorkspaceText(rootPath: string, query: string) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matches: Array<{ path: string; relativePath: string; line: number; preview: string }> = [];
    const maxMatches = 200;

    if (!normalizedQuery) {
        return matches;
    }

    async function visit(directoryPath: string): Promise<void> {
        if (matches.length >= maxMatches) return;

        let entries: Dirent[];
        try {
            entries = await fs.readdir(directoryPath, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (matches.length >= maxMatches) return;
            const entryPath = path.join(directoryPath, entry.name);

            if (entry.isDirectory()) {
                if (!ignoredDirectoryNames.has(entry.name)) await visit(entryPath);
                continue;
            }
            if (!entry.isFile()) continue;

            try {
                const info = await fs.stat(entryPath);
                if (info.size > 1024 * 1024) continue;
                const content = await fs.readFile(entryPath, "utf-8");
                if (content.includes("\0")) continue;
                const relativePath = path.relative(rootPath, entryPath);

                content.split(/\r?\n/).forEach((sourceLine, index) => {
                    if (matches.length < maxMatches && sourceLine.toLocaleLowerCase().includes(normalizedQuery)) {
                        matches.push({
                            path: entryPath,
                            relativePath,
                            line: index + 1,
                            preview: sourceLine.trim(),
                        });
                    }
                });
            } catch {
                // Binary veya erişilemeyen dosyalar atlanır.
            }
        }
    }

    await visit(rootPath);
    return matches;
}

export async function readFile(filePath: string) {
    try {
        return {
            success: true,
            filePath,
            name: path.basename(filePath),
            content: await fs.readFile(filePath, "utf-8"),
        };
    } catch (error) {
        console.error("Could not read file:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function openFile() {
    const result = await dialog.showOpenDialog({
        title: "Open File",
        properties: ["openFile"],
    });

    const filePath = result.filePaths[0];
    if (result.canceled || !filePath) {
        return { success: false, canceled: true };
    }

    return readFile(filePath);
}

export async function projectCreate(projectName: string) {
    try {
        const results = await dialog.showOpenDialog({
            title: "Select Project Location",
            properties: ["openDirectory", "createDirectory"]
        });
        if (results.canceled || !results.filePaths[0]) {
            return {
                success: false,
                canceled: true
            }
        }
        const parentPath = results.filePaths[0];
        const projectPath = path.join(parentPath, projectName);
        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
        await fs.writeFile(
            path.join(projectPath, "src", "index.ts"),
            `console.log("Hello CargoForge");\n`
        );

        await fs.writeFile(
            path.join(projectPath, "package.json"),
            JSON.stringify(
                {
                    name: projectName,
                    version: "1.0.0",
                    type: "module"
                },
                null,
                2
            )
        );
        return {
            success: true,
            projectPath
        };

    } catch (error) {
        console.error("Project creation failed:", error);

        return {
            success: false,
            error: error
        };

    }
}

export async function createNewFile(_: unknown, name: string, extension: string, content?: string) {
    try {

        const result = await dialog.showSaveDialog({
            title: "Create new File",
            defaultPath: `${name}.${extension}`,
        });

        if (result.canceled || !result.filePath) {
            return {
                success: false,
                canceled: true
            };
        }

        const filePath = result.filePath;


        await writeFile(result.filePath, content ?? "");

        return {
            success: true,
            filePath
        };



    } catch (error) {
        console.error(error);

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error"
        };
    }
}


export async function writeFile(filePath: string, content: string) {
    await fs.writeFile(filePath, content, "utf-8");
}
