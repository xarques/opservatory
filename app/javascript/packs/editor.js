import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import 'brace/theme/twilight';
import 'brace/theme/chrome';
import * as Ajv from 'ajv/dist/ajv.min.js';

const ajv = Ajv();

const aceEditor = ((tagId, content) => {
  const aceEditor = ace.edit(tagId);
  aceEditor.getSession().setMode('ace/mode/javascript');
  // aceEditor.setTheme('ace/theme/monokai');
  aceEditor.setTheme('ace/theme/chrome');
  if (content) {
    aceEditor.setValue(content);
  }
  return aceEditor;
});

const validateExerciseCallback = ((schema, editor, sourceTagId, targetTagId) => {
  document.getElementById(sourceTagId).addEventListener('click', () => {
    validateExercise(schema, editor.getValue(), targetTagId)
  });
});

const validateExercise = ((schema, code, targetTagId) => {
  document.getElementById("exercise_code").value = code;
  const validate = ajv.compile(JSON.parse(schema));
  const valid = validate(JSON.parse(code));
  const targetDiv = document.getElementById(targetTagId);
  if (valid) {
    targetDiv.innerHTML = "Valid";
    console.log('Valid!');
  }
  else {
    targetDiv.innerHTML = "";
    validate.errors.forEach((error) => {
      if (error.params.additionalProperty) {
        targetDiv.innerHTML += `Unknown Property ${error.params.additionalProperty}<br>`;
      } else {
        targetDiv.innerHTML += `${error.message}<br>`;
      }
    });
  }
  return valid;
});

window.aceEditor = aceEditor;
window.validateExerciseCallback = validateExerciseCallback;
window.validateExercise = validateExercise;
