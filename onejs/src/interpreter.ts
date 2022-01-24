import { AST, Block, Expression, FuncDefStatement, FunctionCall, Identifier, Literal, Locateable, ReturnStatement, Statement, TypedIdentifier, TypeSpecifier } from "./ast";
import { matchPrimitive } from "./utils";

type ValueType = 'void' | 'int' |'func';

abstract class Value {
    constructor (public type: ValueType) {}
}

class VoidValue extends Value {
    constructor () {
        super('void');
    }
}
class IntValue extends Value {
    constructor (public value: number) {
        super('int');
    }
}

class FuncValue extends Value {
    constructor (
        public arguements: TypedIdentifier[],
        public definitionSymbols: SymbolTable,
        public returnValue: TypeSpecifier,
        public execute: (callCtx: Ctx) => void,
    ) {
        super('func');
    }
}

class SymbolTable {
    public symbols: {[key: string]: Value};
    
    constructor (public parent?: SymbolTable) {
        this.symbols = {};
    }

    public get(identifier: string): Value | null {
        return this.symbols[identifier]
            ?? this.parent?.get(identifier)
            ?? null;
    }

    public set(identifier: string, value: Value) {
        this.symbols[identifier] = value;
    }

    public existsLocally(identifier: string) {
        return (this.symbols[identifier] ?? null) !== null;
    }
}

const builtins = (): SymbolTable => {

    const unlocateable = (): Locateable => ({
        col: 0,
        line: 0,
        lineBreaks: 0,
        offset: 0,
    });

    const iden = (name: string): Identifier => ({
        type: 'name',
        value: name,
        text: name,
        ...unlocateable(),
    });

    const param = (name: string, type: string): TypedIdentifier => ({
        type: 'typed_identifier',
        identifier: iden(name),
        typeSpecifier: {
            type: 'type_specifier',
            identifier: iden(type),
            ...unlocateable(),
        },
        ...unlocateable(),
    });

    const type = (type: string): TypeSpecifier => ({
        type: 'type_specifier',
        identifier: iden(type),
        ...unlocateable(),
    });

    const s = new SymbolTable();

    s.set('putchar', new FuncValue([param('value', 'int')], new SymbolTable(), type('void'), (ctx) => {
        const value = ctx.symbolTable.get('value');
        if (!value) throw new Error(`punjabi no value`);
        if (value.type !== 'int') throw new Error(`punjabi not an int`);
        process.stdout.write(String.fromCharCode((value as IntValue).value));
    }));

    s.set('doubleIt', new FuncValue([param('value', 'int')], new SymbolTable(), type('int'), (ctx) => {
        const value = ctx.symbolTable.get('value') as IntValue;
        if (!value) throw new Error(`punjabi no value`);
        if (value.type !== 'int') throw new Error(`punjabi not an int`);
        ctx.returnValues.push(new IntValue(value.value * 2));
    }));

    return s;
}

type Ctx = {
    filename: string,
    symbolTable: SymbolTable,
    returnValues: Value[],
    shouldReturn: boolean,
};

export const evaluate = (nodes: AST, filename?: string) => {
    statements({
        filename: filename ?? '<file>',
        symbolTable: new SymbolTable(builtins()),
        returnValues: [],
        shouldReturn: false,
    }, nodes);
}

const error = (ctx: Ctx, node: Locateable, msg: string) => {
    console.error(msg);
    console.error(`  at ${ctx.filename}:${node.line}:${node.col}`);
    process.exit(1);
}

const statements = (ctx: Ctx, nodes: Statement[]) => {
    for (const node of nodes)
        if (ctx.shouldReturn)
            break;
        else
            statement(ctx, node);
}

const statement = (ctx: Ctx, node: Statement) => {
    switch (node.type) {
        case 'block':
            return block(ctx, node);
        case 'func_def_statement':
            return funcDefStatement(ctx, node);
        case 'return_statement':
            return returnStatement(ctx, node);
        case 'value_statement':
            return expression(ctx, node.value);
        default:
            return error(ctx, node, `statement type '${(node as any).type}' not implemented`);
    }
}

const block = (ctx: Ctx, node: Block) => {
    statements({...ctx, symbolTable: new SymbolTable(ctx.symbolTable)}, node.body);
}

const funcDefStatement = (ctx: Ctx, node: FuncDefStatement) => {
    if (ctx.symbolTable.existsLocally(node.definition.identifier.value))
        return error(ctx, node.definition.identifier,
            `redeclaration of local function '${ctx.symbolTable.get(node.definition.identifier.value)}'`);
    const func = new FuncValue(
        node.definition.parameters,
        ctx.symbolTable,
        node.definition.returnType,
        (ctx) => statement(ctx, node.definition.body)
    );
    ctx.symbolTable.set(node.definition.identifier.value, func);
}

const returnStatement = (ctx: Ctx, node: ReturnStatement) => {
    const value = expression(ctx, node.value);
    ctx.returnValues.push(value);
    ctx.shouldReturn = true;
}

const expression = (ctx: Ctx, node: Expression): Value => {
    switch (node.type) {
        case 'function_call': 
            return functionCall(ctx, node);
        case 'name':
            return identifier(ctx, node as Identifier);
        case 'int':
            return int(ctx, node);
        case 'hex':
            return hex(ctx, node);
        case 'char':
            return char(ctx, node);
        case 'float':
        case 'string':   
        default:
            return error(ctx, node, `expression type '${node.type}' not implemented`);   
    }
}

const functionCall = (ctx: Ctx, node: FunctionCall): Value => {
    const func = expression(ctx, node.function) as FuncValue;
    if (func.type !== 'func')
        error(ctx, node, `value '${node.function}' is not call-able`);
    if (func.arguements.length > node.arguments.length)
        error(ctx, node, `too few arguments`);
    if (func.arguements.length < node.arguments.length)
        error(ctx, node, `too many arguments`);
    const callSymbols = new SymbolTable((func as FuncValue).definitionSymbols);
    for (const i in func.arguements)
        callSymbols.set(func.arguements[i].identifier.value, expression(ctx, node.arguments[i]));
    func.execute({...ctx, symbolTable: callSymbols});
    if (func.returnValue.identifier.value === 'void')
        return new VoidValue();
    else
        return ctx.returnValues.pop()!;
}

const identifier = (ctx: Ctx, node: Identifier): Value => {
    const value = ctx.symbolTable.get(node.value);
    if (!value)
        error(ctx, node, `symbol '${node.value}' is undefined`);
    return value!;
};

const int = (ctx: Ctx, node: Literal) => {
    const value = parseInt(node.value);
    if (isNaN(value))
        error(ctx, node, `malformed integer literal '${node.value}'`);
    return new IntValue(value);
}

const hex = (ctx: Ctx, node: Literal) => {
    const value = parseInt(node.value, 16);
    if (isNaN(value))
        error(ctx, node, `malformed integer hex literal '${node.value}'`);
    return new IntValue(value);
}

const ESCAPED_CHARS: {[key: string]: string} = {
    'n': '\n',
    't': '\t',
};
const char = (ctx: Ctx, node: Literal) => {
    const value = node.value[0] === '\\'
        ? (ESCAPED_CHARS[node.value[1]] ?? node.value[1]).charCodeAt(0)
        : node.value.charCodeAt(0);
    if (value < 0 || value > 255)
        error(ctx, node, `malformed character literal '${node.value}'`);
    return new IntValue(value);
}
