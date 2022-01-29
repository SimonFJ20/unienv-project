import {
    AST,
    BinaryOperationTrait,
    BinaryOperation,
    ExponentationOperation,
    UnaryOperation,
    Block,
    Expression,
    FuncDefStatement,
    FunctionCall,
    Identifier,
    LetInitialization,
    LetDeclaration,
    Literal,
    Locateable,
    ReturnStatement,
    Statement,
    TypedIdentifier,
    TypeSpecifier,
    AssignOperation
} from "./ast";
import { matchPrimitive } from "./utils";

type ValueType = 'void' | 'int' | 'float' |'func';

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

class FloatValue extends Value {
    constructor (public value: number) {
        super('float');
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

const getPrimitive = (type: ValueType) => {
    return matchPrimitive(type, null, [
        ['void', () => new VoidValue()],
        ['int', () => new IntValue(0)],
        ['float', () => new FloatValue(0)],
    ]);
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
        ctx.returnValues.push(new VoidValue());
    }));

    s.set('putint', new FuncValue([param('value', 'int')], new SymbolTable(), type('void'), (ctx) => {
        const value = ctx.symbolTable.get('value');
        if (!value) throw new Error(`punjabi no value`);
        if (value.type !== 'int') throw new Error(`punjabi not an int`);
        process.stdout.write((value as IntValue).value.toString());
        ctx.returnValues.push(new VoidValue());
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
        case 'let_initialization':
            return letInitialization(ctx, node);
        case 'let_declaration':
            return letDeclaration(ctx, node);
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
    const identifier = node.definition.identifier;
    if (ctx.symbolTable.existsLocally(identifier.value))
        return error(ctx, identifier,
            `redeclaration of local function '${ctx.symbolTable.get(identifier.value)}'`);
    const func = new FuncValue(
        node.definition.parameters,
        ctx.symbolTable,
        node.definition.returnType,
        (ctx) => statement(ctx, node.definition.body)
    );
    ctx.symbolTable.set(node.definition.identifier.value, func);
}

const letInitialization = (ctx: Ctx, node: LetInitialization) => {
    const identifier = node.initialization.identifier;
    if (ctx.symbolTable.existsLocally(identifier.value))
        return error(ctx, identifier,
            `redeclaration of local '${ctx.symbolTable.get(identifier.value)}'`);
    const value = expression(ctx, node.initialization.value);
    ctx.symbolTable.set(identifier.value, value);
}

const letDeclaration = (ctx: Ctx, node: LetDeclaration) => {
    const identifier = node.declaration.typedIdentifier.identifier;
    if (ctx.symbolTable.existsLocally(identifier.value))
        return error(ctx, identifier,
            `redeclaration of local '${ctx.symbolTable.get(identifier.value)}'`);
    if (node.declaration.value !== null) {
        const value = expression(ctx, node.declaration.value);
        ctx.symbolTable.set(identifier.value, value);
    } else {
        const type = node.declaration.typedIdentifier.typeSpecifier.identifier.value;
        const valueOfType = getPrimitive(type as ValueType);
        if (!valueOfType)
            return error(ctx, identifier, `vague type '${type}'`);
        ctx.symbolTable.set(identifier.value, valueOfType);
    }
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
            return float(ctx, node);
        case 'unary':
            return unaryOperation(ctx, node);
        case 'exponentation':
            return exponentation(ctx, node);
        case 'mul_div_mod':
        case 'add_sub':
        case 'bitshift':
        case 'comparison':
        case 'bitwise':
        case 'logical':
            return binaryOperation(ctx, node);
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
    return ctx.returnValues.pop()!;
}

const identifier = (ctx: Ctx, node: Identifier): Value => {
    const value = ctx.symbolTable.get(node.value);
    if (!value)
        error(ctx, node, `symbol '${node.value}' is undefined`);
    return value!;
};

const int = (ctx: Ctx, node: Literal): IntValue => {
    const value = parseInt(node.value);
    if (isNaN(value))
        error(ctx, node, `malformed integer literal '${node.value}'`);
    return new IntValue(value);
}

const hex = (ctx: Ctx, node: Literal): IntValue => {
    const value = parseInt(node.value, 16);
    if (isNaN(value))
        error(ctx, node, `malformed integer hex literal '${node.value}'`);
    return new IntValue(value);
}

const ESCAPED_CHARS: {[key: string]: string} = {
    'n': '\n',
    't': '\t',
};
const char = (ctx: Ctx, node: Literal): IntValue => {
    const value = node.value[0] === '\\'
        ? (ESCAPED_CHARS[node.value[1]] ?? node.value[1]).charCodeAt(0)
        : node.value.charCodeAt(0);
    if (value < 0 || value > 255)
        error(ctx, node, `malformed character literal '${node.value}'`);
    return new IntValue(value);
}

const float = (ctx: Ctx, node: Literal): FloatValue => {
    const value = parseInt(node.value);
    if (isNaN(value))
        error(ctx, node, `malformed float literal '${node.value}'`);
    return new FloatValue(value);
}

const unaryOperation = (ctx: Ctx, node: UnaryOperation): Value => {
    const origin = expression(ctx, node.value) as IntValue | FloatValue;
    if (origin.type !== 'int' && origin.type !== 'float')
        error(ctx, node, `cannot perform unary operation on type '${origin.type}'`);
    const value = matchPrimitive(node.operator.type, null, [
        ['log_not', () => origin.value === 0 ? 1 : 0],
        ['bit_not', () => ~origin.value],
        ['plus', () => origin.value],
        ['minus', () => -1 * origin.value],
    ]);
    if (value === null)
        return error(ctx, node, `failed to perform '${node.operator.type}' operation: (${origin.value}) → (${origin.value ? 1 : 0}) £ (${value})`);
    if (origin.type === 'int')
        return new IntValue(Math.floor(value));
    else
        return new FloatValue(value);
}

const exponentation = (ctx: Ctx, node: ExponentationOperation): Value => {
    const left = expression(ctx, node.left) as IntValue | FloatValue;
    const right = expression(ctx, node.right) as IntValue | FloatValue;
    if (left.type !== 'int' && left.type !== 'float')
        error(ctx, node.left, `cannot perform exponentation on type '${left.type}'`);
    if (right.type !== 'int' && right.type !== 'float')
        error(ctx, node.left, `cannot perform exponentation on type '${right.type}'`);
    if (left.type === 'int' && right.type === 'int')
        return new IntValue(Math.floor(left.value ** right.value));
    else
        return new FloatValue(left.value ** right.value);
}

const binaryOperation = (ctx: Ctx, node: BinaryOperation): Value => {
    const left = expression(ctx, node.left) as IntValue | FloatValue;
    const right = expression(ctx, node.right) as IntValue | FloatValue;
    if (left.type !== 'int' && left.type !== 'float')
        error(ctx, node.left, `cannot perform exponentation on type '${left.type}'`);
    if (right.type !== 'int' && right.type !== 'float')
        error(ctx, node.left, `cannot perform exponentation on type '${right.type}'`);
    const value = matchPrimitive(node.operation.type, null, [
        ['multiply',    () => left.value * right.value],
        ['divide',      () => left.value / right.value],
        ['modulus',     () => left.value % right.value],
        ['plus',        () => left.value + right.value],
        ['minus',       () => left.value - right.value],
        ['bit_rights',  () => left.value >> right.value],   // not a mistake
        ['bit_right',   () => left.value >>> right.value],  // ONE swaps '>>' and '>>>' i.r.t. JS
        ['bit_left',    () => left.value << right.value],
        ['cmp_lt',      () => (left.value < right.value) ? 1 : 0],
        ['cmp_gt',      () => (left.value > right.value) ? 1 : 0],
        ['cmp_lte',     () => (left.value <= right.value) ? 1 : 0],
        ['cmp_gte',     () => (left.value <= right.value) ? 1 : 0],
        ['cmp_e',       () => (left.value === right.value) ? 1 : 0],
        ['cmp_ne',      () => (left.value != right.value) ? 1 : 0],
        ['bit_and',     () => left.value && right.value],
        ['bit_or',      () => left.value || right.value],
        ['bit_xor',     () => left.value ^ right.value],
        ['log_and',     () => left.value & right.value],
        ['log_or',      () => left.value | right.value],
    ]);
    if (value === null)
        return error(ctx, node, `failed to perform '${(node.operation)}' operation`);
    if (left.type === 'int' && right.type === 'int')
        return new IntValue(Math.floor(value));
    else
        return new FloatValue(value);
}

// const assignOperation = (ctx: Ctx, node: AssignOperation): Value => {
//     const left = node.left;
//     const right = expression(ctx, node.right) as IntValue | FloatValue;
//     if (right.type !== 'int' && right.type !== 'float')
//         error(ctx, node.left, `cannot perform exponentation on type '${right.type}'`);
//     const vValue = right.type === 'int' ? new IntValue(Math.floor(value)) : new FloatValue()
//     switch (left.type) {
//         default:
//             error(ctx, node.left, `cannot assign value to '${left.type}'`);
//     }
//     return vValue;
// }

// const assignMathOperation = (ctx: Ctx, node: AssignOperation): Value => {
//     const left = node.left;
//     const origin = 1;
//     const right = expression(ctx, node.right) as IntValue | FloatValue;
//     if (right.type !== 'int' && right.type !== 'float')
//         error(ctx, node.left, `cannot perform exponentation on type '${right.type}'`);
//     const value = matchPrimitive(node.operation?.type ?? null, null, [
//         [null,          () => right.value],
//         ['powerof',     () => origin ** right.value],
//         ['multiply',    () => origin * right.value],
//         ['divide',      () => origin / right.value],
//         ['modulus',     () => origin % right.value],
//         ['plus',        () => origin + right.value],
//         ['minus',       () => origin - right.value],
//         ['bit_rights',  () => origin >> right.value],   // not a mistake
//         ['bit_right',   () => origin >>> right.value],  // ONE swaps '>>' and '>>>' i.r.t. JS
//         ['bit_left',    () => origin << right.value],
//         ['bit_and',     () => origin && right.value],
//         ['bit_or',      () => origin || right.value],
//         ['bit_xor',     () => origin ^ right.value],
//         ['log_and',     () => origin & right.value],
//         ['log_or',      () => origin | right.value],
//     ]);
//     if (value === null)
//         return error(ctx, node, `failed to assign '${node.operation?.type}' operation`);
//     const vValue = right.type === 'int' ? new IntValue(Math.floor(value)) : new FloatValue()
//     switch (left.type) {
//         default:
//             error(ctx, node.left, `cannot assign value to '${left.type}'`);
//     }
//     return vValue;
// }
