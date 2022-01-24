
# unienv-project

Computer environment from scratch. One codebase. One language.

## Current session use-abels

```sh
clear && make -B && clear && ./onejscli examples/test.one -r --ast
```

## ONE Programming Language

- Mid to low level
- Statically typed
- Support for polymorphism
- C-like syntax
- Optional garbage collection

## TODO

- [ ] ONE
  - [ ] ONEJS
    - [ ] Parser
    - [ ] Interpreter
      - [x] Functions
      - [ ] Variables
      - [ ] Math
      - [ ] Objects
      - [ ] Classes
      - [ ] Imports
      - [ ] Strings
      - [ ] File
      - [ ] OS features
    - [ ] X86-64 Compiler
      - [ ] Stack allocations
      - [ ] Heap allocations
  - [ ] Self hosting
    - [ ] Lexer
    - [ ] Parser
    - [ ] Static analyzer
      - [ ] Type checker
    - [ ] Interpreter
    - [ ] X86-64 Compiler
    - [ ] Garbage collector
    - [ ] Optimizations

## Resources

- [Linux X86-64 Syscalls - ChromiumOS](https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md)
- [X86-64 Memory - CS UAF](https://www.cs.uaf.edu/courses/cs301/2014-fall/notes/memory/)
- [Writing a `malloc` - Tsoding](https://www.youtube.com/watch?v=sZ8GJ1TiMdk)
- [Writing a Garbage Collector - Tsoding](https://www.youtube.com/watch?v=2JgEKEd3tw8&t=1355s)
- [CPU Registers x86-64 - OSDev](https://wiki.osdev.org/CPU_Registers_x86-64)
- [X86 Assembly Documentation - zneak & HJLebbink](https://hjlebbink.github.io/x86doc/)
- [Garbage collection - Wikipedia](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science))
- [Operator Precedence in JS - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)