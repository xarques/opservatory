import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/theme/monokai';
import 'brace/theme/twilight';
import 'brace/theme/chrome';
import 'brace/theme/vibrant_ink'
import * as Ajv from 'ajv/dist/ajv.min.js';
import 'aws-sdk';
import swal from 'sweetalert2';
import {deleteAlbum, deletePhoto, addPhoto, viewAlbum, createAlbum, listAlbums, setBucketName} from '../components/s3bucket';

const ajv = Ajv();
// const bucketRegion = 'eu-west-1';
// const IdentityPoolId = 'eu-west-1:c260132a-6eef-461f-8471-f2735e710e2c';
// var IdentityPoolId = ENV[AWS_IDENTITY_POOL_ID];

// AWS.config.update({
//   region: bucketRegion,
//   credentials: new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: IdentityPoolId
//   })
// });

AWS.config.apiVersions = {
  //cloudformation: '2010-05-15',
  lambda: '2015-03-31'
  // other service API versions
};

const lambda = new AWS.Lambda();

const swalConfirmButtonColor = '#f9be00';
const swalCancelButtonColor = '#222c36';

// const cloudformation = new AWS.CloudFormation();
const configureAceEditor = ((tagId, content, mode) => {
  const aceEditor = ace.edit(tagId);
  if (mode) {
    aceEditor.getSession().setMode(`ace/mode/${mode}`);
  } else {
    aceEditor.getSession().setMode('ace/mode/javascript');
  }
  aceEditor.setTheme('ace/theme/vibrant_ink');
  if (content && content !== "") {
    aceEditor.setValue(content);
  }
  aceEditor.clearSelection();
  return aceEditor;
});

const aceEditor = ((tagId, content) => {
  return configureAceEditor(tagId, content);
});

let aceEditorInstructions;
let aceEditorStartPoint;
let aceEditorSolution;
let aceEditorSchema;

const aceEditorChallenge = (() => {
  if (document.getElementById("javascript-editor-start-point")) {
    aceEditorInstructions = configureAceEditor("javascript-editor-instructions", "", "html");
    aceEditorStartPoint = configureAceEditor("javascript-editor-start-point");
    aceEditorSolution = configureAceEditor("javascript-editor-solution");
    aceEditorSchema = configureAceEditor("javascript-editor-schema");
  }
});

const saveChallenge = (() => {
  document.getElementById("challenge_instructions").value = aceEditorInstructions.getValue();
  document.getElementById("challenge_start_point").value = aceEditorStartPoint.getValue();
  document.getElementById("challenge_solution").value = aceEditorSolution.getValue();
  document.getElementById("challenge_schema").value = aceEditorSchema.getValue();
  var hint_desc = document.querySelectorAll("#hints-list li");
  var hints_concat = '';
  for (var i = 0; i < hint_desc.length; ++i) {
     var hint = hint_desc[i].innerText;;
     hints_concat = hints_concat + '|' + hint;
    };
  document.getElementById("challenge_hints_list").value = hints_concat;
  document.getElementById("new_challenge").submit();
});

const retryExercise = (() => {
  swal({
    title: 'Do you want to retry this exercise ?',
    text: "The code and the tips will be reinitialized",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: swalConfirmButtonColor,
    cancelButtonColor: swalCancelButtonColor,
    confirmButtonText: 'Yes, reset it!'
  })
  .then((result) => {
    if (result.value) {
      document.getElementById("retry").click();
    }
  });
});

const validateExerciseCallback = ((schema, editor, sourceTagId, targetTagId) => {
  document.getElementById(sourceTagId).addEventListener('click', () => {
    validateExercise(schema, editor.getValue(), targetTagId);
  });
});

const formatJsonSchemaErrors = ((errors) => {
  // - Missign attribute:
  // {"keyword":"required",
  //  "dataPath":".Resources['publicS3']",
  //  "schemaPath":"#/properties/Resources/patternProperties/%5E%5Ba-zA-Z0-9%5D%2B%24/required",
  //  "params":{"missingProperty":"Type"},
  //  "message":"should have required property 'Type'"}
  // - Unhautorize Attribute:
  // {"keyword":"additionalProperties",
  //  "dataPath":".Resources['publicS3']",
  //  "schemaPath":"#/properties/Resources/patternProperties/%5E%5Ba-zA-Z0-9%5D%2B%24/additionalProperties",
  //  "params":{"additionalProperty":"Type2"},
  //  "message":"should NOT have additional properties"}
  // - Incorrect value:
  // {"keyword":"enum",
  //  "dataPath":".Resources['publicS3'].Type",
  //  "schemaPath":"#/properties/Resources/patternProperties/%5E%5Ba-zA-Z0-9%5D%2B%24/properties/Type/enum",
  //  "params":{"allowedValues":["AWS::S3::Bucket"]},
  //  "message":"should be equal to one of the allowed values"}
  // {"keyword":"enum",
  //  "dataPath":".Resources['publicS3'].Properties.CorsConfiguration.CorsRules[0].AllowedMethods[0]",
  //  "schemaPath":"#/properties/Resources/patternProperties/%5E%5Ba-zA-Z0-9%5D%2B%24/properties/Properties/properties/CorsConfiguration/properties/CorsRules/items/properties/AllowedMethods/items/enum",
  //  "params":{"allowedValues":["POST","GET","PUT","DELETE","HEAD"]},
  //  "message":"should be equal to one of the allowed values"}
  const messages = [];
  errors.forEach((error) => {
    const keyword = error.keyword;
    const params = error.params;
    const dataPath = error.dataPath;
    switch(keyword) {
    case "required":
        messages.push(`<p class='invalid-result-text'>Missing property <em>${params.missingProperty}</em></p>`);
        break;
    case "additionalProperties":
        messages.push(`<p class='invalid-result-text'>Property <em>${params.additionalProperty}</em> is not allowed</p>`);
        break;
    case "enum":
        const property = dataPath.split('.').pop().replace(/\[.*\]/g,'');
        messages.push(`<p class='invalid-result-text'>Value of Property <em>${property}</em> is not correct</p>`);
        break;
    default:
        messages.push(error.message);
    }
  });
  return messages;
});

