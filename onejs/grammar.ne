@preprocessor typescript

@{%
import { compile, keywords } from 'moo';
import { getTokenPosition as pos } from './utils';
const lexer = compile({
    nl:         {match: /[\n;]+/, lineBreaks: true},
    ws:         /[ \t]+/,
    comment_sl: /\/\/.*?$/,
    comment_ml: {match: /\*[^*]*\*+(?:[^/*][^*]*\*+)*/, lineBreaks: true},
    float:      /\-?(?:(?:0|(?:[1-9][0-9]*))\.[0-9]+)/,
    hex:        /0x[0-9a-fA-F]+/,
    int:        /0|(?:[1-9][0-9]*)/,
    char:       {match: /'(?:[^'\\]|\\[\s\S])'/, value: s => s.slice(1, -1)},
    string:     {match: /"(?:[^"\\]|\\[\s\S])*"/, value: s => s.slice(1, -1)},
    name:       {match: /[a-zA-Z0-9_]+/, type: keywords({
        keyword: ['func', 'return', 'let', 'import', 'struct', 'new', 'delete']
    })},
    dot:        '.',

    heavyarrow: '=>',
    thinarrow:  '->',

    lparen:     '(',
    rparen:     ')',
    lbrace:     '{',
    rbrace:     '}',
    lbracket:   '[',
    rbracket:   ']',
    comma:      ',',
    
    plus:       '+',
    minus:      '-',
    powerof:    '^^',
    multiply:   '*',
    divide:     '/',
    modulus:    '%',

    log_and:    '&&',
    log_or:     '||',

    bit_and:    '&',
    bit_or:     '|',
    bit_xor:    '^',
    bit_not:    '~',
    bit_rights: '>>>',
    bit_right:  '>>',
    bit_left:   '<<',

    cmp_e:      '==',
    cmp_ne:     '!=',
    cmp_lte:    '<=',
    cmp_gte:    '>=',
    cmp_lt:     '<',
    cmp_gt:     '>',

    log_not:    '!',

    infer:     ':=',
    assign:     '=',

    qmark:      '?',
    colon:      ':',
});
%}

@lexer lexer

statements          ->  (_ statement (_nl_ statement):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[1])] : [] %}

statement           ->  block               {% id %}
                    |   struct_def          {% id %}
                    |   method_def          {% id %}
                    |   func_def_statement  {% id %}
                    |   let_initialization  {% id %}
                    |   let_declaration     {% id %}
                    |   return_statement    {% id %}
                    |   value_statement     {% id %}

block               ->  "{" statements "}"
    {% v => ({type: 'block', body: v[1], ...pos(v[0])}) %}

struct_def          ->  "struct" __ %name _ "{" parameters "}"
    {% v => ({type: 'struct_def', identifier: v[2], fields: v[5], ...pos(v[0])}) %}

method_def          ->  "func" _ "(" _ typed_identifier _ ")" _ function_definition
    {% v => ({type: 'method_def', structIdentifier: v[4], definition: v[8], ...pos(v[0])}) %}

constructor_def     ->  "func" __ "new" __ function_definition
    {% v => ({type: 'constructor_def', definition: v[4], ...pos(v[0])}) %}

destructor_def     ->  "func" __ "delete" __ function_definition
    {% v => ({type: 'destructor_def', definition: v[4], ...pos(v[0])}) %}

func_def_statement  ->  "func" __ function_definition
    {% v => ({type: 'func_def_statement', definition: v[2], ...pos(v[0])}) %}

function_definition ->  %name _ "(" parameters ")" _ type_specifier _ statement
    {% v => ({type: 'function_definition', identifier: v[0], parameters: v[3], returnType: v[6], body: v[8], ...pos(v[0])}) %}

