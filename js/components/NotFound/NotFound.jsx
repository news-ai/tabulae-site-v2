import React from 'react';

const style = {display: 'flex', alignItems: 'center', justifyContent: 'center'};

function NotFound() {
  return (
    <div style={style}>
      <div>
        <h1>Page not found.</h1>
        <img src='https://camo.githubusercontent.com/f3f9abff46db5119b4d418ddc1abf28eca2aab08/687474703a2f2f6d656469612e67697068792e636f6d2f6d656469612f52466b574c356c714e33435a472f67697068792d74756d626c722e676966' />
      </div>
    </div>
  );
}

export default NotFound;
