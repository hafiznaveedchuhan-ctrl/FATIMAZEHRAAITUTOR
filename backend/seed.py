"""
Seed database with initial chapters
Run: python seed.py
"""

import asyncio
from database import engine, async_session
from models import Chapter, SQLModel

CHAPTERS_DATA = [
    {
        "number": 1,
        "title": "Python Basics & Variables",
        "slug": "python-basics",
        "tier_required": "free",
        "content_mdx": """# Python Basics & Variables

Variables store data. Use descriptive names.

## Types

Python has built-in types: int, float, str, bool, list, dict, tuple, set.

```python
# Example
age = 25
name = "Alice"
is_student = True
score = 95.5
```

## F-Strings

Modern way to format strings:

```python
name = "Bob"
age = 30
message = f"Hello, {name}! You are {age} years old."
print(message)  # Hello, Bob! You are 30 years old.
```

## Input & Type Casting

```python
# Get user input
user_input = input("Enter a number: ")

# Convert to integer
number = int(user_input)
print(type(number))  # <class 'int'>
```

Practice these concepts before moving to the next chapter!
"""
    },
    {
        "number": 2,
        "title": "Control Flow & Loops",
        "slug": "control-flow",
        "tier_required": "free",
        "content_mdx": """# Control Flow & Loops

## If/Elif/Else

```python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")
```

## For Loops

```python
# Loop through range
for i in range(5):
    print(i)

# Loop through list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
```

## While Loops

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## Break & Continue

```python
for i in range(10):
    if i == 5:
        break  # Exit loop
    if i == 2:
        continue  # Skip this iteration
    print(i)
```

## List Comprehension

```python
# Create list with comprehension
squares = [x**2 for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]
```

Master these patterns!
"""
    },
    {
        "number": 3,
        "title": "Functions & Scope",
        "slug": "functions",
        "tier_required": "free",
        "content_mdx": """# Functions & Scope

## Defining Functions

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
```

## Args & Kwargs

```python
# *args - tuple of arguments
def add(*args):
    return sum(args)

add(1, 2, 3, 4)  # 10

# **kwargs - dictionary of keyword arguments
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Bob", age=30)
```

## Lambda Functions

```python
# Anonymous functions
square = lambda x: x ** 2
print(square(5))  # 25

# With map
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
```

## Scope - LEGB Rule

- **Local**: Inside function
- **Enclosing**: In nested functions
- **Global**: Module level
- **Built-in**: Python built-ins

```python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)
    inner()
    print(x)

outer()
print(x)
```

Great progress!
"""
    },
    {
        "number": 4,
        "title": "Object-Oriented Programming",
        "slug": "oop",
        "tier_required": "premium",
        "content_mdx": """# Object-Oriented Programming

## Classes & Objects

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print(f"{self.name} says woof!")

dog = Dog("Buddy", 3)
dog.bark()
```

## Inheritance

```python
class Animal:
    def speak(self):
        print("Some sound")

class Cat(Animal):
    def speak(self):
        print("Meow!")

cat = Cat()
cat.speak()  # Meow!
```

## Dunder Methods

```python
class Person:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"Person: {self.name}"

    def __repr__(self):
        return f"Person('{self.name}')"
```

## Property Decorator

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius must be positive")
        self._radius = value
```

Premium content unlocked!
"""
    },
    {
        "number": 5,
        "title": "Modules & Packages",
        "slug": "modules",
        "tier_required": "premium",
        "content_mdx": """# Modules & Packages

## Importing Modules

```python
import math
print(math.pi)

from datetime import datetime
now = datetime.now()

from os import path
```

## Creating Modules

```python
# mymodule.py
def hello(name):
    return f"Hello, {name}!"

# main.py
from mymodule import hello
print(hello("World"))
```

## __init__.py

Makes directory a package.

```
mypackage/
  __init__.py
  module1.py
  module2.py
```

## Virtual Environments

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate  # Windows

pip install requests
```

## Pip & Requirements

```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

Growing your skills!
"""
    },
    {
        "number": 6,
        "title": "File Handling",
        "slug": "file-handling",
        "tier_required": "premium",
        "content_mdx": """# File Handling

## Reading & Writing Files

```python
# Write
with open("file.txt", "w") as f:
    f.write("Hello, World!")

# Read
with open("file.txt", "r") as f:
    content = f.read()
    print(content)
```

## Context Managers

```python
# Context manager handles file closing automatically
with open("data.txt") as f:
    for line in f:
        print(line.strip())
```

## Pathlib

```python
from pathlib import Path

p = Path("data/file.txt")
p.exists()
p.read_text()
p.parent
```

## JSON

```python
import json

data = {"name": "Alice", "age": 30}
json.dump(data, open("data.json", "w"))

loaded = json.load(open("data.json"))
```

## CSV

```python
import csv

with open("data.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)
```

Keep going!
"""
    },
    {
        "number": 7,
        "title": "Exception Handling",
        "slug": "exceptions",
        "tier_required": "premium",
        "content_mdx": """# Exception Handling

## Try/Except

```python
try:
    x = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
```

## Multiple Exceptions

```python
try:
    age = int(input("Age: "))
except ValueError:
    print("Invalid number")
except EOFError:
    print("No input provided")
```

## Finally Block

```python
try:
    file = open("data.txt")
    content = file.read()
except FileNotFoundError:
    print("File not found")
finally:
    file.close()  # Always runs
```

## Custom Exceptions

```python
class InvalidAgeError(Exception):
    pass

def set_age(age):
    if age < 0:
        raise InvalidAgeError("Age cannot be negative")
    return age
```

## Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logging.info("This is info")
logging.error("This is error")
```

Error handling mastered!
"""
    },
    {
        "number": 8,
        "title": "APIs & Requests",
        "slug": "apis",
        "tier_required": "premium",
        "content_mdx": """# APIs & Requests

## REST Concepts

- GET: Retrieve data
- POST: Create data
- PUT: Update data
- DELETE: Remove data

## Using Requests Library

```python
import requests

# GET request
response = requests.get("https://api.example.com/users")
data = response.json()

# POST request
payload = {"name": "Alice", "email": "alice@example.com"}
response = requests.post("https://api.example.com/users", json=payload)
```

## JSON Parsing

```python
import json

response = requests.get("https://api.example.com/data")
data = response.json()

for item in data["items"]:
    print(item["name"])
```

## Error Handling

```python
try:
    response = requests.get("https://api.example.com/data")
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

## Async Requests

```python
import httpx

async with httpx.AsyncClient() as client:
    response = await client.get("https://api.example.com/data")
    print(response.json())
```

You're becoming a developer!
"""
    },
    {
        "number": 9,
        "title": "Decorators & Generators",
        "slug": "decorators",
        "tier_required": "premium",
        "content_mdx": """# Decorators & Generators

## Decorators

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before function")
        result = func(*args, **kwargs)
        print("After function")
        return result
    return wrapper

@my_decorator
def hello():
    print("Hello!")
```

## Functools.wraps

```python
from functools import wraps

def decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

## Generators

```python
def count_up(max):
    count = 1
    while count <= max:
        yield count
        count += 1

for num in count_up(5):
    print(num)
```

## Generator Expressions

```python
# Like list comprehension but lazy
gen = (x**2 for x in range(1000000))

for value in gen:
    print(value)
```

## Yield From

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item
```

Advanced Python achieved!
"""
    },
    {
        "number": 10,
        "title": "Advanced Python",
        "slug": "advanced",
        "tier_required": "premium",
        "content_mdx": """# Advanced Python

## Dataclasses

```python
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int
    email: str = ""

person = Person("Alice", 30)
```

## Type Hints

```python
def add(a: int, b: int) -> int:
    return a + b

from typing import List, Dict, Optional

def process(items: List[str]) -> Dict[str, int]:
    return {item: len(item) for item in items}
```

## Asyncio

```python
import asyncio

async def fetch(url):
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    results = await asyncio.gather(
        fetch("url1"),
        fetch("url2"),
        fetch("url3")
    )
    print(results)

asyncio.run(main())
```

## __slots__

```python
class Point:
    __slots__ = ['x', 'y']

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

## Metaclasses

```python
class Meta(type):
    def __new__(mcs, name, bases, dct):
        print(f"Creating class {name}")
        return super().__new__(mcs, name, bases, dct)

class MyClass(metaclass=Meta):
    pass
```

## Congratulations!

You've completed the Python fundamentals course!
"""
    },
]

async def seed_chapters():
    """Seed chapters to database"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with async_session() as session:
        # Check if chapters exist
        from sqlalchemy.future import select
        stmt = select(Chapter)
        result = await session.execute(stmt)
        existing = result.scalars().all()

        if existing:
            print(f"Database already has {len(existing)} chapters")
            return

        # Create chapters
        for data in CHAPTERS_DATA:
            chapter = Chapter(**data)
            session.add(chapter)

        await session.commit()
        print(f"✅ Seeded {len(CHAPTERS_DATA)} chapters")

if __name__ == "__main__":
    asyncio.run(seed_chapters())
