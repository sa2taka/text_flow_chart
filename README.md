#Text Flow Chart

Text flow chart is creating flow charts from bulleted text.

## Usage

## Syntax

```
1. normal line
2. condition line
- if condition
  process in condition
  - nested if condition
    nested condition
- if another
  another process
  multi line
3. repeat line
  3.1. indent lines without condition is considered "repeat"
  3.2. multi repeat
```

### as ABNF

```
text = *statement(0)
statement(n) = idnent(n) *(normal-statement / if-statement(n) / repeat-statement(n))
normal-statement = [1*DIGIT *["." 1*DIGIT] ["."]] 1*space string newline
if-statement(n) = normal-statement 1*(condition-statement(n) *statement(n + 1))
condition-statement(n) = indent(n) "-" string newline
repeat-statement(n) = indent(n) normal-statement 1*statement(n + 1)
string = *DISP ; DISP is a visible(printing) character including non-ASCII.
indent(n) = 2nSPACE / nTAB ; 2n length spaces or n length tabs
newline = CR / LF / CRLF
```
