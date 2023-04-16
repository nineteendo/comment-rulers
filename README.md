# Comment Rulers

Comment Rulers is a Visual Studio Code extension that helps you keep your code's comments within a specified length by visualizing where the comment line length reaches 80 characters.

The extension adds a green line at the end of the 80th character position of each comment line, allowing you to easily identify and adjust comments that exceed the desired length.

With Comment Rulers, you can ensure that your comments are concise and easy to read, improving the readability and maintainability of your codebase.

## Features

![features](videos/features.gif)

## Requirements

None

## Extension Settings

This extension contributes the following settings:

* `comment-rulers.backgroundColor`: The background color of the rulers.
* `comment-rulers.blockCommentDelimiters`: The delimiters for block comments.
* `comment-rulers.border`: The CSS border style of the rulers.
* `comment-rulers.color`: The color of the underscores to move the ruler.
* `comment-rulers.enabled`: Enable/disable drawing comment rulers.
* `comment-rulers.escapableChars`: Escapable delimiter characters.
* `comment-rulers.inlineCommentDelimiters`: The delimiters for inline comments.
* `comment-rulers.maxCommentLineLength`: The maximum length of a comment line.
* `comment-rulers.multiLineStringDelimiters`: The delimiters for multi-line strings (to ingore included comment delimiters).
* `comment-rulers.singleLineStringDelimiters`: The delimiters for single-line strings (to ingore included comment delimiters).

## Known Issues

- Comments in string templates aren't supported:
    ```javascript
    let num = 12;
    let str = `${num /* comment */}`;
     ```

## Release Notes

### 1.0.3 (Apr 16. 2023)

- Fixed ruler misplaced by using transparent underscores (color can be modified)
- Fixed that block comments can be terminated by part of the first delimiter
- Removed backtick from escapableChars, added backslash
- Removed backtick from singleLineStringDelimiters
- Added green background color to rulers (color can be modified)
- Renamed style to border

See [changelog](CHANGELOG.md) for all changes.

---

**Enjoy!**