const validateExercise = ((schema, code, targetTagId) => {
  document.getElementById("exercise_code").value = code;
  const validate = ajv.compile(JSON.parse(schema));
  let valid = false;
  const deployButton = document.getElementById("deploy");
  const targetDiv = document.getElementById(targetTagId);
  const validateButton = document.getElementById("validate-button");
  try {
   valid = validate(JSON.parse(code));
  }
  catch (exception) { // non-standard
    // Set the status to unvalid
    document.getElementById("exercise_status").value = 2;
    if (deployButton) {
      deployButton.setAttribute("disabled","");
    }
    targetDiv.innerHTML = "Code is not valid";
    return true;
  }
  if (valid) {
    targetDiv.innerHTML = "<p class='valid-result-text'>Your code is valid</p>";
    // Set the status to valid
    document.getElementById("exercise_status").value = 1;
    if (deployButton) {
      deployButton.removeAttribute("disabled");
      setBucketName(getBucketName(code));
      document.querySelector(".result").classList.add("result-valid");
      document.querySelector(".result").classList.remove("result-invalid");
      validateButton.classList.remove("btn-exercise-important");
      deployButton.classList.add("btn-exercise-important");

    }
    // console.log('Code is Valid!');
  }
  else {
    // Set the status to unvalid
    document.getElementById("exercise_status").value = 2;
    if (deployButton) {
      deployButton.setAttribute("disabled","");
      validateButton.classList.add("btn-exercise-important");
      deployButton.classList.remove("btn-exercise-important");
    }
    document.querySelector(".result").classList.remove("result-valid");
    document.querySelector(".result").classList.add("result-invalid");
    targetDiv.innerHTML = formatJsonSchemaErrors(validate.errors).join('\n');
  }
  return true;
});

const getBucketName = ((code) => {
  const resourceName = Object.keys(JSON.parse(code).Resources)[0];
  return JSON.parse(code).Resources[resourceName].Properties.BucketName;
});

const getStackName = ((code) => {
  const resourceName = Object.keys(JSON.parse(code).Resources)[0];
  return `opservatory-s3-challenge-${resourceName}`;
});

// Deploy the stack using a lambda function
const deployExercise = ((schema, code, targetTagId) => {
  let deployed = false;
  swal({
    title: 'Do you want to deploy this exercise ?',
    text: "Your Cloud Provider account may be charged",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: swalConfirmButtonColor,
    cancelButtonColor: swalCancelButtonColor,
    confirmButtonText: 'Yes, deploy it!'
  }).then((result) => {
    if (result.value) {
      if (!validateExercise(schema, code, targetTagId)) {
        return false;
      }
      const targetDiv = document.getElementById(targetTagId);
      const resourceName = Object.keys(JSON.parse(code).Resources)[0];
      const bucketName = getBucketName(code);
      const stackName = getStackName(code);
      const bodyContent = {
        StackName: stackName,
        TemplateBody: code
      }

      const body = {
        body: JSON.stringify(bodyContent)
      }

      const stringifiedBody = JSON.stringify(body);

      const params = {
        FunctionName: 'cloudformation-api-dev-create', /* required */
        // ClientContext: '',
        // InvocationType: Event,
        // LogType: None,
        Payload: stringifiedBody /* Strings will be Base-64 encoded on your behalf */
        // Qualifier: 'STRING_VALUE'
      };
      lambda.invoke(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          if (data.Payload.body) {
            targetDiv.innerHTML = data.Payload.body;
          } else {
            targetDiv.innerHTML = `<p class='invalid-result-text>Stack ${stackName} can't been deployed. Error: ${err}</p>`;
          }
          swal({
            title: 'Oops...',
            text: targetDiv.innerHTML,
            type: 'error',
            confirmButtonColor: swalConfirmButtonColor
            }
          );
        } else {
          const p = JSON.parse(data.Payload);
          if (p.statusCode === "200") {
            deployed = true;
            document.getElementById("exercise_status").value = 3;
            targetDiv.innerHTML = `Stack ${stackName} is under deployment`;
            swal({
              title: `Stack ${stackName} is under deployment`,
              //text: 'I will close in 5 seconds.',
              timer: 15000,
              onOpen: () => {
                swal.showLoading()
              }
            }).then((result) => {
              if (result.dismiss === 'timer') {
                setBucketName(bucketName);
                targetDiv.innerHTML = `<p class='valid-result-text>Stack ${stackName} has been deployed</p>`;
                swal({
                  title: 'Deployed!',
                  text: `Stack ${stackName} has been deployed`,
                  type: 'success',
                  confirmButtonColor: swalConfirmButtonColor
                  }
                );
              }
            });
            // Wait bucket creation before displaying the buxket content
            // setTimeout(function(){
            //   setBucketName(bucketName);
            //   targetDiv.innerHTML = `Stack ${stackName} has been deployed`;
            // }, 15000);
          } else {
            targetDiv.innerHTML = p.body;
            swal({
              title: 'Oops...',
              text: targetDiv.innerHTML,
              type: 'error',
              confirmButtonColor: swalConfirmButtonColor
              }
            );
          }
          console.log(data);           // successful response
        }
        return deployed;
      });
    }
  });
});

