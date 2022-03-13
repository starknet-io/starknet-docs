import React from 'react';
import {CardContent, CardMedia, Typography} from '@mui/material';

export const HomepageCard = ({title, text, img}) => {
  return (
    <>
      <CardMedia
        component="img"
        height="60"
        title={title}
        image={`./img/${img}`}
      />
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{color: 'var(--ifm-color-primary-darkest)'}}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--ifm-color-primary-darkest)',
            textTransform: 'capitalize'
          }}
        >
          {text}
        </Typography>
      </CardContent>
    </>
  );
};
