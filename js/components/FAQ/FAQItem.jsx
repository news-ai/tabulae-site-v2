import React from 'react';

function FAQItem({youtubeUrl, title}) {
  return <div style={{marginTop: 10, marginBottom: 10}}>
  <p>{title}</p>
  <iframe width='560' height='315' src={`https://www.youtube.com/embed/${youtubeUrl}`} frameBorder={0} allowFullScreen></iframe>
  </div>;
}

export default FAQItem;
