import { dialog } from "electron";
import fs from "node:fs/promises"
import path from "node:path";

type WorkspaceEntry = {
    name: string;
    path: string;
    isDirectory: boolean;
};

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
