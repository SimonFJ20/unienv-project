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
        keyword: ['func', 'return', 'let', 'if', 'else', 'while', 'import', 'class', 'static']
    })},
    dot:        '.',

    lparen:     '(',
    rparen:     ')',
    lbrace:     '{',
    rbrace:     '}',
    lbracket:   '[',
    rbracket:   ']',
    comma:      ',',

    assign:     ':=',
    
    plus:       '+',
    minus:      '-',
    multiply:   '*',
    powerof:    '**',
    divide:     '/',
    modulus:    '%',

    bit_and:    '&',
    bit_or:     '|',
    bit_xor:    '^',
    bit_not:    '~',

    cmp_e:      '==',
    cmp_ne:     '!=',
    cmp_lte:    '<=',
    cmp_gte:    '>=',
    cmp_lt:     '<',
    cmp_gt:     '>',

    log_not:    '!',
    log_and:    '&&',
    log_or:     '||',

    qmark:      '?',
    colon:      ':',
});
%}

@lexer lexer

statements          ->  (_ statement (_nl_ statement):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[1])] : [] %}

statement           ->  block               {% id %}
                    |   func_def_statement  {% id %}
                    |   value_statement     {% id %}

block               ->  "{" statements "}"
    {% v => ({type: 'block', body: v[1], ...pos(v[0])}) %}

func_def_statement  ->  "func" __ function_definition
    {% v => ({type: 'func_def_statement', definition: v[2], ...pos(v[0])}) %}

function_definition ->  %name _ "(" parameters ")" _ type_specifier _ statement
    {% v => ({type: 'function_definition', identifier: v[0], parameters: v[3], returnType: v[6], body: v[8], ...pos(v[0])}) %}

parameters          ->  (_ typed_identifier (_ "," _ typed_identifier):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

typed_identifier    ->  %name _ type_specifier
    {% v => ({type: 'typed_identifier', identifier: v[0], typeSpecifier: v[4], ...pos(v[0])}) %}

type_specifier      ->  ":" _ %name
    {% v => ({type: 'type_specifier', identifier: v[2], ...pos(v[0])}) %}

value_statement     ->  expression
    {% v => ({type: 'value_statement', value: v[0], ...pos(v[0])}) %}

expression          ->  grouping            {% id %}
                    |   function_call       {% id %}
                    # |   unary_operation     {% id %}
                    |   identifier          {% id %}
                    |   literal             {% id %}

grouping            ->  "(" _ expression _ ")"
    {% v => ({...v[2], ...pos(v[0])}) %}

function_call       ->  expression _ "(" arguments ")"
    {% v => ({type: 'function_call', function: v[0], arguments: v[3], ...pos(v[0])}) %}

arguments           ->  (_ expression (_ "," _ arguments):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

# unary_operation     ->  unary_operators_ expression
#     {% v => v[0] %}

# unary_operators     ->  ("!" | "~" | "+" | "-")
#     {% v => v[0] %}

# exponentation       ->  expression _ "**" _ expression

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