import React from "react";
import PropTypes from "prop-types";
import { Image } from 'cloudinary-react';
import { Carousel } from 'react-bootstrap';
import cloudinary from 'cloudinary-core';

class Challenge extends React.Component {
  constructor() {
    super();
    this.createBackgroundImage = this.createBackgroundImage.bind(this);
    this.renderChallenge = this.renderChallenge.bind(this);
    
    this.state = {
      challenges: []
    };
  }    
  
  componentDidMount() {
    fetch('/api/v1/challenges')
    .then(response => response.json())
    .then((data) => {
      this.setState({challenges: data});
    });
  }
  
  createBackgroundImage(publicId) {
    const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'dwjwkkagx' });
    const width = 300;
    const height = 200;
    //height: 200, width: 300, crop: : pad
    const t = new cloudinary.Transformation();
    //t.angle(20).crop('scale').width(width).aspectRatio('1:1');
    t.crop('pad').width(width).height(height);
    return cloudinaryCore.url(publicId, t);
  }

  renderChallenge(challenge) {
    const bgImage = this.createBackgroundImage(challenge.photo.public_id);
    const divStyle = {
      //backgroundImage: `url('${challenge.photo.url}')`,
      backgroundImage: `url('${bgImage}')`
    };
    const pathToChallenge = `challenges/${challenge.id}`;
    return (
      <Carousel.Item key={challenge.id}>
        <div className="card" style={divStyle}>
          {/* <Image cloudName="dwjwkkagx" publicId={challenge.photo.public_id} width="300" crop="scale" /> */}
          <Carousel.Caption>
            <h2>{challenge.name}</h2>
          </Carousel.Caption>
          <a className="card-link" href={pathToChallenge}></a>
        </div>
      </Carousel.Item>
    );
    // return (
    //   <div className="item" key={challenge.id}>
    //     <div className="col-md-4">
    //       <div className="card" style={divStyle}>
    //       {/* <div className="card carousel_card" style={divStyle}> */}
    //         {/* <Image cloudName="dwjwkkagx" publicId="{challenge.photo.my_public_id}" width="300" crop="scale" /> */}
    //         <div className="card-category"></div>
    //         <div className="card-description-carousel">
    //           <h2> {challenge.name}</h2>
    //         </div>
    //         {/* <%= link_to '', challenge_path(challenge), class: 'card-link' %> */}
    //       </div>
    //     </div>
    //   </div>
    // )
  }

  render() {
    return(
      <div className="popchallenges-container ">
        <div className="row challengerow">
          <h3>TRY OUR CHALLENGES</h3>
          <Carousel>
            {this.state.challenges.map(this.renderChallenge)}
          </Carousel>
        </div>
      </div>
    );
  }

  // render () {
  //   return (
  //     <div className="popchallenges-container ">
  //       <div className="row challengerow">
  //         <h3>TRY OUR CHALLENGES</h3>
  //         <div id="carousel-example-generic" className="carousel slide multi-item-carousel" data-ride="carousel">
  //           <div className="carousel-inner">
  //             {this.state.challenges.map(this.renderChallenge)}
  //           </div>

  //           <a className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
  //             <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
  //             <span className="sr-only">Previous</span>
  //           </a>
  //           <a className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
  //             <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
  //             <span className="sr-only">Next</span>
  //           </a>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
}

Challenge.propTypes = {
  challenges: PropTypes.object
}

export default Challenge;
