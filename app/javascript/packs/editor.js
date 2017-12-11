import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import 'brace/theme/twilight';
import 'brace/theme/chrome';
import * as Ajv from 'ajv/dist/ajv.min.js';
import 'aws-sdk';
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

// const cloudformation = new AWS.CloudFormation();

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
  let valid = false;
  const deployButton = document.getElementById("deploy");
  const targetDiv = document.getElementById(targetTagId);
  try {
   valid = validate(JSON.parse(code));
  }
  catch (exception) { // non-standard
    // Set the status to unvalid
    document.getElementById("exercise_status").value = 2;
    if (deployButton) {
      deployButton.classList.add("disabled");
    }
    targetDiv.innerHTML = "Code is not valid";
    return true;
  }
  if (valid) {
    targetDiv.innerHTML = "Your code is valid";
    // Set the status to valid
    document.getElementById("exercise_status").value = 1;
    if (deployButton) {
      deployButton.classList.remove("disabled");
    }
    console.log('Code is Valid!');
  }
  else {
    // Set the status to unvalid
    document.getElementById("exercise_status").value = 2;
    if (deployButton) {
      deployButton.classList.add("disabled");
    }
    targetDiv.innerHTML = "";
    validate.errors.forEach((error) => {
      if (error.params.additionalProperty) {
        targetDiv.innerHTML += `Unknown Property ${error.params.additionalProperty}<br>`;
      } else {
        targetDiv.innerHTML += `${error.message}<br>`;
      }
    });
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
        targetDiv.innerHTML = `Stack ${stackName} can't been deployed. Error: ${err}`;
      }
    } else {
      const p = JSON.parse(data.Payload);
      if (p.statusCode === "200") {
        deployed = true;
        document.getElementById("exercise_status").value = 3;
        targetDiv.innerHTML = `Stack ${stackName} is under deployment`;
        // Wait bucket creation before displaying the buxket content
        setTimeout(function(){
          setBucketName(bucketName);
          targetDiv.innerHTML = `Stack ${stackName} has been deployed`;
        }, 15000);
      } else {
        targetDiv.innerHTML = p.body;
      }
      console.log(data);           // successful response
    }
    return deployed;
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

window.aceEditor = aceEditor;
window.validateExerciseCallback = validateExerciseCallback;
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
