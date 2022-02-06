
export type AST = Statement[]

export type Statement = 
    Block | FuncDefStatement | LetInitialization | LetDeclaration | ReturnStatement | ValueStatement

export type Block = Locateable & {
    type: 'block',
    body: Statement[],
}

export type StructDef = Locateable & {
    type: 'struct_def',
    identifier: Identifier,
    fields: TypedIdentifier[],
}

export type MethodDef = Locateable & {
    type: 'method_def',
    structIdentifier: TypedIdentifier,
    definition: FunctionDefinition,
}

export type ConstructorDef = Locateable & {
    type: 'constructor_def',
    definition: FunctionDefinition,
}

export type DestructorDef = Locateable & {
    type: 'destructor_def',
    definition: FunctionDefinition,
}

export type StructOperatorDef = Locateable & {
    type: 'struct_operator_def',
    operator: Token<OperationType>,
    definition: FunctionDefinition,
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

export type ForCondition = Locateable & {
    type: 'for_condition',
    declaration: Statement,
    condition: Expression,
    increment: Statement,
    body: Statement,
}

export type ForIterator = Locateable & {
    type: 'for_iterator',
    iteration: Identifier,
    iterator: Expression,
    body: Statement,
}

export type WhileStatement = Locateable & {
    type: 'while_statement',
    condition: Expression,
    body: Statement,
}

export type IfElseStatement = Locateable & {
    type: 'if_else_statement',
    condition: Expression,
    truthy: Statement,
    falsy: Statement,
}

export type IfStatement = Locateable & {
    type: 'if_statement',
    condition: Expression,
    body: Statement,
}

export type LetInitialization = Locateable & {
    type: 'let_initialization',
    initialization: Initialization,
}

export type Initialization = Locateable & {
    type: 'initialization',
    identifier: Identifier,
    value: Expression,
}

export type LetDeclaration = Locateable & {
    type: 'let_declaration',
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
    InlineFunction | ObjectLiteral | ArrayLiteral
    | FunctionCall | UnaryOperation | ExponentationOperation
    | MulDivModOperation | AddSubOperation
    | BitshiftOperation | ComparisonOperation
    | BitWiseOperation | LogicalOperation
    | AssignOperation
    | Identifier | Literal

export type MemberAccess = Locateable & {
    type: 'member_access',
    parent: Expression,
    identifier: Identifier,
}

export type Indexing = Locateable & {
    type: 'indexing',
    parent: Expression,
    index: Expression,
}

export type InlineFunction = Locateable & {
    type: 'inline_function',
    parameters: TypedIdentifier[],
    returnType: TypeSpecifier | null,
    value: Expression,
}

export type ObjectConstructor = Locateable & {
    type: 'object_constructor',
    struct: Identifier,
    pairs: KeyValuePair[],
}

export type ObjectLiteral = Locateable & {
    type: 'object_literal',
    pairs: KeyValuePair[],
}

export type KeyValuePair = Locateable & {
    type: 'keyvaluepair',
    key: Identifier,
    value: Expression,
}

export type ArrayLiteral = Locateable & {
    type: 'array_literal',
    values: Expression[],
}

export type New = Locateable & {
    type: 'new',
    source: Expression,
}

export type FunctionCall = Locateable & {
    type: 'function_call',
    function: Expression,
    arguments: Expression[],
}

export type Delete = Locateable & {
    type: 'delete',
    source: Expression,
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

export type AssignOperation = BinaryOperationTrait & {
    type: 'assign',
    operation: Token<'plus' | 'minus' | 'multiply' | 'powerof'
        | 'divide' | 'modulus' | 'bit_and' | 'bit_or'
        | 'bit_xor' | 'log_and' | 'log_or' | 'qmark'
        | 'colon' | 'bit_rights' | 'bit_right' | 'bit_left'> | null
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

export type OperationType = 'plus' | 'minus' | 'multiply' | 'powerof' | 'divide'
    | 'modulus' | 'bit_and' | 'bit_or' | 'bit_xor'
    | 'bit_not' | 'cmp_e' | 'cmp_ne' | 'cmp_lte' | 'cmp_gte' | 'cmp_lt' | 'cmp_gt'
    | 'log_not' | 'log_and' | 'log_or' | 'qmark' | 'colon'
    | 'bit_rights' | 'bit_right' | 'bit_left'

export type Locateable = {
    offset: number,
    lineBreaks: number,
    line: number,
    col: number,
}
