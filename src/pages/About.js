import React from "react";

const About = () => {
  return (
    <div className="side-content">
      <h2 className="title">About</h2>
      <p className="info">Card Binder is a site I decided to create to make it easier to visualize custom binder pages for your Pokémon TCG collection. I found myself creating 
        custom pages in Excel and wanted to make it easier to do so. I also wanted to make it easier for others to do too.
      </p>
      <p className="info">This is mostly for your personal collection, or if you want to see what a page full of ARs or SIRs would look like. It is not very useful if
        you are trying to use it to organize a master set or visualize your full collection. For that I would recommend some sites like the ones below:
      </p>
      <ul>
        <li><a className="link" href="https://www.pokellector.com/" target="_blank" rel="noopener noreferrer">Pokellector</a></li>
        <li><a className="link" href="https://www.pkmn.gg/" target="_blank" rel="noopener noreferrer">pkmn.gg</a></li>
        <li><a className="link" href="https://pkmnbinder.com/" target="_blank" rel="noopener noreferrer">pkmnbinder</a></li>
      </ul>
      <p className="info">All Pokémon TCG data provided by the <a style={{ fontWeight: "bold"}} className="link" href="https://pokemontcg.io/" target="_blank" rel="noopener noreferrer">Pokémon TCG API </a>
        and if you would like to <a style={{ fontWeight: "bold"}} className="link" href="https://pokemontcg.guru/donate" target="_blank" rel="noopener noreferrer">donate</a> please do so to the API directly. 
        All images are property of The Pokémon Company International, Inc. and are used for educational purposes only.
      </p>
      <h2 className="title">Contact</h2>
      <p className="info">If you have any ideas for any features or bugs to report, please feel free to reach out below or on my social media.</p>
      <p className="info">Site made by <a className="link" href="https://davidchicas.me/" target="_blank" rel="noopener noreferrer">David Chicas</a></p>
    </div>
  );
};

export default About;
