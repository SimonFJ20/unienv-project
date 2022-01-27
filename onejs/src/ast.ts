
export type AST = Statement[]

export type Statement = 
    Block | FuncDefStatement | LetStatement | ReturnStatement | ValueStatement

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

export type LetStatement = Locateable & {
    type: 'let_statement',
    declaration: Declaration,
}

export type Declaration = Locateable & {
    type: 'declaration',
    typedIdentifier: TypedIdentifier,
    value: Expression | null,
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
    FunctionCall | UnaryOperation | ExponentationOperation
    | MulDivModOperation | AddSubOperation
    | BitshiftOperation | ComparisonOperation
    | BitWiseOperation | LogicalOperation
    | Identifier | Literal

export type FunctionCall = Locateable & {
    type: 'function_call',
    function: Expression,
    arguments: Expression[],
}

export type UnaryOperation = Locateable & {
    type: 'unary',
    operator: Token<'log_not' | 'bit_not' | 'plus' | 'minus'>,
    value: Expression,
}

export type BinaryOperation =
    MulDivModOperation | AddSubOperation | BitshiftOperation
    | ComparisonOperation | BitWiseOperation| LogicalOperation

export type ExponentationOperation = BinaryOperationTrait & {
    type: 'exponentation',
}

export type MulDivModOperation = BinaryOperationTrait & {
	type: 'mul_div_mod',
	operation: Token<'multiply' | 'divide' | 'modulus'>,
}

export type AddSubOperation = BinaryOperationTrait & {
	type: 'add_sub',
	operation: Token<'plus' | 'minus'>,
}

export type BitshiftOperation = BinaryOperationTrait & {
	type: 'bitshift',
	operation: Token<'bit_rights' | 'bit_right' | 'bit_left'>,
}

export type ComparisonOperation = BinaryOperationTrait & {
	type: 'comparison',
	operation: Token<'cmp_lt' | 'cmp_gt' | 'cmp_lte' | 'cmp_gte' | 'cmp_e' | 'cmp_ne'>,
}

export type BitWiseOperation = BinaryOperationTrait & {
	type: 'bitwise',
	operation: Token<'bit_and' | 'bit_or' | 'bit_xor'>,
}

export type LogicalOperation = BinaryOperationTrait & {
	type: 'logical',
	operation: Token<'log_and' | 'log_or'>,
}

export type BinaryOperationTrait = Locateable & {
    left: Expression,
    right: Expression,
}

export type Identifier = Token<'name'>

export type Literal = Token<'float' | 'hex' | 'int' | 'char' | 'string' | 'name'>

export type Token<T extends TokenType> = Locateable & {
    type: T,
    value: string,
    text: string,
}

export type TokenType = 'nl' | 'ws' | 'comment_sl' | 'comment_ml' | 'float' | 'hex' | 'int' | 'char'
| 'string' | 'name' | 'keyword' | 'dot' | 'lparen' | 'rparen' | 'lbrace'
| 'rbrace' | 'lbracket' | 'rbracket' | 'comma' | 'assign' | OperationType

export type OperationType = 'plus' | 'minus' | 'multiply' | 'powerof' | 'divide' | 'modulus' | 'bit_and' | 'bit_or' | 'bit_xor'
| 'bit_not' | 'cmp_e' | 'cmp_ne' | 'cmp_lte' | 'cmp_gte' | 'cmp_lt' | 'cmp_gt'
| 'log_not' | 'log_and' | 'log_or' | 'qmark' | 'colon'
| 'bit_rights' | 'bit_right' | 'bit_left'

export type Locateable = {
    offset: number,
    lineBreaks: number,
    line: number,
    col: number,
}
