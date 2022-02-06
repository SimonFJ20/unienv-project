
export type AST = StatementNode[]

export type StatementNode = 
    BlockNode | StructDefNode | MethodDefNode | ConstructorDefNode | DestructorDefNode | DestructorDefNode
    | StructOperatorDefNode | ForConditionNode | ForIteratorNode | WhileStatementNode | IfElseStatementNode | IfStatementNode
    | FuncDefStatementNode | LetInitializationNode | LetDeclarationNode | ReturnStatementNode | ValueStatementNode

export type BlockNode = Locateable & {
    type: 'block',
    body: StatementNode[],
}

export type StructDefNode = Locateable & {
    type: 'struct_def',
    identifier: Identifier,
    fields: TypedIdentifierNode[],
}

export type MethodDefNode = Locateable & {
    type: 'method_def',
    structIdentifier: TypedIdentifierNode,
    definition: FunctionDefinitionNode,
}

export type ConstructorDefNode = Locateable & {
    type: 'constructor_def',
    definition: FunctionDefinitionNode,
}

export type DestructorDefNode = Locateable & {
    type: 'destructor_def',
    definition: FunctionDefinitionNode,
}

export type StructOperatorDefNode = Locateable & {
    type: 'struct_operator_def',
    operator: Token<OperationType>,
    definition: FunctionDefinitionNode,
}

export type FuncDefStatementNode = Locateable & {
    type: 'func_def_statement',
    definition: FunctionDefinitionNode,
}

export type FunctionDefinitionNode = Locateable & {
    type: 'function_definition',
    identifier: Identifier,
    parameters: TypedIdentifierNode[],
    returnType: TypeSpecifierNode,
    body: StatementNode,
}

export type ForConditionNode = Locateable & {
    type: 'for_condition',
    declaration: StatementNode,
    condition: ExpressionNode,
    increment: StatementNode,
    body: StatementNode,
}
 
export type ForIteratorNode = Locateable & {
    type: 'for_iterator',
    iteration: Identifier,
    iterator: ExpressionNode,
    body: StatementNode,
}

export type WhileStatementNode = Locateable & {
    type: 'while_statement',
    condition: ExpressionNode,
    body: StatementNode,
}

export type IfElseStatementNode = Locateable & {
    type: 'if_else_statement',
    condition: ExpressionNode,
    truthy: StatementNode,
    falsy: StatementNode,
}

export type IfStatementNode = Locateable & {
    type: 'if_statement',
    condition: ExpressionNode,
    body: StatementNode,
}

export type LetInitializationNode = Locateable & {
    type: 'let_initialization',
    initialization: InitializationNode,
}

export type InitializationNode = Locateable & {
    type: 'initialization',
    identifier: Identifier,
    value: ExpressionNode,
}

export type LetDeclarationNode = Locateable & {
    type: 'let_declaration',
    declaration: DeclarationNode,
}

export type DeclarationNode = Locateable & {
    type: 'declaration',
    typedIdentifier: TypedIdentifierNode,
    value: ExpressionNode | null,
}

export type TypedIdentifierNode = Locateable & {
    type: 'typed_identifier',
    identifier: Identifier,
    typeSpecifier: TypeSpecifierNode,
}

export type TypeSpecifierNode = Locateable & {
    type: 'type_specifier',
    identifier: Identifier,
}

export type ReturnStatementNode = Locateable & {
    type: 'return_statement',
    value: ExpressionNode,
}

export type ValueStatementNode = Locateable & {
    type: 'value_statement',
    value: ExpressionNode,
}

export type ExpressionNode =
    MemberAccessNode | IndexingNode | InlineFunctionNode
    | ObjectLiteralNode | ObjectConstructorNode | ArrayLiteralNode | NewNode
    | FunctionCallNode| DeleteNode | UnaryOperationNode | ExponentationOperationNode
    | MulDivModOperationNode | AddSubOperationNode
    | BitshiftOperationNode | ComparisonOperationNode
    | BitWiseOperationNode | LogicalOperationNode
    | AssignOperationNode
    | Identifier | Literal

export type MemberAccessNode = Locateable & {
    type: 'member_access',
    parent: ExpressionNode,
    identifier: Identifier,
}

export type IndexingNode = Locateable & {
    type: 'indexing',
    parent: ExpressionNode,
    index: ExpressionNode,
}

export type InlineFunctionNode = Locateable & {
    type: 'inline_function',
    parameters: TypedIdentifierNode[],
    returnType: TypeSpecifierNode | null,
    value: ExpressionNode,
}

export type ObjectConstructorNode = Locateable & {
    type: 'object_constructor',
    struct: Identifier,
    pairs: KeyValuePairNode[],
}

export type ObjectLiteralNode = Locateable & {
    type: 'object_literal',
    pairs: KeyValuePairNode[],
}

export type KeyValuePairNode = Locateable & {
    type: 'keyvaluepair',
    key: Identifier,
    value: ExpressionNode,
}

export type ArrayLiteralNode = Locateable & {
    type: 'array_literal',
    values: ExpressionNode[],
}

export type NewNode = Locateable & {
    type: 'new',
    source: ExpressionNode,
}

export type FunctionCallNode = Locateable & {
    type: 'function_call',
    function: ExpressionNode,
    arguments: ExpressionNode[],
}

export type DeleteNode = Locateable & {
    type: 'delete',
    source: ExpressionNode,
}

export type UnaryOperationNode = Locateable & {
    type: 'unary',
    operator: Token<'log_not' | 'bit_not' | 'plus' | 'minus'>,
    value: ExpressionNode,
}

export type BinaryOperationNode =
    MulDivModOperationNode | AddSubOperationNode | BitshiftOperationNode
    | ComparisonOperationNode | BitWiseOperationNode| LogicalOperationNode

export type ExponentationOperationNode = BinaryOperationTrait & {
    type: 'exponentation',
}

export type MulDivModOperationNode = BinaryOperationTrait & {
	type: 'mul_div_mod',
	operation: Token<'multiply' | 'divide' | 'modulus'>,
}

export type AddSubOperationNode = BinaryOperationTrait & {
	type: 'add_sub',
	operation: Token<'plus' | 'minus'>,
}

export type BitshiftOperationNode = BinaryOperationTrait & {
	type: 'bitshift',
	operation: Token<'bit_rights' | 'bit_right' | 'bit_left'>,
}

export type ComparisonOperationNode = BinaryOperationTrait & {
	type: 'comparison',
	operation: Token<'cmp_lt' | 'cmp_gt' | 'cmp_lte' | 'cmp_gte' | 'cmp_e' | 'cmp_ne'>,
}

export type BitWiseOperationNode = BinaryOperationTrait & {
	type: 'bitwise',
	operation: Token<'bit_and' | 'bit_or' | 'bit_xor'>,
}

export type LogicalOperationNode = BinaryOperationTrait & {
	type: 'logical',
	operation: Token<'log_and' | 'log_or'>,
}

export type AssignOperationNode = BinaryOperationTrait & {
    type: 'assign',
    operation: Token<'plus' | 'minus' | 'multiply' | 'powerof'
        | 'divide' | 'modulus' | 'bit_and' | 'bit_or'
        | 'bit_xor' | 'log_and' | 'log_or' | 'qmark'
        | 'colon' | 'bit_rights' | 'bit_right' | 'bit_left'> | null
}

export type BinaryOperationTrait = Locateable & {
    left: ExpressionNode,
    right: ExpressionNode,
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
