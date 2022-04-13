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
  border: '1px dashed var(--cust-color-primary)',
  boxShadow: 'none !important',
  color: 'inherit',
  padding: '23px 25px',
  borderRadius: '10px',
  [':hover']: {
    boxShadow: '-1px 5px 19px 0px rgba(0,0,0,0.3)',
    backgroundColor: 'var(--cust-color-primary)'
  }
};

export const HomepageFeatures = () => {
  const history = useHistory();

  const renderCards = () => {
    const handleOnClick = linkName => {
      if (!linkName) return;
      if (linkName.startsWith('http')) {
        window.open(linkName, '_blank');
      } else {
        history.push(linkName);
      }
    };

    const handleOnKeyDown = (event, linkName) => {
      if (event.key === 'Enter') {
        history.push(linkName);
      }
    };
    return list.length
      ? list.map(({linkName, ...props}, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={4} lg={2.4}>
            <Button
              variant="contained"
              onClick={() => handleOnClick(linkName)}
              onKeyDown={e => handleOnKeyDown(e, linkName)}
              sx={overrideLinkStyle}
              className={styles.card}
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
            spacing={1.5}
            sx={{justifyContent: 'center', padding: '0 20px'}}
          >
            {renderCards()}
          </Grid>
        </div>
      </div>
    </section>
  );
};