// This function doesn't work. I think it is not possible (for security reason)
// to create a stack using the client SDK and cognito
//const deployExercise2 = ((code) => {
  // const resourceName = Object.keys(JSON.parse(code).Resources)[0];
  // const params = {
  //   StackName: `opservatory-s3-challenge-stack-${resourceName}`,
  //   TemplateBody: code
  // };
  // Expected params :
  // {
  //  "StackName": "MyS3Stack",
  //  "TemplateBody": "{\"Resources\" : { \"MyXavierArquesBucket\" : { \"Type\" : \"AWS::S3::Bucket\"}}}"
  // }
  //"Payload":"{\"body\":\"{\\\"StackName\\\":\\\"opservatory-s3-challenge-stack\\\",\\\"TemplateBody\\\":\\\"  {\\\\n    \\\\\\\"Resources\\\\\\\" : {\\\\n      \\\\\\\"public-s3\\\\\\\" : {\\\\n        \\\\\\\"Type\\\\\\\" : \\\\\\\"AWS::S3::Bucket\\\\\\\",\\\\n        \\\\\\\"Properties\\\\\\\" : {\\\\n          \\\\\\\"BucketName\\\\\\\" : \\\\\\\"opservatory-s3-public-bucket\\\\\\\",\\\\n          \\\\\\\"AccessControl\\\\\\\" : \\\\\\\"PublicReadWrite\\\\\\\",\\\\n          \\\\\\\"CorsConfiguration\\\\\\\" : {\\\\n            \\\\\\\"CorsRules\\\\\\\" : [\\\\n              {\\\\n                \\\\\\\"AllowedHeaders\\\\\\\" : [ \\\\\\\"*\\\\\\\" ],\\\\n                \\\\\\\"AllowedMethods\\\\\\\" : [ \\\\\\\"POST\\\\\\\", \\\\\\\"GET\\\\\\\", \\\\\\\"PUT\\\\\\\", \\\\\\\"DELETE\\\\\\\", \\\\\\\"HEAD\\\\\\\" ],\\\\n                \\\\\\\"AllowedOrigins\\\\\\\" : [ \\\\\\\"*\\\\\\\" ]\\\\n              }\\\\n            ]\\\\n          }\\\\n        }\\\\n      }\\\\n    }\\\\n  }\\\\n\\\"}\"}"}
//   cloudformation.createStack(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });

// });

// Callbacks

// swal is asynchron
// it returns a promise so the following callback ends before exiting the sweet alert

const addListener = ((tagId, event, callbackFunction) => {
  const element = document.getElementById(tagId);
  if (element) {
    element.addEventListener(event, callbackFunction);
  }
});

// const retryButtonElement = document.getElementById("retry-button");
// if (retryButtonElement) {
//   retryButtonElement.addEventListener('click', () => {
//     retryExercise();
//   });
// }
addListener("retry-button", "click", retryExercise);
addListener("save-challenge-button", "click", saveChallenge);

// const challengeFormElement = document.getElementById("save-challenge-button");
// if (challengeFormElement) {
//   challengeFormElement.addEventListener('click', () => {
//     return saveChallenge();
//   });
// }

aceEditorChallenge();

window.aceEditor = aceEditor;
window.validateExerciseCallback = validateExerciseCallback;
//window.retryExercise = retryExercise;
window.validateExercise = validateExercise;
window.deployExercise = deployExercise;
window.deleteAlbum = deleteAlbum;
window.deletePhoto = deletePhoto;
window.addPhoto = addPhoto;
window.viewAlbum = viewAlbum;
window.createAlbum = createAlbum;
window.listAlbums = listAlbums;
window.getBucketName =getBucketName;
window.setBucketName =setBucketName;
//window.beforeChallengeSave = beforeChallengeSave;
