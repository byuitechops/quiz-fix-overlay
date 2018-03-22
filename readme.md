# Quiz Fix Overlay
### *Package Name*: quiz-fix-overlay
### *Child Type*: Post-import
### *Platform*: Online
### *Required*: Required

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions. You can view extended documentation [Here](https://github.com/byuitechops/d2l-to-canvas-conversion-tool/tree/master/documentation).

## Purpose
This child module fixes popups (hints) in quizzes so they match the dialog section of the TOT web features page. It strips out the JavaScript that was used in D2L and replaces it with the appropriate HTML classes.

## How to Install

```
npm install quiz-fix-overlay
```

## Run Requirements
This child module requires the following fields in the course.info object:
* `canvasOU`

## Options
None

## Outputs
None 

## Process
Describe in steps how the module accomplishes its goals.

1. GET all quizzes in the course.
2. Loop through each quiz & GET all quiz questions
3. Loop through quiz questions and replace old JS with new HTML as needed

## Log Categories
Categories used in logging data for this module:

- Quiz Overlays Updated

## Requirements

Convert the old 'Dialog' web feature into the new 'overlay' web feature (I may have gotten the names of the web feature backwards).