parameters          ->  (_ typed_identifier (_ "," _ typed_identifier):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

let_initialization  ->  "let" __ initialization
    {% v => ({type: 'let_initialization', initialization: v[2], ...pos(v[0])}) %}

initialization      ->  %name _ ":=" _ expression
    {% v => ({type: 'initialization', identifier: v[0], value: v[4], ...pos(v[0])}) %}

let_declaration     ->  "let" __ declaration
    {% v => ({type: 'let_declaration', declaration: v[2], ...pos(v[0])}) %}

declaration         ->  typed_identifier (_ "=" _ expression):?
    {% v => ({type: 'declaration', typedIdentifier: v[0], value: v[1] ? v[1][3] : null, ...pos(v[0])}) %}

typed_identifier    ->  %name _ type_specifier
    {% v => ({type: 'typed_identifier', identifier: v[0], typeSpecifier: v[4], ...pos(v[0])}) %}

type_specifier      ->  ":" _ %name
    {% v => ({type: 'type_specifier', identifier: v[2], ...pos(v[0])}) %}

return_statement    ->  "return" __ expression
    {% v => ({type: 'return_statement', value: v[2], ...pos(v[0])}) %}

value_statement     ->  expression
    {% v => ({type: 'value_statement', value: v[0], ...pos(v[0])}) %}

expression          ->  grouping            {% id %}
                    |   member_access       {% id %}
                    |   object_constructor  {% id %}
                    |   object_literal      {% id %}
                    |   array_literal       {% id %}
                    |   function_call       {% id %}
                    |   unary               {% id %}
                    |   exponentation       {% id %}
                    |   mul_div_mod         {% id %}
                    |   add_sub             {% id %}
                    |   bitshift            {% id %}
                    |   comparison          {% id %}
                    |   bitwise             {% id %}
                    |   logical             {% id %}
                    |   assign              {% id %}
                    |   identifier          {% id %}
                    |   inline_function     {% id %}
                    |   literal             {% id %}

grouping            ->  "(" _ expression _ ")"
    {% v => ({...v[2], ...pos(v[0])}) %}

member_access       ->  expression _ "." _ %name
    {% v => ({type: 'member_access', parent: v[0], identifier: v[4], ...pos(v[0])}) %}

indexing            ->  expression _ "[" _ expression _ "]"
    {% v => ({type: 'indexing', parent: v[0], index: v[4], ...pos(v[0])}) %}

object_constructor  ->  expression _ object_literal
    {% v => ({type: 'object_constructor', struct: v[0], pairs: v[2].pairs, ...pos(v[0])}) %}

object_literal      ->  "{" keyvaluepairs "}"
    {% v => ({type: 'object_literal', pairs: v[2], ...pos(v[0])}) %}

keyvaluepairs       ->  (_ keyvaluepair (_ "," _ keyvaluepair):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

keyvaluepair        ->  %name _ ":" _ expression
    {% v => ({type: 'keyvaluepair', key: v[0], value: [4], ...pos(v[0])}) %}

array_literal       ->  "[" expressions "]"
    {% v => ({type: 'array_literal', values: v[2], ...pos(v[0])}) %}

new                 ->  "new" __ expression
    {% v => ({type: 'new', source: v[2], ...pos(v[0])}) %}

function_call       ->  expression _ "(" expressions ")"
    {% v => ({type: 'function_call', function: v[0], arguments: v[3], ...pos(v[0])}) %}

expressions         ->  (_ expression (_ "," _ expression):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

delete              ->  "delete" __ expression
    {% v => ({type: 'delete', source: v[2], ...pos(v[0])}) %}

unary               ->  ("!"|"~" |"+"|"-") _ expression
    {% v => ({type: 'unary', operator: v[0][0], value: v[2], ...pos(v[0][0])}) %}

exponentation       ->  expression _ %powerof _ expression
    {% v => ({type: 'exponentation', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

mul_div_mod         ->  expression _ ("*"|"/"|"%") _ expression
    {% v => ({type: 'mul_div_mod', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

add_sub             ->  expression _ ("+"|"-") _ expression
    {% v => ({type: 'add_sub', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

bitshift            ->  expression _ (">>>"|">>"|"<<") _ expression
    {% v => ({type: 'bitshift', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

comparison          ->  expression _ ("<"|">"|"<="|">="|"=="|"!=") _ expression
    {% v => ({type: 'comparison', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

bitwise             ->  expression _ ("&"|"^"|"|") _ expression
    {% v => ({type: 'bitwise', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

logical             ->  expression _ ("&&"|"||") _ expression
    {% v => ({type: 'logical', left: v[0], right: v[4], operation: v[2][0], ...pos(v[0])}) %}

assign              ->  expression _ (operators _):? "=" _ expression
    {% v => ({type: 'assign', left: v[0], right: v[6], operation: v[2] ? v[2][0] : null, ...pos(v[0])}) %}

operators           -> (%powerof|"*"|"/"|"%"|"+"|"-"|">>>"|">>"|"<<"|"&"|"^"|"|"|"&&"|"||")
    {% v => v[0] %}

inline_function     ->  "(" parameters ")" _ (type_specifier):? _ "=>" _ expression
    {% v => ({type: 'inline_function', parameters: v[1], returnType: v[4] ? v[4][0] : null, value: v[8], ...pos(v[0])}) %}

identifier          ->  %name   {% id %}

literal             ->  %float  {% id %}
                    |   %int    {% id %}
                    |   %hex    {% id %}
                    |   %char   {% id %}
                    |   %string {% id %}

_           ->  __:?
__          ->  (%ws|%nl|%comment_sl|%comment_ml):+

_nl_        ->  sl_ (%nl sl_):+

sl_         ->  sl__:?
sl__        ->  (%ws|%comment_sl|%comment_ml):+
