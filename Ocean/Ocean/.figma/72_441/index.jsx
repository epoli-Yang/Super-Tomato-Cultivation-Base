import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.group7Variant2}>
      <div className={styles.rectangle4}>
        <div className={styles.rectangle3}>
          <img src="../image/mn50ercp-l1v61g2.svg" className={styles.stroke1} />
          <p className={styles.text}>行程</p>
        </div>
        <div className={styles.autoWrapper}>
          <img
            src="../image/mn50erco-t3pqu5u.svg"
            className={styles.mapInformation2}
          />
          <p className={styles.text2}>地图</p>
        </div>
        <div className={styles.autoWrapper2}>
          <img
            src="../image/mn50ercp-iw3r8xq.svg"
            className={styles.mapInformation2}
          />
          <p className={styles.text2}>我的</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
