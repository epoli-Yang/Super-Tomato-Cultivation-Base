import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.component}>
      <div className={styles.iConArrowChevronLeft}>
        <img src="../image/mn50eor8-o5fqhky.svg" className={styles.rollback} />
      </div>
      <p className={styles.text}>白鲸馆</p>
      <img
        src="../image/mn50eor8-my0erws.svg"
        className={styles.wechatsystemDefault3}
      />
    </div>
  );
}

export default Component;
