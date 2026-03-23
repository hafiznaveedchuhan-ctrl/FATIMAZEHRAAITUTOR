"""
Seed quiz questions (10 per chapter) into the database.
Run after seed.py: python quiz_seed.py
"""

import asyncio
from database import engine, async_session
from models import Chapter, QuizQuestion, SQLModel
from sqlalchemy.future import select

# ─── Questions by chapter slug ──────────────────────────────────────────────

QUESTIONS: dict[str, list[dict]] = {

    "python-basics": [
        {
            "question": "What is the correct syntax to declare a variable in Python?",
            "options": ["var x = 5", "int x = 5", "x = 5", "declare x = 5"],
            "correct_answer": 2,
            "explanation": "Python uses dynamic typing. Variables are declared by simple assignment: x = 5."
        },
        {
            "question": "Which of the following is a valid f-string?",
            "options": ["f\"Hello, $(name)\"", "f\"Hello, {name}\"", "\"Hello, %name%\"", "f'Hello, [name]'"],
            "correct_answer": 1,
            "explanation": "F-strings use curly braces {} to embed expressions: f\"Hello, {name}\"."
        },
        {
            "question": "What does int('42') return?",
            "options": ["'42'", "42.0", "42", "Error"],
            "correct_answer": 2,
            "explanation": "int() converts a string to an integer. int('42') returns the integer 42."
        },
        {
            "question": "What is the data type of True in Python?",
            "options": ["str", "int", "bool", "None"],
            "correct_answer": 2,
            "explanation": "True and False are of type bool (Boolean) in Python."
        },
        {
            "question": "What does bool(0) evaluate to?",
            "options": ["True", "False", "0", "None"],
            "correct_answer": 1,
            "explanation": "In Python, 0, empty strings, empty lists, and None are all falsy. bool(0) returns False."
        },
        {
            "question": "Which variable name is valid in Python?",
            "options": ["2fast", "my-name", "_count", "class"],
            "correct_answer": 2,
            "explanation": "_count is valid. Variable names cannot start with digits, contain hyphens, or be reserved keywords."
        },
        {
            "question": "What will print(f'{2 + 2}') output?",
            "options": ["{2 + 2}", "2 + 2", "4", "Error"],
            "correct_answer": 2,
            "explanation": "F-strings evaluate expressions inside {}. 2 + 2 evaluates to 4."
        },
        {
            "question": "What does the input() function always return?",
            "options": ["int", "float", "str", "None"],
            "correct_answer": 2,
            "explanation": "input() always returns a string, even if the user types a number. Use int() or float() to convert."
        },
        {
            "question": "What is the result of type([1, 2, 3])?",
            "options": ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'array'>"],
            "correct_answer": 1,
            "explanation": "Square brackets create a list. type([1, 2, 3]) returns <class 'list'>."
        },
        {
            "question": "How do you combine two strings 'Hello' and 'World'?",
            "options": ["'Hello' - 'World'", "'Hello' * 'World'", "'Hello' + ' World'", "'Hello' & 'World'"],
            "correct_answer": 2,
            "explanation": "The + operator concatenates strings. 'Hello' + ' World' gives 'Hello World'."
        },
    ],

    "control-flow": [
        {
            "question": "What keyword is used for an alternative condition in Python?",
            "options": ["else if", "elseif", "elif", "otherwise"],
            "correct_answer": 2,
            "explanation": "Python uses 'elif' (short for else-if) for additional conditions."
        },
        {
            "question": "What does range(5) produce?",
            "options": ["[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4]", "[0, 1, 2, 3, 4, 5]", "[1, 2, 3, 4]"],
            "correct_answer": 1,
            "explanation": "range(5) produces numbers from 0 up to (but not including) 5: 0, 1, 2, 3, 4."
        },
        {
            "question": "Which keyword immediately exits a loop?",
            "options": ["exit", "stop", "continue", "break"],
            "correct_answer": 3,
            "explanation": "'break' immediately exits the loop. 'continue' skips the current iteration and continues the loop."
        },
        {
            "question": "What does 'continue' do in a loop?",
            "options": ["Exits the loop", "Skips current iteration and continues", "Restarts the loop", "Pauses execution"],
            "correct_answer": 1,
            "explanation": "'continue' skips the rest of the current iteration and moves to the next one."
        },
        {
            "question": "What is the output of [x**2 for x in range(3)]?",
            "options": ["[1, 4, 9]", "[0, 1, 4]", "[0, 1, 2]", "[0, 2, 4]"],
            "correct_answer": 1,
            "explanation": "range(3) gives 0, 1, 2. Squaring each: 0**2=0, 1**2=1, 2**2=4. Result: [0, 1, 4]."
        },
        {
            "question": "What does range(1, 10, 2) generate?",
            "options": ["[1, 3, 5, 7, 9]", "[2, 4, 6, 8, 10]", "[1, 2, 3, 4, 5]", "[1, 10, 2]"],
            "correct_answer": 0,
            "explanation": "range(start, stop, step): starts at 1, stops before 10, steps by 2 → 1, 3, 5, 7, 9."
        },
        {
            "question": "What is an infinite loop?",
            "options": ["for i in range(1000)", "while True:", "for i in []:", "while False:"],
            "correct_answer": 1,
            "explanation": "'while True:' creates an infinite loop because the condition is always True."
        },
        {
            "question": "What will print if score = 85 and we check: if score >= 90: print('A') elif score >= 80: print('B')?",
            "options": ["A", "B", "Both A and B", "Nothing"],
            "correct_answer": 1,
            "explanation": "score=85 is not >= 90, so 'A' is skipped. 85 >= 80 is True, so 'B' is printed."
        },
        {
            "question": "Which syntax is a valid list comprehension?",
            "options": ["[x for x range(5)]", "[for x in range(5): x]", "[x for x in range(5)]", "[x in range(5)]"],
            "correct_answer": 2,
            "explanation": "List comprehension syntax: [expression for variable in iterable]."
        },
        {
            "question": "What does [x for x in range(10) if x % 2 == 0] produce?",
            "options": ["[1, 3, 5, 7, 9]", "[0, 2, 4, 6, 8]", "[0, 1, 2, 3, 4]", "[2, 4, 6, 8, 10]"],
            "correct_answer": 1,
            "explanation": "The condition x % 2 == 0 filters for even numbers: 0, 2, 4, 6, 8."
        },
    ],

    "functions": [
        {
            "question": "What keyword is used to define a function in Python?",
            "options": ["function", "define", "def", "func"],
            "correct_answer": 2,
            "explanation": "Python uses 'def' to define functions: def function_name(params):"
        },
        {
            "question": "What type does *args create inside a function?",
            "options": ["list", "dict", "tuple", "set"],
            "correct_answer": 2,
            "explanation": "*args collects extra positional arguments into a tuple."
        },
        {
            "question": "What type does **kwargs create inside a function?",
            "options": ["list", "dict", "tuple", "set"],
            "correct_answer": 1,
            "explanation": "**kwargs collects extra keyword arguments into a dictionary."
        },
        {
            "question": "What is the output of (lambda x: x * 2)(5)?",
            "options": ["5", "25", "10", "Error"],
            "correct_answer": 2,
            "explanation": "The lambda takes x and returns x*2. Called with 5: 5*2=10."
        },
        {
            "question": "In the LEGB rule, what does 'L' stand for?",
            "options": ["Library", "Loop", "Local", "Lambda"],
            "correct_answer": 2,
            "explanation": "LEGB stands for Local, Enclosing, Global, Built-in — the scope resolution order."
        },
        {
            "question": "What is the default return value of a function with no return statement?",
            "options": ["0", "False", "None", "Empty string"],
            "correct_answer": 2,
            "explanation": "Python functions implicitly return None if no return statement is used."
        },
        {
            "question": "Which defines a function with a default parameter?",
            "options": ["def f(x = 5):", "def f(x := 5):", "def f(x == 5):", "def f(x, default=5):"],
            "correct_answer": 0,
            "explanation": "Default parameters use = : def f(x=5):. When called without x, x defaults to 5."
        },
        {
            "question": "What is a closure in Python?",
            "options": [
                "A function with no return",
                "A function defined inside another function that remembers the outer scope",
                "A class with no methods",
                "A loop with break"
            ],
            "correct_answer": 1,
            "explanation": "A closure is an inner function that captures variables from its enclosing scope."
        },
        {
            "question": "What does the global keyword do?",
            "options": [
                "Creates a new global variable",
                "Deletes a global variable",
                "Allows a function to modify a global variable",
                "Imports a global module"
            ],
            "correct_answer": 2,
            "explanation": "The 'global' keyword inside a function allows it to modify a variable in the global scope."
        },
        {
            "question": "What is the output of list(map(lambda x: x**2, [1, 2, 3]))?",
            "options": ["[1, 4, 9]", "[2, 4, 6]", "[1, 2, 3]", "[1, 8, 27]"],
            "correct_answer": 0,
            "explanation": "map applies the lambda to each element: 1**2=1, 2**2=4, 3**2=9 → [1, 4, 9]."
        },
    ],

    "oop": [
        {
            "question": "What is the constructor method in a Python class?",
            "options": ["__new__", "__init__", "__create__", "__start__"],
            "correct_answer": 1,
            "explanation": "__init__ is the constructor. It is called automatically when a new object is created."
        },
        {
            "question": "What does 'self' refer to in a class method?",
            "options": ["The class itself", "The parent class", "The current instance", "The module"],
            "correct_answer": 2,
            "explanation": "'self' refers to the current object (instance) of the class."
        },
        {
            "question": "How do you create a class Cat that inherits from Animal?",
            "options": ["class Cat -> Animal:", "class Cat(Animal):", "class Cat extends Animal:", "class Cat: inherits Animal"],
            "correct_answer": 1,
            "explanation": "Python inheritance syntax: class ChildClass(ParentClass):"
        },
        {
            "question": "What does the __str__ method define?",
            "options": [
                "How to compare objects",
                "The string representation returned by str()",
                "The memory address of the object",
                "The length of the object"
            ],
            "correct_answer": 1,
            "explanation": "__str__ defines what str() returns for an object, used in print() and string formatting."
        },
        {
            "question": "What decorator creates a read-only property in Python?",
            "options": ["@static", "@readonly", "@property", "@getter"],
            "correct_answer": 2,
            "explanation": "@property makes a method accessible like an attribute and creates a read-only property."
        },
        {
            "question": "What is method overriding?",
            "options": [
                "Calling a parent method from a child",
                "Redefining a parent class method in a child class",
                "Adding new methods to a class",
                "Deleting inherited methods"
            ],
            "correct_answer": 1,
            "explanation": "Method overriding means redefining a method in a subclass that exists in the parent class."
        },
        {
            "question": "How do you call the parent class __init__ from a child class?",
            "options": ["parent.__init__(self)", "super().__init__()", "Parent.init()", "base.__init__()"],
            "correct_answer": 1,
            "explanation": "super().__init__() calls the parent class constructor in Python 3."
        },
        {
            "question": "What is encapsulation in OOP?",
            "options": [
                "Inheriting from multiple classes",
                "Bundling data and methods, and restricting direct access",
                "Creating objects from classes",
                "Overriding parent methods"
            ],
            "correct_answer": 1,
            "explanation": "Encapsulation bundles data and methods together and controls access via public/private attributes."
        },
        {
            "question": "What does double underscore prefix (__attr) do to a class attribute?",
            "options": [
                "Makes it public",
                "Makes it a class variable",
                "Triggers name mangling, making it harder to access from outside",
                "Makes it read-only"
            ],
            "correct_answer": 2,
            "explanation": "Double underscore triggers name mangling: __attr becomes _ClassName__attr, preventing accidental access."
        },
        {
            "question": "What is polymorphism in OOP?",
            "options": [
                "Having multiple constructors",
                "The ability to use the same interface for different object types",
                "Creating multiple instances of a class",
                "Inheriting from multiple classes"
            ],
            "correct_answer": 1,
            "explanation": "Polymorphism allows different classes to be used with the same interface. E.g., dog.speak() and cat.speak() both work."
        },
    ],

    "modules": [
        {
            "question": "How do you import only the 'sqrt' function from the math module?",
            "options": ["import math.sqrt", "from math import sqrt", "include math.sqrt", "using math: sqrt"],
            "correct_answer": 1,
            "explanation": "'from module import name' imports a specific name from a module."
        },
        {
            "question": "What file makes a directory a Python package?",
            "options": ["package.py", "main.py", "__init__.py", "setup.py"],
            "correct_answer": 2,
            "explanation": "__init__.py (can be empty) marks a directory as a Python package."
        },
        {
            "question": "What command installs a package with pip?",
            "options": ["pip get requests", "pip add requests", "pip install requests", "pip download requests"],
            "correct_answer": 2,
            "explanation": "'pip install package_name' installs a package from PyPI."
        },
        {
            "question": "How do you create a virtual environment called 'venv'?",
            "options": ["python new venv venv", "python -m venv venv", "virtualenv create venv", "pip venv create venv"],
            "correct_answer": 1,
            "explanation": "'python -m venv venv' creates a virtual environment in a folder named 'venv'."
        },
        {
            "question": "What does 'import math as m' allow you to do?",
            "options": ["Rename the math module to 'm' in your code", "Import only 'm' from math", "Create a math alias globally", "Limit math functions to 'm'"],
            "correct_answer": 0,
            "explanation": "'as m' creates an alias, so you can use m.sqrt() instead of math.sqrt()."
        },
        {
            "question": "Which command saves current package requirements to a file?",
            "options": ["pip save > requirements.txt", "pip freeze > requirements.txt", "pip export requirements.txt", "pip list > requirements.txt"],
            "correct_answer": 1,
            "explanation": "'pip freeze > requirements.txt' writes installed packages and versions to requirements.txt."
        },
        {
            "question": "What does `from datetime import datetime` do?",
            "options": [
                "Imports the entire datetime module",
                "Imports the datetime class from the datetime module",
                "Renames datetime to itself",
                "Creates a new datetime instance"
            ],
            "correct_answer": 1,
            "explanation": "This imports the datetime class from the datetime module, so you can use datetime.now() directly."
        },
        {
            "question": "What is the purpose of __all__ in a module?",
            "options": [
                "Runs all functions automatically",
                "Defines what is exported when 'from module import *' is used",
                "Lists all dependencies",
                "Marks all functions as public"
            ],
            "correct_answer": 1,
            "explanation": "__all__ is a list of names that are exported when 'from module import *' is used."
        },
        {
            "question": "Which statement is True about Python's standard library?",
            "options": [
                "It must be installed with pip",
                "It comes pre-installed with Python",
                "It requires a virtual environment",
                "It is only available on Linux"
            ],
            "correct_answer": 1,
            "explanation": "Python's standard library (os, math, datetime, json, etc.) comes bundled with Python."
        },
        {
            "question": "What does `if __name__ == '__main__':` do?",
            "options": [
                "Imports the main module",
                "Checks if the script is run directly (not imported)",
                "Creates a new module named main",
                "Runs the script in debug mode"
            ],
            "correct_answer": 1,
            "explanation": "When a file is run directly, __name__ is '__main__'. This guard prevents code from running when imported."
        },
    ],

    "file-handling": [
        {
            "question": "What does open('file.txt', 'w') do?",
            "options": [
                "Opens for reading, fails if not exists",
                "Opens for writing, creates or overwrites",
                "Opens for appending",
                "Opens for reading and writing"
            ],
            "correct_answer": 1,
            "explanation": "'w' mode opens for writing and creates the file if it doesn't exist (overwrites if it does)."
        },
        {
            "question": "What is the advantage of using 'with open(...)' syntax?",
            "options": [
                "It reads files faster",
                "It automatically closes the file when the block exits",
                "It only works for binary files",
                "It compresses the file"
            ],
            "correct_answer": 1,
            "explanation": "The 'with' statement (context manager) automatically closes the file, even if an error occurs."
        },
        {
            "question": "Which mode opens a file for appending without overwriting?",
            "options": ["'w'", "'r'", "'a'", "'x'"],
            "correct_answer": 2,
            "explanation": "'a' mode opens for appending. New content is added to the end of the file."
        },
        {
            "question": "What does file.read() return?",
            "options": ["A list of lines", "The entire file content as a string", "The first line", "A bytes object"],
            "correct_answer": 1,
            "explanation": "file.read() returns the entire file content as a single string."
        },
        {
            "question": "Which pathlib method reads a text file as a string?",
            "options": ["Path.get_text()", "Path.read_text()", "Path.load()", "Path.open_text()"],
            "correct_answer": 1,
            "explanation": "Path.read_text() reads the file and returns its content as a string."
        },
        {
            "question": "How do you serialize a Python dict to JSON?",
            "options": ["json.loads(data)", "json.serialize(data)", "json.dump(data, file)", "json.to_string(data)"],
            "correct_answer": 2,
            "explanation": "json.dump(obj, file) writes the object as JSON to a file. json.dumps() returns a string."
        },
        {
            "question": "What does json.loads(json_string) do?",
            "options": [
                "Writes JSON to a file",
                "Parses a JSON string into a Python object",
                "Loads a JSON file",
                "Converts Python to JSON string"
            ],
            "correct_answer": 1,
            "explanation": "json.loads() parses a JSON string and returns a Python dict/list."
        },
        {
            "question": "Which csv class reads rows as dictionaries?",
            "options": ["csv.reader()", "csv.DictReader()", "csv.parse()", "csv.dict()"],
            "correct_answer": 1,
            "explanation": "csv.DictReader() uses the first row as keys and returns each row as a dict."
        },
        {
            "question": "What does Path('data/file.txt').parent return?",
            "options": ["'data/file.txt'", "Path('data')", "'file.txt'", "Path('data/file')"],
            "correct_answer": 1,
            "explanation": ".parent returns the directory containing the file as a Path object: Path('data')."
        },
        {
            "question": "What does file.readlines() return?",
            "options": ["The first line as a string", "The entire file as a string", "A list of all lines", "The last line"],
            "correct_answer": 2,
            "explanation": "file.readlines() returns a list where each element is a line from the file (including newlines)."
        },
    ],

    "exceptions": [
        {
            "question": "What block always executes whether an exception occurs or not?",
            "options": ["except", "else", "finally", "always"],
            "correct_answer": 2,
            "explanation": "The 'finally' block always executes, making it ideal for cleanup code like closing files."
        },
        {
            "question": "What error is raised when dividing by zero?",
            "options": ["MathError", "ValueError", "ZeroDivisionError", "ArithmeticException"],
            "correct_answer": 2,
            "explanation": "Python raises ZeroDivisionError when any number is divided by zero."
        },
        {
            "question": "How do you raise a custom exception?",
            "options": ["throw MyError()", "raise MyError()", "except MyError()", "trigger MyError()"],
            "correct_answer": 1,
            "explanation": "Python uses 'raise' to throw exceptions: raise ValueError('message')"
        },
        {
            "question": "What is the base class for all Python exceptions?",
            "options": ["Error", "Exception", "BaseException", "RuntimeError"],
            "correct_answer": 2,
            "explanation": "BaseException is the base for all exceptions. Exception inherits from it and is the base for most user exceptions."
        },
        {
            "question": "What does except ValueError as e: do?",
            "options": [
                "Raises a ValueError",
                "Catches ValueError and binds it to variable e",
                "Ignores ValueError",
                "Logs the ValueError"
            ],
            "correct_answer": 1,
            "explanation": "'as e' binds the exception instance to variable e, so you can access its message with str(e)."
        },
        {
            "question": "How do you create a custom exception class?",
            "options": [
                "class MyError: pass",
                "class MyError(Exception): pass",
                "class MyError(Error): pass",
                "exception MyError: pass"
            ],
            "correct_answer": 1,
            "explanation": "Custom exceptions inherit from Exception (or a subclass of it): class MyError(Exception): pass"
        },
        {
            "question": "What error is raised when a key is not found in a dictionary?",
            "options": ["IndexError", "AttributeError", "KeyError", "NameError"],
            "correct_answer": 2,
            "explanation": "KeyError is raised when a dictionary key doesn't exist: d['missing_key']."
        },
        {
            "question": "What does the 'else' clause in a try/except block do?",
            "options": [
                "Runs if an exception is raised",
                "Runs if no exception was raised in try",
                "Always runs after except",
                "Handles all unspecified exceptions"
            ],
            "correct_answer": 1,
            "explanation": "The 'else' clause runs only if the try block did NOT raise any exception."
        },
        {
            "question": "What logging level is higher: INFO or WARNING?",
            "options": ["INFO", "WARNING", "They are equal", "Depends on config"],
            "correct_answer": 1,
            "explanation": "Logging levels in order: DEBUG < INFO < WARNING < ERROR < CRITICAL. WARNING is higher than INFO."
        },
        {
            "question": "What error occurs when you use an undefined variable?",
            "options": ["ValueError", "TypeError", "NameError", "AttributeError"],
            "correct_answer": 2,
            "explanation": "NameError is raised when a variable is used before it's defined."
        },
    ],

    "apis": [
        {
            "question": "What HTTP method is used to retrieve data from an API?",
            "options": ["POST", "PUT", "GET", "DELETE"],
            "correct_answer": 2,
            "explanation": "GET requests retrieve data without modifying it. It is the default for web browsing."
        },
        {
            "question": "What does response.json() do in the requests library?",
            "options": [
                "Converts Python dict to JSON",
                "Parses the response body as JSON into a Python object",
                "Sends JSON data",
                "Validates JSON format"
            ],
            "correct_answer": 1,
            "explanation": "response.json() deserializes the JSON response body into a Python dict or list."
        },
        {
            "question": "How do you send a POST request with JSON data using requests?",
            "options": [
                "requests.post(url, data=payload)",
                "requests.post(url, json=payload)",
                "requests.post(url, body=payload)",
                "requests.send(url, json=payload)"
            ],
            "correct_answer": 1,
            "explanation": "Using json= automatically serializes the dict and sets Content-Type: application/json."
        },
        {
            "question": "What does response.raise_for_status() do?",
            "options": [
                "Prints the HTTP status code",
                "Raises an exception for 4xx/5xx status codes",
                "Returns the status code",
                "Retries the request"
            ],
            "correct_answer": 1,
            "explanation": "raise_for_status() raises an HTTPError if the response code indicates an error (4xx or 5xx)."
        },
        {
            "question": "What HTTP status code means 'Not Found'?",
            "options": ["200", "401", "404", "500"],
            "correct_answer": 2,
            "explanation": "404 Not Found means the requested resource doesn't exist on the server."
        },
        {
            "question": "What does async/await do in Python?",
            "options": [
                "Creates multiple threads",
                "Enables asynchronous (non-blocking) code execution",
                "Runs code in a separate process",
                "Slows down execution"
            ],
            "correct_answer": 1,
            "explanation": "async/await enables asynchronous programming, allowing code to wait for I/O without blocking."
        },
        {
            "question": "Which library provides async HTTP requests in Python?",
            "options": ["requests", "urllib", "httpx", "aiohttp_sync"],
            "correct_answer": 2,
            "explanation": "httpx supports both sync and async HTTP requests. aiohttp is another popular choice."
        },
        {
            "question": "What does REST stand for?",
            "options": [
                "Remote Execution State Transfer",
                "Representational State Transfer",
                "Resource Encoded State Transmission",
                "Remote Event Streaming Transfer"
            ],
            "correct_answer": 1,
            "explanation": "REST stands for Representational State Transfer, an architectural style for APIs."
        },
        {
            "question": "What is a Bearer token used for?",
            "options": [
                "Encrypting the response body",
                "Authenticating API requests via Authorization header",
                "Compressing HTTP payloads",
                "Versioning the API"
            ],
            "correct_answer": 1,
            "explanation": "Bearer tokens are sent in the Authorization header to authenticate API requests."
        },
        {
            "question": "What does requests.get(url, params={'page': 2}) do?",
            "options": [
                "Sends page=2 in the request body",
                "Appends ?page=2 to the URL as a query string",
                "Sets a header named page",
                "Sends a POST with page=2"
            ],
            "correct_answer": 1,
            "explanation": "params dict is URL-encoded and appended as query string: url?page=2."
        },
    ],

    "decorators": [
        {
            "question": "What symbol is used to apply a decorator in Python?",
            "options": ["#", "$", "@", "&"],
            "correct_answer": 2,
            "explanation": "Decorators are applied with @: @decorator_name above a function definition."
        },
        {
            "question": "What does a decorator function return?",
            "options": ["The original function unchanged", "A new/modified function (wrapper)", "None", "A class"],
            "correct_answer": 1,
            "explanation": "A decorator takes a function, adds behavior around it, and returns a new wrapper function."
        },
        {
            "question": "What does functools.wraps do when used in a decorator?",
            "options": [
                "Adds error handling to the wrapped function",
                "Preserves the original function's metadata (__name__, __doc__)",
                "Makes the function run faster",
                "Caches function results"
            ],
            "correct_answer": 1,
            "explanation": "@functools.wraps(func) copies the original function's __name__, __doc__, etc. to the wrapper."
        },
        {
            "question": "What does the 'yield' keyword do?",
            "options": [
                "Returns a value and terminates the function",
                "Pauses execution and returns a value, resuming on next call",
                "Raises an exception",
                "Imports a module"
            ],
            "correct_answer": 1,
            "explanation": "'yield' pauses the generator function and returns a value. On the next iteration, execution resumes."
        },
        {
            "question": "What is a generator in Python?",
            "options": [
                "A function that creates classes",
                "A function using yield that produces values lazily one at a time",
                "A loop that generates random numbers",
                "A class that generates instances"
            ],
            "correct_answer": 1,
            "explanation": "A generator function uses yield and returns a generator object that produces values on demand."
        },
        {
            "question": "What is the memory advantage of generators over lists?",
            "options": [
                "Generators are stored in RAM",
                "Generators produce values lazily, not storing all values at once",
                "Generators are faster than lists",
                "Generators can hold infinite values in memory"
            ],
            "correct_answer": 1,
            "explanation": "Generators produce one value at a time on demand (lazy evaluation), using O(1) memory vs O(n) for a list."
        },
        {
            "question": "What is a generator expression?",
            "options": [
                "(x for x in range(5)) — lazy generator using parentheses",
                "[x for x in range(5)] — list comprehension",
                "{x for x in range(5)} — set comprehension",
                "x for x in range(5) — bare expression"
            ],
            "correct_answer": 0,
            "explanation": "Generator expressions use parentheses (x for x in ...) and are lazy, unlike list comprehensions."
        },
        {
            "question": "What does 'yield from' do?",
            "options": [
                "Returns a value from a function",
                "Delegates to another generator, yielding all its values",
                "Imports values from a module",
                "Creates a new generator"
            ],
            "correct_answer": 1,
            "explanation": "'yield from iterable' yields all values from another generator/iterable, simplifying delegation."
        },
        {
            "question": "Can a single function be both a regular function and a generator?",
            "options": [
                "Yes, by using return and yield in the same function",
                "No, once a function has yield, it is always a generator",
                "Yes, with a special decorator",
                "Only in Python 3.10+"
            ],
            "correct_answer": 1,
            "explanation": "Any function containing 'yield' is a generator function. return can still be used to stop iteration."
        },
        {
            "question": "What does @staticmethod define?",
            "options": [
                "A method that receives the instance as first argument",
                "A method that receives the class as first argument",
                "A method with no implicit first argument (no self or cls)",
                "A method that is read-only"
            ],
            "correct_answer": 2,
            "explanation": "@staticmethod creates a method that doesn't receive self or cls. It's just a regular function in a class namespace."
        },
    ],

    "advanced": [
        {
            "question": "What is the purpose of @dataclass decorator?",
            "options": [
                "Makes a class serializable to JSON",
                "Auto-generates __init__, __repr__, __eq__ based on type-annotated fields",
                "Creates a database model",
                "Optimizes class memory usage"
            ],
            "correct_answer": 1,
            "explanation": "@dataclass auto-generates boilerplate methods like __init__ and __repr__ from class annotations."
        },
        {
            "question": "What does 'def add(a: int, b: int) -> int' mean?",
            "options": [
                "Forces a and b to be integers",
                "Documents expected types with type hints (not enforced at runtime)",
                "Creates an integer-only function",
                "Compiles the function for speed"
            ],
            "correct_answer": 1,
            "explanation": "Type hints are annotations only — Python does NOT enforce them at runtime. Use mypy for static checking."
        },
        {
            "question": "What does asyncio.gather() do?",
            "options": [
                "Runs coroutines sequentially",
                "Cancels all running coroutines",
                "Runs multiple coroutines concurrently and returns results",
                "Creates a new event loop"
            ],
            "correct_answer": 2,
            "explanation": "asyncio.gather(*coroutines) runs them concurrently and returns a list of results."
        },
        {
            "question": "What is the purpose of __slots__ in a class?",
            "options": [
                "Limits the number of instances",
                "Restricts allowed attributes and reduces memory usage",
                "Creates abstract methods",
                "Enables multiple inheritance"
            ],
            "correct_answer": 1,
            "explanation": "__slots__ defines fixed attributes, preventing __dict__ creation and reducing memory per instance."
        },
        {
            "question": "What is a metaclass?",
            "options": [
                "A class that can only be instantiated once",
                "A class whose instances are classes themselves",
                "A class with no methods",
                "A class that uses multiple inheritance"
            ],
            "correct_answer": 1,
            "explanation": "A metaclass is a class of a class. It controls how classes are created. type is Python's default metaclass."
        },
        {
            "question": "What does 'async def' define?",
            "options": [
                "A function that runs in a separate thread",
                "A coroutine function that can be awaited",
                "A function that runs asynchronously in a subprocess",
                "A generator function"
            ],
            "correct_answer": 1,
            "explanation": "'async def' defines a coroutine. It must be awaited with 'await' or run with asyncio.run()."
        },
        {
            "question": "What does Optional[str] mean in type hints?",
            "options": [
                "The value can only be str",
                "The value is str or None",
                "The value can be any type",
                "The parameter is optional in function calls"
            ],
            "correct_answer": 1,
            "explanation": "Optional[str] is equivalent to Union[str, None]. The value can be a string or None."
        },
        {
            "question": "What is the difference between concurrency and parallelism?",
            "options": [
                "They are identical concepts",
                "Concurrency is handling multiple tasks; parallelism is executing them simultaneously",
                "Concurrency uses multiple CPUs; parallelism uses one CPU",
                "Concurrency is only for I/O; parallelism is only for CPU"
            ],
            "correct_answer": 1,
            "explanation": "Concurrency = dealing with multiple things at once (interleaved). Parallelism = executing multiple things simultaneously."
        },
        {
            "question": "What does 'await' do in an async function?",
            "options": [
                "Blocks the entire program until done",
                "Suspends the current coroutine until the awaited task completes",
                "Creates a new thread",
                "Catches exceptions"
            ],
            "correct_answer": 1,
            "explanation": "'await' suspends the current coroutine, allowing other coroutines to run while waiting."
        },
        {
            "question": "What is List[str] equivalent to in Python 3.9+?",
            "options": ["list[str]", "list(str)", "List(str)", "[str]"],
            "correct_answer": 0,
            "explanation": "In Python 3.9+, you can use the built-in list[str] instead of importing List from typing."
        },
    ],
}


async def seed_quiz_questions():
    """Seed quiz questions for all chapters."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with async_session() as session:
        total_added = 0

        for slug, questions in QUESTIONS.items():
            # Find chapter by slug
            stmt = select(Chapter).where(Chapter.slug == slug)
            result = await session.execute(stmt)
            chapter = result.scalars().first()

            if not chapter:
                print(f"⚠️  Chapter not found: {slug} — run seed.py first")
                continue

            # Check if already seeded
            from sqlalchemy.future import select as sql_select
            q_stmt = sql_select(QuizQuestion).where(QuizQuestion.chapter_id == chapter.id)
            existing = await session.execute(q_stmt)
            if existing.scalars().all():
                print(f"   Skipped (already seeded): {slug}")
                continue

            # Insert questions
            for q in questions:
                question = QuizQuestion(
                    chapter_id=chapter.id,
                    question=q["question"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    explanation=q["explanation"],
                )
                session.add(question)
                total_added += 1

            print(f"   ✅ Seeded {len(questions)} questions for: {chapter.title}")

        await session.commit()
        print(f"\n✅ Total questions added: {total_added}")


if __name__ == "__main__":
    asyncio.run(seed_quiz_questions())
