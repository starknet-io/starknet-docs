import React from 'react';
import {
  CardContent,
  CardMedia,
  Typography,
  Button,
  SvgIcon
} from '@mui/material';

const HomepageAvatar = img => {};

export const HomepageCard = ({title, text, img}) => {
  return (
    <>
      <CardMedia
        component="img"
        height="44"
        title={title}
        image={`./img/${img}`}
        className="homePageCardImage"
        sx={{width: 'unset', marginBottom: '22px', marginLeft: '0', marginRight: 'auto', maxWidth: '70px'}}
      />
      <CardContent
        sx={{
          padding: 0,
          display: 'flex',
          alignItems: 'flex-start',
          flexGrow: 1,
          width: '100%',
          flexDirection: 'column',
          textAlign: 'left'
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: 'inherit',
            fontSize: 22,
            fontWeight: 600,
            textTransform: 'initial'
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'inherit',
            textTransform: 'capitalize',
            fontSize: 16,
            marginBottom: '20px'
          }}
        >
          {text}
        </Typography>
        {/* <Button
          component="span"
          sx={{
            color: 'inherit',
            fontSize: 16,
            display: 'flex',
            textTransform: 'initial',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            padding: 0,
            transition: 'none',
            marginTop: 'auto',
            [':hover']: {
              backgroundColor: 'transparent'
            }
          }}
          endIcon={
            <SvgIcon
              className='homePageCardArrow'
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </SvgIcon>
          }
        >
          Explore Blocks
        </Button> */}
      </CardContent>
    </>
  );
};
