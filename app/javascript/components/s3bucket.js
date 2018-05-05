import 'aws-sdk';
import swal from 'sweetalert2';

//var albumBucketName = 'opservatory-s3-challenge';
//var albumBucketName = 'opservatory-s3-public-bucket-7';
var albumBucketName = '';
var bucketRegion = 'eu-west-1';
var IdentityPoolId = 'eu-west-1:c260132a-6eef-461f-8471-f2735e710e2c';
// var IdentityPoolId = ENV[AWS_IDENTITY_POOL_ID];

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3;
if (albumBucketName !== '') {
  setBucketName(albumBucketName);
}

function setBucketName(bucketName) {
  albumBucketName = bucketName;
  s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: albumBucketName}
  });
  listAlbums();
}

function listAlbums() {
  if (!s3) {
    var htmlTemplate = ["<p>No bucket has been created</p>"];
    document.getElementById('exercise-app').innerHTML = getHtml(htmlTemplate);
  }
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      //return alert('There was an error listing your albums: ' + err.message);
      var htmlTemplate = [
        '<div class="text-center">',
          '<img height="300" src="/assets/ChallengeS3.png" alt="Challenges3">',
        '</div>'
      ];
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));

        return getHtml([
          '<li>',
            '<span>',
              '<a href="#" onclick="viewAlbum(\'' + albumName + '\')">',
                albumName,
              '</a>',
            '</span>',
            '<span>',
              '<a href="#" onclick="deleteAlbum(\'' + albumName + '\')">',
              '<i class="far fa-trash-alt"></i>',
              '</a>',
            '</span>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        '' :
        '<p>Create your first album</p>';
      var htmlTemplate = [
        '<div class="exercise-app-body">',
          '<h5>ALBUMS</h5>',
          message,
          '<ul style="list-style-type:none;">',
            getHtml(albums),
          '</ul>',
        '</div>',
        '<div class="exercise-app-footer">',
          '<input type="text" name="albumName" id="albumName" placeholder="Enter Album Name" class="form-control search-bar">',
          '<button onclick="createAlbum(document.getElementById(\'albumName\').value)" class="btn btn-primary btn-exercise">',
            'Create New Album',
          '</button>',
        '</div>'
      ]
    }
    document.getElementById('exercise-app').innerHTML = getHtml(htmlTemplate);
  });
}

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert('Album names must contain at least one non-space character.');
  }
  if (albumName.indexOf('/') !== -1) {
    return alert('Album names cannot contain slashes.');
  }
  var albumKey = encodeURIComponent(albumName) + '/';

  s3.headObject({Key: albumKey}, function(err, data) {
    if (!err) {
      return alert('Album already exists.');
    }
    if (err.code !== 'NotFound') {
      return alert('There was an error creating your album: ' + err.message);
    }
    s3.putObject({Key: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error creating your album: ' + err.message);
      }
      //alert('Successfully created album.');
      viewAlbum(albumName);
    });
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // `this` references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/' ;

    var photos = data.Contents.map(function(photo) {
      // The first photo is the albumPhotosKey
      var photoKey = photo.Key;
      if (photoKey != albumPhotosKey) {
        var photoUrl = bucketUrl + encodeURIComponent(photoKey);
        return getHtml([
          '<span>',
            '<div>',
              '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
            '</div>',
            '<div>',
              '<span>',
                '<a href="#" onclick="deletePhoto(\'' + albumName + "','" + photoKey + '\')">',
                  '<i class="far fa-trash-alt"></i>',
                '</a>',
              '</span>',
              '<span>',
                photoKey.replace(albumPhotosKey, ''),
              '</span>',
            '</div>',
          '</span>',
        ]);
      }
    });
    var message = photos.length > 1?
      '' :
      '<p>Please add photos</p>';
    var htmlTemplate = [
      '<h5>',
        'Album: ' + albumName,
      '</h5>',
      message,
      '<div>',
        getHtml(photos),
      '</div>',
      '<input id="photoupload" type="file" accept="image/*">',
      '<div class="exercise-app-footer">',
        '<button id="addphoto" onclick="addPhoto(\'' + albumName +'\')" class="btn btn-primary btn-exercise">',
          'Add Photo',
        '</button>',
        '<button onclick="listAlbums()" class="btn btn-primary btn-exercise">',
          'Back To Albums',
        '</button>',
      '</div>'
    ]
    document.getElementById('exercise-app').innerHTML = getHtml(htmlTemplate);
  });
}

function addPhoto(albumName) {
  var files = document.getElementById('photoupload').files;
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }
  var file = files[0];
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + '/';

  var photoKey = albumPhotosKey + fileName;
  s3.upload({
    Key: photoKey,
    Body: file,
    ACL: 'public-read'
  }, function(err, data) {
    if (err) {
      return alert('There was an error uploading your photo: ', err.message);
    }
    // alert('Successfully uploaded photo.');
    viewAlbum(albumName);
  });
}

function deletePhoto(albumName, photoKey) {
  s3.deleteObject({Key: photoKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your photo: ', err.message);
    }
    // alert('Successfully deleted photo.');
    viewAlbum(albumName);
  });
}

function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your album: ', err.message);
    }
    var objects = data.Contents.map(function(object) {
      return {Key: object.Key};
    });
    s3.deleteObjects({
      Delete: {Objects: objects, Quiet: true}
    }, function(err, data) {
      if (err) {
        return alert('There was an error deleting your album: ', err.message);
      }
      // alert('Successfully deleted album.');
      listAlbums();
    });
  });
}

function getHtml(template) {
  var htmlTemplate = [
    //'<div class="container">',
    template.join('\n'),
    //'</div>'
  ];
  return htmlTemplate.join('\n');
}

export {deleteAlbum, deletePhoto, addPhoto, viewAlbum, createAlbum, listAlbums, setBucketName};
// window.deleteAlbum = deleteAlbum;
// window.deletePhoto = deletePhoto;
// window.addPhoto = addPhoto;
// window.viewAlbum = viewAlbum;
// window.createAlbum = createAlbum;
// window.listAlbums = listAlbums;
// window.setBucketName = setBucketName;
