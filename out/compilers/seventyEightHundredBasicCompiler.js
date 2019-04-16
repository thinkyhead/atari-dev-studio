"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", "7800basic", [".bas", ".78b"], path.join(application.Path, "out", "bin", "compilers", "7800basic"), "A7800");
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "7800bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./7800basic.sh";
            }
            // Compiler options
            let command = path.join(this.FolderOrPath, commandName);
            let args = [
                `"${this.FileName}"`,
                this.Args
            ];
            // Compiler environment
            let env = {};
            env["PATH"] = this.FolderOrPath;
            if (application.IsLinux || application.IsMacOS) {
                // Additional for Linux or MacOS
                env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
            }
            env["bB"] = this.FolderOrPath;
            // Notify
            // Linux and macOS script has this message already
            if (application.IsWindows)
                application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`);
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            this.IsRunning = false;
            // Validate
            if (!executeResult)
                return false;
            // Finalise
            let result = yield this.VerifyCompiledFileSizeAsync();
            if (result)
                result = yield this.RemoveCompilationFilesAsync();
            if (result)
                result = yield this.MoveFilesToBinFolderAsync();
            // Result
            return result;
        });
    }
    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:SeventyEightHundredBasicCompiler.LoadConfiguration');  
    //     // Base
    //     if (!super.LoadConfiguration()) return false;
    //     // Result
    //     return true;
    // }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, '7800basic.sh'));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800basic.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800filter.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800header.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800optimize.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800postprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800preprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `dasm.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `distella.${architecture}.x86`));
            return result;
        });
    }
    RemoveCompilationFilesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');
            // Notify
            application.Notify(`Cleaning up files generated during compilation...`);
            // // Language specific files
            // if (this.CleanUpCompilationFiles)  {
            //     // Process
            //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
            //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`bB.asm`));
            //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`includes.bB`));
            //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`2600basic_variable_redefs.h`));
            // }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by bB (cannot change I believe)
            if (!this.GenerateDebuggerFiles) {
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            }
            // Result
            return true;
        });
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map