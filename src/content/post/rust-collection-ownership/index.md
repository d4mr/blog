---
title: "Collections and Ownership in Rust"
publishDate: "18 September 2023"
description: "Collections and Ownership in Rust, with Illustrated Examples (and Illustrations)"
tags: ["rust-ownership", "software-engineering","programming", "rust"]
---
> **NOOB ALERT**
> 
> I am new to Rust. This was written by me to solidify my understanding.

## The Problem

In rust you are not allowed to do this:
```rust
let mut v = vec![String::from("hello world")];
let mut v0 = v[0];

v0.push_str("hi");
```
The compiler complains
```rust
cannot move out of index of `std::vec::Vec<std::string::String>`  
move occurs because value has type `std::string::String`, which does not implement the `Copy` trait
```

## TL;DR
The copy trait just means all data related to a struct is within the struct itself. Ie, it does not contain references to anything extraneous. You can't copy a String, since a String is just metadata that contains a pointer to the bytes on the heap which make up the actual string itself.

Why does the compiler impose this restriction? Well let's say, after performing `v0.push_str(...)`, the string needs to be reallocated elsewhere on the heap. This is a possibility since heap data is dynamic, it's meant to be moved around.

When that happens, the String at `v[0]` still holds a pointer to the old location of the string (on the heap). Accessing this will lead to undefined behaviour.

So what do you do?
```rust
let mut v = vec![String::from("hello world")];
let v0 = &mut v[0];

v0.push_str("hi");
```

The compiler is happy with this. Why does this work? Let's trace it down.

## Investigating the Solution

`v0` is now a mutable reference to the string in the Vector. So `v0` is effectively a variable on the stack that holds a pointer to the first element in the vector `v` on the heap.

This first element in the vector is a `String`, which is just metadata, and holds another pointer to the actual bytes on the heap where `Hello World` is contained.

![Stack and Heap diagram of using mutable reference to v[0] before reallocation](./mutrefvec.excalidraw.svg)

So when `v0.push_str` is called, `v0` is being dereferenced twice. Once, implicitly, where it becomes `(*v0).push_str` and second is within the implementation of push_str, to actually get to the bytes in the heap memory where "Hello World" is stored and to clone it. In this process, the memory that contains "Hello World" gets freed, and "Hello Worldhi" gets allocated elsewhere in the heap. Of course this means that the pointer within `v[0]` needs to change.

Because `v0` just points to `v[0]`, `v0` itself remains unchanged.

![Stack and Heap diagram of using mutable reference to v[0] after reallocation](./mutrefvec_after.excalidraw.svg)

## Investigating the Problem

Instead, when we try to do:
```rust
let mut v0 = v[0];
```
we are trying to move the first element in the vector into `v0`. This means we are trying to make `v0` the owner of the data, and v0 will get to hold a separate pointer to "Hello World".

![Stack and Heap diagram of moving v[0] to v0 before reallocation](./move.excalidraw.svg)

This leads to undefined behaviour, since when you append to the string by calling `v0.push_str`, the bytes will get reallocated within the heap, and the pointer in `v0` will change. However, `v[0]` does not know about this change, and holds a pointer to freed memory.

![Stack and Heap diagram of moving v[0] to v0 after reallocation](./move_after.excalidraw.svg)

This is why string does not implement the copy trait, since simply "copying"(bitwise copy) the "string" (metadata) doesn't cleanly copy what the string represents. Broadly speaking, any struct containing a pointer cannot implement copy. (references are just pointers with rust semantics). We could `clone` the string, or use references.

## Conclusion
By modifying `v[0]` through a mutable reference, we ensure that there don't exist multiple pointers to the same data, and thus ensure that none of the pointers get stale.

Rust enforces that data either have:
- one mutable reference
- or many immutable references
  
but not both at the same time.

In practice, we do not need to think about why these rules in rust exist. We can treat them as an abstraction (at zero cost) to prevent us from undefined behaviour such as this. This is the benefit of Rust over other non garbage collected languages, the compiler rules protect us from footguns like these. Simply following these rules is enough, and we don't need to model all of the memory in our head.


## Extras
Code to demonstrate what we covered above
```rust
let mut v = [String::from("hello world"), String::from("Goodbye World")];

let s0 = &v[0];
let s1 = &v[1];

let v0 = &*v[0];
let v1 = &*v[1];

println!("s0 {:p}", s0);
println!("v {:p}", v.as_ptr());

println!("s1 {:p}", s1);

println!("v0 {:p}", v0);
println!("v1 {:p}", v1);



let s0 = &mut v[0];
(*s0).push_str("hi");

  
let s0 = &v[0];
let s1 = &v[1];

let v0 = &*v[0];
let v1 = &*v[1];

println!("s0 {:p}", s0);
println!("v {:p}", v.as_ptr());  

println!("s1 {:p}", s1);

println!("v0 {:p}", v0);
println!("v1 {:p}", v1);
```
This code outputs this (on my machine):
```
s0 0x16f4863f0
v  0x16f4863f0
s1 0x16f486408
v0 0x159606a90
v1 0x159606aa0
s0 0x16f4863f0
v  0x16f4863f0
s1 0x16f486408
v0 0x159606af0
v1 0x159606aa0
```
We can easily see that:
- `s0` = `v`. This is because internally the metadata for the vector includes a pointer to its first element. 
- `s0` , and `s1` do not change. This is because the vector doesn't get reallocated in this example, so it's elements retain their space in the heap.
- `v1` does not change. Since the string in `v[1]` wasn't changed, it's not reallocated, and the bytes retain the same place in the heap.
- `v0` does change. Since this string is modified, it's original location in the heap is freed, a new string is created and allocated in a different portion of the heap.