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
                    |   func_def_statement  {% id %}
                    |   let_statement       {% id %}
                    |   return_statement    {% id %}
                    |   value_statement     {% id %}

block               ->  "{" statements "}"
    {% v => ({type: 'block', body: v[1], ...pos(v[0])}) %}

func_def_statement  ->  "func" __ function_definition
    {% v => ({type: 'func_def_statement', definition: v[2], ...pos(v[0])}) %}

function_definition ->  %name _ "(" parameters ")" _ type_specifier _ statement
    {% v => ({type: 'function_definition', identifier: v[0], parameters: v[3], returnType: v[6], body: v[8], ...pos(v[0])}) %}

parameters          ->  (_ typed_identifier (_ "," _ typed_identifier):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

let_statement       ->  "let" __ declaration
    {% v => ({type: 'let_statement', declaration: v[2], ...pos(v[0])}) %}

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
                    |   function_call       {% id %}
                    |   unary               {% id %}
                    |   exponentation       {% id %}
                    |   mul_div_mod         {% id %}
                    |   add_sub             {% id %}
                    |   bitshift            {% id %}
                    |   comparison          {% id %}
                    |   bitwise             {% id %}
                    |   logical             {% id %}
                    |   identifier          {% id %}
                    |   literal             {% id %}

grouping            ->  "(" _ expression _ ")"
    {% v => ({...v[2], ...pos(v[0])}) %}

function_call       ->  expression _ "(" arguments ")"
    {% v => ({type: 'function_call', function: v[0], arguments: v[3], ...pos(v[0])}) %}

arguments           ->  (_ expression (_ "," _ expression):*):? _
    {% v => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

unary               ->  ("!" | "~" | "+" | "-") _ expression
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
