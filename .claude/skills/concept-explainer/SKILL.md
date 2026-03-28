# Concept Explainer Skill

## Metadata
- **Name:** concept-explainer
- **Description:** Explains Python programming concepts at various complexity levels, adapting to the learner's understanding
- **Trigger Keywords:** "explain", "what is", "how does", "define", "tell me about", "meaning of"
- **Version:** 1.0
- **Phase:** 1 (Zero-Backend-LLM compatible)

## Purpose

This skill enables the Course Companion FTE to break down Python programming concepts into clear, digestible explanations. It adapts the complexity level based on the learner's current chapter progress and detected understanding level.

## Workflow

### Step 1: Detect the Concept
- Parse the user's message for the target concept
- Match against the current chapter's content
- Identify prerequisite concepts the student should already know

### Step 2: Assess Learner Level
- Check which chapter the student is currently on (1-10)
- Review their quiz scores for related chapters
- Determine explanation depth:
  - **Beginner** (Chapters 1-3): Use simple analogies, avoid jargon, real-world examples
  - **Intermediate** (Chapters 4-7): Include technical terms with definitions, code patterns
  - **Advanced** (Chapters 8-10): Full technical depth, design patterns, edge cases

### Step 3: Deliver Explanation
- Start with a one-sentence summary
- Provide a real-world analogy
- Show a working Python code example
- Highlight common mistakes
- Connect to concepts they already know

### Step 4: Verify Understanding
- Ask a follow-up comprehension question
- Offer to explain sub-concepts if needed
- Suggest related topics to explore next

## Response Templates

### Beginner Level Example
```
Great question! Let me explain **variables** in simple terms.

Think of a variable like a labeled box. You put something inside (a value),
and the label (variable name) helps you find it later.

```python
# Creating a variable is like labeling a box
student_name = "Ahmed"    # A box labeled 'student_name' containing "Ahmed"
age = 20                  # A box labeled 'age' containing 20
is_enrolled = True        # A box labeled 'is_enrolled' containing True
```

Common mistake: Variable names can't start with numbers!
- `1student = "Ali"` -- This will cause an error
- `student1 = "Ali"` -- This works perfectly

Would you like me to explain data types next?
```

### Intermediate Level Example
```
**Object-Oriented Programming (OOP)** organizes code into reusable blueprints
called classes.

Think of a class as a cookie cutter -- it defines the shape, but each cookie
(object) can have different decorations (attributes).

```python
class Student:
    def __init__(self, name: str, grade: int):
        self.name = name
        self.grade = grade

    def is_passing(self) -> bool:
        return self.grade >= 60

# Creating objects from the class blueprint
ali = Student("Ali", 85)
sara = Student("Sara", 92)
print(ali.is_passing())  # True
```

Key OOP principles you'll learn:
1. **Encapsulation** -- Bundling data + methods
2. **Inheritance** -- Building on existing classes
3. **Polymorphism** -- Same interface, different behavior

Want me to dive deeper into any of these?
```

### Advanced Level Example
```
**Decorators** are higher-order functions that modify the behavior of other
functions without changing their source code.

Under the hood, `@decorator` is syntactic sugar for `func = decorator(func)`.

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def process_data(items: list[int]) -> list[int]:
    return sorted(items, reverse=True)

process_data([3, 1, 4, 1, 5])  # process_data took 0.0001s
```

Edge case: Always use `@functools.wraps` to preserve the original
function's metadata (`__name__`, `__doc__`).

Ready to explore generator decorators or class-based decorators?
```

## Key Principles

1. **Ground in Content:** Only explain concepts covered in the course chapters. If a concept is outside scope, say "This isn't covered in our course, but here's a brief overview..."
2. **Progressive Complexity:** Never jump ahead of the student's current chapter level
3. **Code First:** Every explanation must include a working Python code example
4. **Analogies Matter:** Use real-world analogies relevant to Pakistani/South Asian students where possible
5. **No Jargon Without Definition:** Every technical term must be defined on first use
6. **Encourage Always:** End with encouragement and a suggestion for next steps
7. **Correct Gently:** If a student has a misconception, acknowledge their thinking before correcting
