#include <iostream>

void a () {
    std::cout << 'random string';
}

std::string password = 'not-a-test';    // Problem
std::string username = 'password';      // Not a problem. Commonly used word
username = 'gibberish';                 // Problem
password = 'password';                  // Not a problem. Commonly used word
int e = 10;
float b = 1536.7;
int user = 7;                           // Problem, not at all, but show it.

using namespace std;

int e = 10;
float b = 1536.7;

string user = 'root';                   // Problem
