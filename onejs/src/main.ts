import { readFile, writeFile } from "fs/promises";
import { evaluate } from "./interpreter";
import { parse } from "./parser";

const hasFunction = (args: string[]) => (...elements: string[]) => {
    return elements.some(v => args.includes(v));
}

const getArgsFromArgv = (argv: string[]): string[] => {
    return argv.slice(2).filter(arg => /\-/.test(arg));
}

const printHelpMessage = () => {
    console.log([
        'ONEJS Interpreter and Compiler',
        'Usage: onejscli [options] file',
        'Options:',
        '  --help, -?\tPrint this message and exit',
        '  --version, -v\tPrint version details and exit',
        '  --compile, -c\tCompile file to X86-64 FASM assembly',
        '  --run, -r\tRun file',
        '  --ast, -r\tEmit AST',
    ].join('\n'));
}

const printVersionMessage = () => {
    console.log([
        'ONEJS Interpreter and Compiler',
        '  A Typescript implementation of ONE',
        'Development version'
    ].join('\n'));
}

const getFileFromArgv = (argv: string[]): string => {
    const filename = argv.slice(2).find(arg => !/\-/.test(arg));
    if (!filename) {
        console.error('fatal: no input file');
        process.exit(1);
    }
    return filename;
}

const getTextFromFile = async (filename: string): Promise<string> => {
    try {
        const file = await readFile(filename);
        return file.toString();
    } catch (catched) {
        if (!(catched instanceof Error)) throw catched;
        const error = catched as Error & {
            errno: number,
            code: string,
            syscall: string,
            path: string,
        };
        if (error.code === 'ENOENT') {
            console.log(`fatal: could not open file '${error.path}'`);
        }
        process.exit(1);
    }
}

const main = async () => {
    const args = getArgsFromArgv(process.argv);
    const has = hasFunction(args);

    if (has('--help', '-?')) {
        printHelpMessage();
        return process.exit(0);
    }

    if (has('--version', '-v')) {
        printVersionMessage();
        return process.exit(0);
    }

    const filename = getFileFromArgv(process.argv);
    const text = await getTextFromFile(filename);
    const ast = parse(text);

    if (has('--ast')) {
        await writeFile('ast.gen.json', JSON.stringify(ast, null, 2));
    }

    if (has('--compile', '-c')) {
        console.log('fatal: please implement before using');
        process.exit(1);
    }

    if (has('--run', '-r')) {
        console.log('**NOT FULLY IMPLEMENTED**');
        evaluate(ast, filename);
    }

}

main().catch((catched) => console.error(catched));
