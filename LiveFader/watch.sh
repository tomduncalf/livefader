#!/bin/bash
find . -name '*.js' | entr -s 'touch main.js'
