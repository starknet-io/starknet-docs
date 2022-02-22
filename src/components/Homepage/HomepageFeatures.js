import React from 'react';
import styles from './HomepageFeatures.module.css';
import { Button, Grid } from '@mui/material';
import { GlobalStyles } from '@mui/styled-engine';
import HomepageCard from './HomepageCard';
import homeLinksList from '../../config/home.json';
import { useHistory } from '@docusaurus/router';

export default function HomepageFeatures() {
  const list = homeLinksList;
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <Grid container spacing={4} sx={{ justifyContent: 'center', padding: '0 24px' }}>
            {list.map(({ linkName, ...props }, idx) => {
              const history = useHistory();

              return (
                <Grid key={idx} item xs={8} md={4}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      console.log('linkName: ', linkName);
                      history.push(linkName);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        console.log('linkName: ', linkName);
                        history.push(linkName);
                      }
                    }}
                    sx={{
                      flexFlow: 'column nowrap',
                      width: '100%',
                      minHeight: '100%',
                      backgroundColor: '#fff',
                      [':hover']: {
                        boxShadow: '-1px 5px 19px 0px rgba(0,0,0,0.3)',
                        backgroundColor: '#fff'
                      }
                    }}
                  >
                    <HomepageCard {...props}></HomepageCard>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </div>
    </section>
  );
}
