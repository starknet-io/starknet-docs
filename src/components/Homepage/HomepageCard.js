import React from 'react';
import { CardContent, CardMedia, Typography } from "@mui/material";
import { GlobalStyles } from '@mui/styled-engine';
// import BannerImage from './undraw_docusaurus_mountain.svg'


const HomepageCard = ({ title, text, img }) => {
  // const banner = BannerImage;
  const blue = '#29296E';
  return (
    <>
      <CardMedia
        component="img"
        height="60"
        title={title}
      />
      <CardContent>
        <Typography variant="h5" component="div" sx={{ color: blue }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: blue }}>
          {text}
        </Typography>
      </CardContent>
    </>
  )
};

export default HomepageCard;


