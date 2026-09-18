import { spawn } from "node:child_process"
export const terminalRun = (_: unknown, code: string) => {
    return new Promise((resolve) => {
        const child = spawn(
            "node",
            ["-e", code]);
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (exitCode) => {
            resolve({
                stdout,
                stderr,
                exitCode
            });
        });

    })
    return true

}