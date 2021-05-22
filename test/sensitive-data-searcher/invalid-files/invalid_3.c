#include <cstdio>

void a () {
    printf('random string');
}

char* password = 'not-a-test';  // Problem
char* username = 'password';    // Not a problem. Commonly used word
username = 'gibberish';         // Problem
password = 'password';          // Not a problem. Commonly used word
int e = 10;
float b = 1536.7;
int user = 7;                   // Problem, not at all, but show it.
