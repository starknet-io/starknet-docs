import React from 'react';
import { CardContent, CardMedia, Typography } from '@mui/material';
import { GlobalStyles } from '@mui/styled-engine';

const HomepageCard = ({ title, text, img }) => {
  console.log('got img: ', img);
  const blue = '#29296E';
  return (
    <>
      <CardMedia
        component="img"
        height="60"
        title={title}
        image={`./img/${img}`}
      />
      <CardContent>
        <Typography variant="h5" component="div" sx={{ color: blue }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: blue, textTransform: 'capitalize' }}
        >
          {text}
        </Typography>
      </CardContent>
    </>
  );
};

export default HomepageCard;
