import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import 'brace/theme/twilight';
import * as Ajv from 'ajv/dist/ajv.min.js';
// function displayAceEditor() {
//   document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementById('javascript-editor')) {
//       const javascriptEditor = ace.edit('javascript-editor');
//       javascriptEditor.getSession().setMode('ace/mode/javascript');
//       javascriptEditor.setTheme('ace/theme/monokai');
      // javascript-editor.setValue('{\n\"Resources" :\n\
      //   { "MyXavierArquesBucket" :\n\
      //     { "Type" : "AWS::S3::Bucket",\n\
      //       "Properties": {\n\
      //         "AccessControl": "PublicRead",\n\
      //         "WebsiteConfiguration": {\n\
      //             "IndexDocument": "index.html",\n\
      //             "ErrorDocument": "error.html"\n\
      //         }\n\
      //       }\n\
      //     }\n\
      //   }\n\
      // }');
//     }
//   });
// }
//export { displayAceEditor };

//const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

// const addDependencies = (() => {
//   // Synchronous read
//   const basicTypes = JSON.parse(fs.readFileSync('./schemas/basic_types.json', 'utf8'));
//   // Synchronous read
//   const resource = JSON.parse(fs.readFileSync('./schemas/resource.json', 'utf8'));
//   // Add basic_types schema
//   ajv.addSchema(basicTypes);
//   // Add resource schema
//   ajv.addSchema(resource);
// });

// const compileJSONSchema = ((jsonSchemaFile) => {
//   //addDependencies();
//   // Synchronous read
//   fetch(jsonSchemaFile)
//     .then(response => response.json())
//     .then((data) => {
//       ajv.compile(jsonSchema);
//     });
// });

export { ajv };
