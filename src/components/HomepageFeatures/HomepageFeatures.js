import React from 'react';
import styles from './HomepageFeatures.module.css';
import {Button, Grid} from '@mui/material';
import {HomepageCard} from '../HomepageCard/HomepageCard';
import list from '../../config/home.json';
import {useHistory} from '@docusaurus/router';

const overrideLinkStyle = {
  flexFlow: 'column nowrap',
  width: '100%',
  minHeight: '100%',
  backgroundColor: '#fff',
  [':hover']: {
    boxShadow: '-1px 5px 19px 0px rgba(0,0,0,0.3)',
    backgroundColor: '#fff'
  }
};

export const HomepageFeatures = () => {
  const history = useHistory();

  const renderCards = () => {
    const handleOnClick = linkName => history.push(linkName);
    const handleOnKeyDown = (event, linkName) => {
      if (event.key === 'Enter') {
        history.push(linkName);
      }
    };
    return list.length
      ? list.map(({linkName, ...props}, idx) => (
          <Grid key={idx} item xs={8} md={4}>
            <Button
              variant="contained"
              onClick={() => handleOnClick(linkName)}
              onKeyDown={e => handleOnKeyDown(e, linkName)}
              sx={overrideLinkStyle}
            >
              <HomepageCard {...props} />
            </Button>
          </Grid>
        ))
      : null;
  };

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <Grid
            container
            spacing={4}
            sx={{justifyContent: 'center', padding: '0 24px'}}
          >
            {renderCards()}
          </Grid>
        </div>
      </div>
    </section>
  );
};
