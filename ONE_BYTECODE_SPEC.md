
# ONE Bytecode Specification

## Types

Name | Id
---|---
u8  | `0x00`
u16 | `0x01`
u32 | `0x02`
u64 | `0x03`
i8  | `0x10`
i16 | `0x11`
i32 | `0x12`
i64 | `0x13`
f32 | `0x20`
f64 | `0x21`
adr | `0x30`

## Instructions

Name | Description | Id | Definition | ASM example | Bytecode example
---|---|---|---|---|---
nop         | No operation | `0x00` | `nop` | `nop` | `00`
push        | Push value to stack | `0x10` | `push <type> <value>` | `push u16 314` | `10 02 01 3A`
pop         | Pop value from stack | `0x11` | `pop <type>` | `pop u16` | `11 02`
call        | Call subroutine | `0x20` | `[address: adr] call` | `push my_function call` | `10 30 00 00 00 21 A6 11 40 A1 10`
return      | Return from subroutine | `0x21` | `return` | `return` | `11`
jmp         | Jump to address unconditionally | `0x22` | `[address: adr] jmp` | `push adr 0xF00B00 jmp` | `10 30 00 00 00 00 00 F0 0B 00 12`
jz         | Jump if value is zero | `0x23` | `[address: adr] [value] jz <type>` | `push u8 0 push adr some_label jz u8` | `10 00 00 10 30 00 00 00 00 FF BB 04 7A 13 00`
jnz         | Jump if value is not zero | `0x24` | `[address: adr] [value] jnz <type>` | `push u8 0 push adr some_label jnz u8` | `10 00 00 10 30 00 00 00 00 FF BB 04 7A 14 00`
loadlocal   | Get value from local variabel | `0x30` | `[offset: u32] loadlocal <type>` | `push u32 8 loadlocal i16` | `10 02 00 00 00 08 20 11`
storelocal  | Set value of local variabel | `0x31` | `[offset: u32] [value] storelocal <type>` | `push u32 8 push i16 -3149 storelocal i16` | `10 02 00 00 00 08 10 11 F3 B3 00 11`
load        | Load value from memory | `0x40` | `[address: adr] load <type>` | `push adr 0xF00B00 load i16` | `10 30 00 00 00 00 00 F0 0B 00 30 11`
store       | Store value in memory | `0x41` | `[address: adr] [value] store <type>` | `push adr 0xF00B00 push i16 -3149 store i16` | `10 11 00 00 00 00 00 F0 0B 10 00 11 F3 B3 31 11`
lx86syscall | Execute linux x86-64 syscall with args from stack | `0x50` | `[...args] <id> lx86syscall` | `push u8 0 SYS_exit lx86syscall` | `10 00 00 0x3C 0x40`
add         | `a + b` | `0x60` | `[a] [b] add <type>` | `push u8 3 push u8 1 add u8` | `10 00 03 10 00 01 50 00`
sub         | `a - b` | `0x61` | `[a] [b] add <type>` | `push u8 3 push u8 1 sub u8` | `10 00 03 10 00 01 51 00`
mul         | `a * b` | `0x62` | `[a] [b] add <type>` | `push u8 3 push u8 1 mul u8` | `10 00 03 10 00 01 52 00`
div         | `a / b` | `0x63` | `[a] [b] add <type>` | `push u8 3 push u8 1 div u8` | `10 00 03 10 00 01 53 00`
mod         | `a % b` | `0x64` | `[a] [b] add <type>` | `push u8 3 push u8 1 mod u8` | `10 00 03 10 00 01 54 00`
ceq         | `a == b` | `0x65` | `[a] [b] add <type>` | `push u8 3 push u8 1 ceq u8` | `10 00 03 10 00 01 55 00`
cnq         | `a != b` | `0x66` | `[a] [b] add <type>` | `push u8 3 push u8 1 cnq u8` | `10 00 03 10 00 01 56 00`
clt         | `a < b` | `0x67` | `[a] [b] add <type>` | `push u8 3 push u8 1 clt u8` | `10 00 03 10 00 01 57 00`
cgt         | `a > b` | `0x68` | `[a] [b] add <type>` | `push u8 3 push u8 1 cgt u8` | `10 00 03 10 00 01 58 00`
not         | `~a` | `0x69` | `[a] add <type>` | `push u8 1 not u8` | `10 00 01 59 00`
or          | `a \| b` | `0x6A` | `[a] [b] add <type>` | `push u8 3 push u8 1 or u8` | `10 00 03 10 00 01 5A 00`
nor         | `~(a \| b)` | `0x6B` | `[a] [b] add <type>` | `push u8 3 push u8 1 nor u8` | `10 00 03 10 00 01 5B 00`
and         | `a & b` | `0x6C` | `[a] [b] add <type>` | `push u8 3 push u8 1 and u8` | `10 00 03 10 00 01 5C 00`
nand        | `~(a & b)` | `0x6D` | `[a] [b] add <type>` | `push u8 3 push u8 1 nand u8` | `10 00 03 10 00 01 5D 00`
xor         | `a ^ b` | `0x6E` | `[a] [b] add <type>` | `push u8 3 push u8 1 xor u8` | `10 00 03 10 00 01 5E 00`
xnor        | `~(a ^ b)` | `0x6F` | `[a] [b] add <type>` | `push u8 3 push u8 1 xnor u8` | `10 00 03 10 00 01 5F 00`



