
export type AST = Statement[]

export type Statement = 
    Block | FuncDefStatement | ReturnStatement | ValueStatement

export type Block = Locateable & {
    type: 'block',
    body: Statement[],
}

export type FuncDefStatement = Locateable & {
    type: 'func_def_statement',
    definition: FunctionDefinition,
}

export type FunctionDefinition = Locateable & {
    type: 'function_definition',
    identifier: Identifier,
    parameters: TypedIdentifier[],
    returnType: TypeSpecifier,
    body: Statement,
}

export type TypedIdentifier = Locateable & {
    type: 'typed_identifier',
    identifier: Identifier,
    typeSpecifier: TypeSpecifier,
}

export type TypeSpecifier = Locateable & {
    type: 'type_specifier',
    identifier: Identifier,
}

export type ReturnStatement = Locateable & {
    type: 'return_statement',
    value: Expression,
}

export type ValueStatement = Locateable & {
    type: 'value_statement',
    value: Expression,
}

export type Expression =
    FunctionCall | Identifier| Literal

export type FunctionCall = Locateable & {
    type: 'function_call',
    function: Expression,
    arguments: Expression[],
}

// export type UnaryOperation = Locateable & {
//     type: 'unary_operation',
//     operator: Token<'log_not' | 'bit_not' | 'plus' | 'minus'>,
//     value: Expression,
// }

export type Identifier = Token<'name'>

export type Literal = Token<'float' | 'hex' | 'int' | 'char' | 'string' | 'name'>

export type Token<T extends 'nl' | 'ws' | 'comment_sl' | 'comment_ml' | 'float' | 'hex' | 'int' | 'char'
| 'string' | 'name' | 'keyword' | 'dot' | 'lparen' | 'rparen' | 'lbrace'
| 'rbrace' | 'lbracket' | 'rbracket' | 'comma' | 'assign' | 'plus' | 'minus'
| 'multiply' | 'powerof' | 'divide' | 'modulus' | 'bit_and' | 'bit_or' | 'bit_xor'
| 'bit_not' | 'cmp_e' | 'cmp_ne' | 'cmp_lte' | 'cmp_gte' | 'cmp_lt' | 'cmp_gt'
| 'log_not' | 'log_and' | 'log_or' | 'qmark' | 'colon'> = Locateable & {
    type: T,
    value: string,
    text: string,
}

export type Locateable = {
    offset: number,
    lineBreaks: number,
    line: number,
    col: number,
}
